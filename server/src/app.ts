import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { apiRouter } from './routes';
import { logger } from './utils/logger';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: false,
    }),
  );

  // Small JSON body limit - uploaded files never go through this API directly,
  // only metadata/references, so requests should stay small.
  app.use(express.json({ limit: '1mb' }));

  app.use((req, _res, next) => {
    logger.debug('Incoming request', { method: req.method, path: req.path });
    next();
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
