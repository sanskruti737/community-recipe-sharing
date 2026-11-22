import { db } from '../db/index.js';
import { notFound } from '../utils/errors.js';
import { imageUrl } from '../utils/uploads.js';

const selectFields = `
  r.*,
  (SELECT COUNT(*) FROM likes l WHERE l.recipe_id = r.id) AS likes_count,
  (SELECT COUNT(*) FROM favorites f WHERE f.recipe_id = r.id) AS favorites_count,
  EXISTS(SELECT 1 FROM likes l WHERE l.recipe_id = r.id AND l.visitor_id = @visitorId) AS liked_by_me,
  EXISTS(SELECT 1 FROM favorites f WHERE f.recipe_id = r.id AND f.visitor_id = @visitorId) AS favorited_by_me
`;

const formatRecipe = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  ingredients: JSON.parse(row.ingredients),
  instructions: JSON.parse(row.instructions),
  prepTime: row.prep_time,
  difficulty: row.difficulty,
  category: row.category,
  image: imageUrl(row.image),
  imageFile: row.image,
  author: row.author,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  likes: row.likes_count ?? 0,
  favorites: row.favorites_count ?? 0,
  likedByMe: Boolean(row.liked_by_me),
  favoritedByMe: Boolean(row.favorited_by_me)
});

const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

const sortClauses = {
  newest: 'r.created_at DESC, r.id DESC',
  popular: 'likes_count DESC, r.id DESC',
  quickest: 'r.prep_time ASC, r.id DESC'
};

export const getRecipes = ({ search, ingredient, category, sort = 'newest', visitorId }) => {
  const conditions = [];
  const params = { visitorId };

  if (search) {
    conditions.push("LOWER(r.title) LIKE @search ESCAPE '\\'");
    params.search = `%${escapeLike(search.toLowerCase())}%`;
  }
  if (ingredient) {
    conditions.push("LOWER(r.ingredients) LIKE @ingredient ESCAPE '\\'");
    params.ingredient = `%${escapeLike(ingredient.toLowerCase())}%`;
  }
  if (category) {
    conditions.push('r.category = @category');
    params.category = category;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = sortClauses[sort] || sortClauses.newest;
  const rows = db.prepare(`SELECT ${selectFields} FROM recipes r ${where} ORDER BY ${orderBy}`).all(params);
  return rows.map(formatRecipe);
};

export const getRecipeById = (id, visitorId) => {
  const row = db.prepare(`SELECT ${selectFields} FROM recipes r WHERE r.id = @id`).get({ id, visitorId });
  if (!row) throw notFound('Recipe not found');
  return formatRecipe(row);
};

export const createRecipe = (recipe) => {
  const result = db.prepare(`
    INSERT INTO recipes (title, description, ingredients, instructions, prep_time, difficulty, category, image, author)
    VALUES (@title, @description, @ingredients, @instructions, @prepTime, @difficulty, @category, @image, @author)
  `).run(recipe);
  return result.lastInsertRowid;
};

export const updateRecipe = (id, recipe) => {
  const current = db.prepare('SELECT image FROM recipes WHERE id = ?').get(id);
  if (!current) throw notFound('Recipe not found');

  const image = recipe.image || current.image;
  db.prepare(`
    UPDATE recipes
    SET title = @title, description = @description, ingredients = @ingredients,
        instructions = @instructions, prep_time = @prepTime, difficulty = @difficulty,
        category = @category, image = @image, author = @author, updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...recipe, image, id });

  return current.image;
};

export const deleteRecipe = (id) => {
  const result = db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
  if (result.changes === 0) throw notFound('Recipe not found');
};

export const toggleReaction = (table, id, visitorId) => {
  const allowed = table === 'likes' ? 'likes' : 'favorites';
  const exists = db.prepare('SELECT 1 FROM recipes WHERE id = ?').get(id);
  if (!exists) throw notFound('Recipe not found');

  const current = db.prepare(`SELECT 1 FROM ${allowed} WHERE recipe_id = ? AND visitor_id = ?`).get(id, visitorId);
  if (current) {
    db.prepare(`DELETE FROM ${allowed} WHERE recipe_id = ? AND visitor_id = ?`).run(id, visitorId);
  } else {
    db.prepare(`INSERT INTO ${allowed} (recipe_id, visitor_id) VALUES (?, ?)`).run(id, visitorId);
  }

  const count = db.prepare(`SELECT COUNT(*) AS count FROM ${allowed} WHERE recipe_id = ?`).get(id).count;
  return { active: !current, count };
};

export const getStats = () => db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM recipes) AS recipes,
    (SELECT COUNT(*) FROM likes) AS likes,
    (SELECT COUNT(*) FROM favorites) AS favorites
`).get();
