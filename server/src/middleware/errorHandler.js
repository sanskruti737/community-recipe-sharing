import multer from 'multer';
import { ApiError } from '../utils/errors.js';
import { removeUpload } from '../utils/uploads.js';

export const errorHandler = (error, req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be 5 MB or smaller.'
      : `Invalid upload: ${error.message}`;
    return res.status(400).json({ error: message });
  }

  if (req.file) removeUpload(req.file.filename);

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.details.length ? { details: error.details } : {})
    });
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Something went wrong on the server.' });
};
