import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

export const imageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('/') || filename.startsWith('http')) return filename;
  return `/uploads/${filename}`;
};

export const removeUpload = (filename) => {
  if (!filename) return;
  const target = path.resolve(config.uploadDir, path.basename(filename));
  if (target.startsWith(config.uploadDir + path.sep) && fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
};
