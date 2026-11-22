import { Router } from 'express';
import {
  apiNotFound,
  favoriteRecipe,
  getRecipe,
  health,
  likeRecipe,
  listRecipes,
  postRecipe,
  putRecipe,
  removeRecipe,
  stats
} from '../controllers/recipes.js';
import { upload, verifyImageSignature } from '../middleware/upload.js';
import { validateRecipe } from '../middleware/validateRecipe.js';

const router = Router();

router.get('/health', health);
router.get('/stats', stats);
router.get('/recipes', listRecipes);
router.get('/recipes/:id', getRecipe);
router.post('/recipes', upload.single('image'), verifyImageSignature, validateRecipe, postRecipe);
router.put('/recipes/:id', upload.single('image'), verifyImageSignature, validateRecipe, putRecipe);
router.delete('/recipes/:id', removeRecipe);
router.post('/recipes/:id/like', likeRecipe);
router.post('/recipes/:id/favorite', favoriteRecipe);
router.use(apiNotFound);

export default router;
