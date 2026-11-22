import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  getRecipes,
  getStats,
  toggleReaction,
  updateRecipe
} from '../services/recipes.js';
import { ApiError, notFound } from '../utils/errors.js';
import { removeUpload } from '../utils/uploads.js';

const visitorId = (req) => String(req.get('x-visitor-id') || 'anonymous').slice(0, 100);

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(400, 'Invalid recipe id.');
  return id;
};

const cleanFilter = (value, max = 100) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
};

export const health = (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() });

export const listRecipes = (req, res) => {
  const { search, ingredient, category, sort } = req.query;
  const recipes = getRecipes({
    search: cleanFilter(search),
    ingredient: cleanFilter(ingredient),
    category: categories.has(cleanFilter(category)) ? cleanFilter(category) : '',
    sort: ['newest', 'popular', 'quickest'].includes(sort) ? sort : 'newest',
    visitorId: visitorId(req)
  });
  res.json({ count: recipes.length, recipes });
};

const categories = new Set(['Breakfast', 'Lunch', 'Dessert', 'Vegan']);

export const getRecipe = (req, res) => {
  res.json(getRecipeById(parseId(req.params.id), visitorId(req)));
};

export const postRecipe = (req, res) => {
  const id = createRecipe(req.recipe);
  res.status(201).json(getRecipeById(id, visitorId(req)));
};

export const putRecipe = (req, res) => {
  const id = parseId(req.params.id);
  const oldImage = updateRecipe(id, req.recipe);
  if (req.file && oldImage) removeUpload(oldImage);
  res.json(getRecipeById(id, visitorId(req)));
};

export const removeRecipe = (req, res) => {
  const id = parseId(req.params.id);
  const recipe = getRecipeById(id, visitorId(req));
  deleteRecipe(id);
  if (recipe.imageFile) removeUpload(recipe.imageFile);
  res.status(204).end();
};

export const likeRecipe = (req, res) => {
  res.json({ kind: 'like', ...toggleReaction('likes', parseId(req.params.id), visitorId(req)) });
};

export const favoriteRecipe = (req, res) => {
  res.json({ kind: 'favorite', ...toggleReaction('favorites', parseId(req.params.id), visitorId(req)) });
};

export const stats = (_req, res) => res.json(getStats());

export const apiNotFound = (_req, _res, next) => next(notFound('API endpoint not found'));
