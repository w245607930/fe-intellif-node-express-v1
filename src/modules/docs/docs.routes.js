import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from '../../config/openapi.js';

export const docsRouter = Router();
docsRouter.get('/openapi.json', (_request, response) => response.json(openApiDocument));
docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }));
