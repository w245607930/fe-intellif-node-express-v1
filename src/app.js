import crypto from 'node:crypto';

import express from 'express';
import pinoHttp from 'pino-http';

import { logger } from './config/logger.js';
import { errorHandler } from './middlewares/error.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { apiRouter } from './routes/index.js';

export function createApp({ configureRoutes } = {}) {
  const application = express();

  application.disable('x-powered-by');
  application.use(
    pinoHttp({
      logger,
      genReqId(request, response) {
        const requestId = request.headers['x-request-id'] || crypto.randomUUID();
        response.setHeader('x-request-id', requestId);
        return requestId;
      },
    }),
  );
  application.use(express.json({ limit: '1mb' }));
  application.use(express.urlencoded({ extended: false, limit: '1mb' }));

  application.use('/api/v1', apiRouter);
  configureRoutes?.(application);
  application.use(notFoundHandler);
  application.use(errorHandler);

  return application;
}

export const app = createApp();
