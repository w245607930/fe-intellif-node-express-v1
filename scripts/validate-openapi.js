import { openApiDocument } from '../src/config/openapi.js';
import { ERROR_CODES } from '../src/constants/error-codes.js';

const requiredPaths = [
  '/health/live',
  '/health/ready',
  '/auth/register',
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/logout-all',
  '/auth/me',
  '/users',
  '/users/{id}',
  '/rbac/roles',
  '/rbac/roles/{id}',
  '/rbac/permissions',
  '/rbac/role-permissions',
  '/rbac/user-roles',
];
const missing = requiredPaths.filter((path) => !openApiDocument.paths[path]);
if (
  missing.length ||
  openApiDocument.openapi !== '3.0.3' ||
  !openApiDocument.components.securitySchemes.bearerAuth
)
  throw new Error(`OpenAPI contract validation failed: ${missing.join(', ')}`);
if (new Set(Object.values(ERROR_CODES)).size !== Object.keys(ERROR_CODES).length)
  throw new Error('Error code values must be unique');
process.stdout.write(
  `OpenAPI contract passed (${requiredPaths.length} paths, ${Object.keys(ERROR_CODES).length} error codes)\n`,
);
