import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import Database from 'better-sqlite3';
import supertest from 'supertest';

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'recipehaven-api-'));
process.env.DB_PATH = path.join(testRoot, 'test.db');
process.env.UPLOAD_DIR = path.join(testRoot, 'uploads');
process.env.SEED_DEMO = 'false';

const { createApp } = await import('../src/app.js');
const { config } = await import('../src/config.js');
const { db } = await import('../src/db/index.js');

const app = createApp();
const request = supertest(app);
const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da6360000000020001e221bc330000000049454e44ae426082', 'hex');

after(() => {
  db.close();
  fs.rmSync(testRoot, { recursive: true, force: true });
});

const validRecipe = (overrides = {}) => ({
  title: 'Test Garden Salad',
  description: 'A fresh and crunchy garden salad with a bright lemon dressing.',
  ingredients: ['1 cucumber', '2 tomatoes', '1 lemon'],
  instructions: ['Chop the vegetables.', 'Whisk dressing and toss.'],
  prepTime: '15',
  difficulty: 'Easy',
  category: 'Lunch',
  author: 'Test Cook',
  ...overrides
});

const sendRecipe = (method, url, data) => {
  const call = method === 'post' ? request.post(url) : request.put(url);
  Object.entries(data).forEach(([key, value]) => call.field(key, Array.isArray(value) ? value.join('\n') : String(value)));
  return call;
};

const createRecipe = async (overrides = {}) => {
  const response = await sendRecipe('post', '/api/recipes', validRecipe(overrides));
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body;
};

test('health and stats endpoints respond', async () => {
  const health = await request.get('/api/health').expect(200);
  assert.equal(health.body.status, 'ok');

  const stats = await request.get('/api/stats').expect(200);
  assert.deepEqual(stats.body, { recipes: 0, likes: 0, favorites: 0 });
});

test('creates a recipe with a valid uploaded image', async () => {
  const response = await sendRecipe('post', '/api/recipes', validRecipe())
    .attach('image', png, { filename: 'salad.png', contentType: 'image/png' })
    .expect(201);

  const recipe = response.body;
  assert.equal(recipe.title, 'Test Garden Salad');
  assert.deepEqual(recipe.ingredients, ['1 cucumber', '2 tomatoes', '1 lemon']);
  assert.equal(recipe.prepTime, 15);
  assert.match(recipe.image, /^\/uploads\/[0-9a-f-]+\.png$/);
  assert.ok(fs.existsSync(path.join(config.uploadDir, recipe.imageFile)));
});

test('rejects invalid recipe data with field-level errors', async () => {
  const response = await sendRecipe('post', '/api/recipes', validRecipe({ title: 'x', description: 'short', prepTime: '0', category: 'Dinner', difficulty: 'Impossible', ingredients: [], instructions: [] })).expect(422);
  const fields = response.body.details.map((detail) => detail.field);
  assert.deepEqual(fields, ['title', 'description', 'ingredients', 'instructions', 'prepTime', 'difficulty', 'category']);
});

