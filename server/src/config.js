import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const resolveFromRoot = (value, fallback) => {
  const target = value || fallback;
  return path.isAbsolute(target) ? target : path.resolve(rootDir, target);
};

export const config = {
  rootDir,
  port: Number(process.env.PORT) || 5000,
  dbPath: resolveFromRoot(process.env.DB_PATH, 'server/data/recipes.db'),
  uploadDir: resolveFromRoot(process.env.UPLOAD_DIR, 'server/uploads'),
  clientDist: path.join(rootDir, 'client/dist'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  maxImageBytes: (Number(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024
};

export const categories = ['Breakfast', 'Lunch', 'Dessert', 'Vegan'];
export const difficulties = ['Easy', 'Medium', 'Hard'];
