import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { config } from '../config.js';
import { ApiError } from '../utils/errors.js';
import { removeUpload } from '../utils/uploads.js';

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp']
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, config.uploadDir),
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${allowedTypes.get(file.mimetype)}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxImageBytes,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new ApiError(400, 'Only JPEG, PNG, GIF and WebP images are allowed'));
      return;
    }
    callback(null, true);
  }
});

const signatures = [
  (buffer) => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  (buffer) => ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii')),
  (buffer) => buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
];

export const verifyImageSignature = (req, _res, next) => {
  if (!req.file) return next();

  const filePath = path.resolve(config.uploadDir, req.file.filename);
  let header;
  try {
    const descriptor = fs.openSync(filePath, 'r');
    header = Buffer.alloc(12);
    fs.readSync(descriptor, header, 0, 12, 0);
    fs.closeSync(descriptor);
  } catch {
    removeUpload(req.file.filename);
    return next(new ApiError(400, 'Uploaded image could not be read'));
  }

  if (!signatures.some((matches) => matches(header))) {
    removeUpload(req.file.filename);
    delete req.file;
    return next(new ApiError(400, 'Uploaded file is not a valid image'));
  }

  return next();
};
