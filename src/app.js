import crypto from 'node:crypto';

import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { createCorsMiddleware, parseAllowedOrigins } from './middlewares/cors.js';
import { errorHandler } from './middlewares/error.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { createRequestTimeoutMiddleware } from './middlewares/request-timeout.js';
import { apiRouter } from './routes/index.js';

export function createApp({ configureRoutes } = {}) {
  const application = express();

  application.disable('x-powered-by');
  application.set('trust proxy', env.TRUST_PROXY_HOPS);
  application.use(
    pinoHttp({
      logger,
      genReqId(request, response) {
        const requestId = request.headers['x-request-id'] || crypto.randomUUID();
        response.setHeader('x-request-id', requestId);
        return requestId;
      },
      customSuccessObject(request, _response, logObject) {
        return { ...logObject, ...(request.user?.id ? { userId: request.user.id } : {}) };
      },
      customErrorObject(request, _response, error, logObject) {
        return {
          ...logObject,
          ...(request.user?.id ? { userId: request.user.id } : {}),
          err: error,
        };
      },
    }),
  );
  application.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  application.use(createCorsMiddleware({ allowedOrigins: parseAllowedOrigins(env.CORS_ORIGINS) }));
  application.use(createRequestTimeoutMiddleware(env.REQUEST_TIMEOUT_MS));
  application.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
  application.use(express.urlencoded({ extended: false, limit: env.REQUEST_BODY_LIMIT }));

  application.use('/api/v1', apiRouter);
  configureRoutes?.(application);
  application.use(notFoundHandler);
  application.use(errorHandler);

  return application;
}

export const app = createApp();