test('rejects fake and oversized images safely', async () => {
  const fake = await sendRecipe('post', '/api/recipes', validRecipe())
    .attach('image', Buffer.from('this is not a png'), { filename: 'fake.png', contentType: 'image/png' })
    .expect(400);
  assert.match(fake.body.error, /not a valid image/i);

  const wrongType = await sendRecipe('post', '/api/recipes', validRecipe())
    .attach('image', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' })
    .expect(400);
  assert.match(wrongType.body.error, /Only JPEG/i);

  const oversized = await sendRecipe('post', '/api/recipes', validRecipe())
    .attach('image', Buffer.alloc(config.maxImageBytes + 1), { filename: 'big.png', contentType: 'image/png' })
    .expect(400);
  assert.match(oversized.body.error, /5 MB/i);

  const files = fs.readdirSync(config.uploadDir).filter((name) => name !== '.gitkeep');
  assert.equal(files.length, 1, 'rejected uploads must not remain on disk');
});

test('searches by title and ingredient, filters by category and sorts', async () => {
  await createRecipe({ title: 'Banana Bread', category: 'Breakfast', ingredients: ['3 bananas', '1 cup flour'], prepTime: '60' });
  await createRecipe({ title: 'Banana Smoothie', category: 'Breakfast', ingredients: ['2 bananas', '1 cup milk'], prepTime: '5' });
  await createRecipe({ title: 'Chocolate Cake', category: 'Dessert', ingredients: ['200 g chocolate', '2 eggs'], prepTime: '45' });

  const byTitle = await request.get('/api/recipes?search=banana').expect(200);
  assert.equal(byTitle.body.count, 2);
  assert.ok(byTitle.body.recipes.every((recipe) => recipe.title.toLowerCase().includes('banana')));

  const byIngredient = await request.get('/api/recipes?ingredient=chocolate').expect(200);
  assert.equal(byIngredient.body.count, 1);
  assert.equal(byIngredient.body.recipes[0].title, 'Chocolate Cake');

  const byCategory = await request.get('/api/recipes?category=Breakfast').expect(200);
  assert.equal(byCategory.body.count, 2);

  const combined = await request.get('/api/recipes?search=banana&category=Breakfast&ingredient=milk').expect(200);
  assert.equal(combined.body.count, 1);
  assert.equal(combined.body.recipes[0].title, 'Banana Smoothie');

  const quickest = await request.get('/api/recipes?sort=quickest').expect(200);
  assert.equal(quickest.body.recipes[0].title, 'Banana Smoothie');
});

test('reads a recipe, updates it and stores changes permanently', async () => {
  const created = await createRecipe();
  const detail = await request.get(`/api/recipes/${created.id}`).expect(200);
  assert.equal(detail.body.id, created.id);

  const response = await sendRecipe('put', `/api/recipes/${created.id}`, validRecipe({
    title: 'Updated Garden Salad',
    description: 'An improved crunchy salad with herbs and toasted seeds.',
    category: 'Vegan',
    difficulty: 'Medium',
    prepTime: '25'
  })).attach('image', png, { filename: 'updated.png', contentType: 'image/png' }).expect(200);

  assert.equal(response.body.title, 'Updated Garden Salad');
  assert.equal(response.body.category, 'Vegan');
  assert.equal(response.body.prepTime, 25);
  assert.notEqual(response.body.imageFile, created.imageFile);

  const persisted = new Database(config.dbPath, { readonly: true });
  const row = persisted.prepare('SELECT title, category, prep_time FROM recipes WHERE id = ?').get(created.id);
  persisted.close();
  assert.deepEqual(row, { title: 'Updated Garden Salad', category: 'Vegan', prep_time: 25 });
});

test('toggles likes and favorites and reports them in the feed', async () => {
  const created = await createRecipe();
  const firstLike = await request.post(`/api/recipes/${created.id}/like`).set('x-visitor-id', 'tester').expect(200);
  assert.deepEqual(firstLike.body, { kind: 'like', active: true, count: 1 });

  const secondLike = await request.post(`/api/recipes/${created.id}/like`).set('x-visitor-id', 'tester').expect(200);
  assert.deepEqual(secondLike.body, { kind: 'like', active: false, count: 0 });

  await request.post(`/api/recipes/${created.id}/favorite`).set('x-visitor-id', 'tester').expect(200);
  const feed = await request.get('/api/recipes?search=Garden').set('x-visitor-id', 'tester').expect(200);
  const recipe = feed.body.recipes.find((item) => item.id === created.id);
  assert.equal(recipe.favoritedByMe, true);
  assert.equal(recipe.favorites, 1);

  const stats = await request.get('/api/stats').expect(200);
  assert.equal(stats.body.favorites, 1);
});

test('deletes a recipe, its image and its reactions', async () => {
  const created = await createRecipe();
  await request.post(`/api/recipes/${created.id}/like`).set('x-visitor-id', 'tester').expect(200);
  await request.post(`/api/recipes/${created.id}/favorite`).set('x-visitor-id', 'tester').expect(200);

  await request.delete(`/api/recipes/${created.id}`).expect(204);
  await request.get(`/api/recipes/${created.id}`).expect(404);

  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM likes WHERE recipe_id = ?').get(created.id).count, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM favorites WHERE recipe_id = ?').get(created.id).count, 0);
});

test('handles invalid ids and unknown API routes', async () => {
  const badId = await request.get('/api/recipes/not-a-number').expect(400);
  assert.match(badId.body.error, /Invalid recipe id/);

  const missing = await request.get('/api/recipes/999999').expect(404);
  assert.equal(missing.body.error, 'Recipe not found');

  const unknown = await request.get('/api/does-not-exist').expect(404);
  assert.equal(unknown.body.error, 'API endpoint not found');
});
