import { ApiError } from '../utils/errors.js';
import { removeUpload } from '../utils/uploads.js';
import { categories, difficulties } from '../config.js';

const parseList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [trimmed];
    }
  }
  return trimmed.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
};

const cleanText = (value) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '');

export const validateRecipe = (req, _res, next) => {
  const errors = [];
  const addError = (field, message) => errors.push({ field, message });

  const title = cleanText(req.body.title);
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  const ingredients = parseList(req.body.ingredients);
  const instructions = parseList(req.body.instructions);
  const prepTime = Number(req.body.prepTime);
  const difficulty = cleanText(req.body.difficulty);
  const category = cleanText(req.body.category);
  const author = cleanText(req.body.author) || 'Anonymous';

  if (title.length < 3 || title.length > 100) addError('title', 'Title must be between 3 and 100 characters.');
  if (description.length < 10 || description.length > 2000) addError('description', 'Description must be between 10 and 2000 characters.');
  if (ingredients.length === 0) addError('ingredients', 'Add at least one ingredient.');
  if (ingredients.length > 40) addError('ingredients', 'Use no more than 40 ingredients.');
  if (ingredients.some((item) => item.length > 150)) addError('ingredients', 'Each ingredient must be 150 characters or fewer.');
  if (instructions.length === 0) addError('instructions', 'Add at least one cooking instruction.');
  if (instructions.length > 30) addError('instructions', 'Use no more than 30 instructions.');
  if (instructions.some((item) => item.length > 500)) addError('instructions', 'Each instruction must be 500 characters or fewer.');
  if (!Number.isInteger(prepTime) || prepTime < 1 || prepTime > 10080) addError('prepTime', 'Preparation time must be between 1 and 10080 minutes.');
  if (!difficulties.includes(difficulty)) addError('difficulty', `Difficulty must be one of: ${difficulties.join(', ')}.`);
  if (!categories.includes(category)) addError('category', `Category must be one of: ${categories.join(', ')}.`);
  if (author.length < 2 || author.length > 50) addError('author', 'Author name must be between 2 and 50 characters.');

  if (errors.length > 0) {
    if (req.file) removeUpload(req.file.filename);
    return next(new ApiError(422, 'Please correct the highlighted fields.', errors));
  }

  req.recipe = {
    title,
    description,
    ingredients: JSON.stringify(ingredients),
    instructions: JSON.stringify(instructions),
    prepTime,
    difficulty,
    category,
    author,
    image: req.file?.filename || null
  };

  return next();
};
