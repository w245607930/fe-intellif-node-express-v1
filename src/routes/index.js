import { Router } from 'express';

import { healthRouter } from '../modules/health/health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { userRouter } from '../modules/rbac/user.routes.js';
import { rbacRouter } from '../modules/rbac/rbac.routes.js';
import { docsRouter } from '../modules/docs/docs.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/rbac', rbacRouter);
apiRouter.use('/', docsRouter);
