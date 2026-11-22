import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import routes from './routes/recipes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './utils/errors.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: config.clientUrl }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use('/uploads', express.static(config.uploadDir, { fallthrough: true, index: false }));

  app.use('/api', routes);
  app.use('/api', (_req, _res, next) => next(notFound('API endpoint not found')));

  if (fs.existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist));
    app.get(/.*/, (_req, res) => res.sendFile(`${config.clientDist}/index.html`));
  }

  app.use(errorHandler);
  return app;
};
