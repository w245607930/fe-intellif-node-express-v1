export const openApiDocument = Object.freeze({
  openapi: '3.0.3',
  info: {
    title: 'FE Intellif API',
    version: '0.1.0',
    description: 'Versioned authentication, user and RBAC APIs.',
  },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Health' }, { name: 'Auth' }, { name: 'Users' }, { name: 'RBAC' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Success: {
        type: 'object',
        required: ['code', 'message', 'data'],
        properties: {
          code: { type: 'integer', example: 0 },
          message: { type: 'string' },
          data: {},
        },
      },
      Error: {
        type: 'object',
        required: ['code', 'message', 'data'],
        properties: {
          code: { type: 'integer', example: 40100 },
          message: { type: 'string', example: '请求被拒绝' },
          data: { nullable: true, example: null },
          requestId: { type: 'string', format: 'uuid' },
        },
      },
      Credentials: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 64, example: 'alice' },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', minLength: 12, example: 'StrongPassword123' },
        },
      },
      Login: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', example: 'alice' },
          password: { type: 'string', example: 'StrongPassword123' },
        },
      },
      Refresh: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string', minLength: 20 } },
      },
      Role: {
        type: 'object',
        required: ['code', 'name'],
        properties: {
          code: { type: 'string', pattern: '^[a-z][a-z0-9-]*$', example: 'operator' },
          name: { type: 'string', example: 'Operator' },
          description: { type: 'string' },
        },
      },
      Permission: {
        type: 'object',
        required: ['code', 'name'],
        properties: {
          code: {
            type: 'string',
            pattern: '^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$',
            example: 'user:list',
          },
          name: { type: 'string', example: 'List users' },
          description: { type: 'string' },
        },
      },
      Assignment: {
        type: 'object',
        required: ['userId', 'roleId'],
        properties: { userId: { type: 'string' }, roleId: { type: 'string' } },
      },
      RolePermission: {
        type: 'object',
        required: ['roleId', 'permissionId'],
        properties: { roleId: { type: 'string' }, permissionId: { type: 'string' } },
      },
    },
  },
  paths: {
    '/health/live': {
      get: {
        tags: ['Health'],
        responses: { 200: { description: 'Process is alive' } },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        responses: {
          200: { description: 'Dependencies are ready' },
          503: { description: 'Dependency unavailable' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
        },
        responses: {
          201: { description: 'Registered' },
          400: { description: 'Validation failed' },
          409: { description: 'Identifier conflict' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } },
        },
        responses: {
          200: { description: 'Authenticated' },
          401: { description: 'Invalid credentials' },
          429: { description: 'Rate limited' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Refresh' } } },
        },
        responses: {
          200: { description: 'Token rotated' },
          401: { description: 'Invalid or replayed token' },
          429: { description: 'Rate limited' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Refresh' } } },
        },
        responses: {
          200: { description: 'Session revoked' },
          401: { description: 'Unauthenticated' },
        },
      },
    },
    '/auth/logout-all': {
      post: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sessions revoked' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current user' } },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          200: { description: 'Paginated users' },
          403: { description: 'Missing user:list permission' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User details' }, 404: { description: 'User not found' } },
      },
    },
    '/rbac/roles': {
      get: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Roles' } },
      },
      post: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } },
        },
        responses: { 201: { description: 'Role created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/rbac/roles/{id}': {
      patch: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } },
        },
        responses: { 200: { description: 'Role updated' }, 403: { description: 'Forbidden' } },
      },
      delete: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Role deleted' }, 403: { description: 'Forbidden' } },
      },
    },
    '/rbac/permissions': {
      get: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Permissions' } },
      },
      post: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Permission' } } },
        },
        responses: {
          201: { description: 'Permission created' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/rbac/role-permissions': {
      post: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RolePermission' } },
          },
        },
        responses: { 200: { description: 'Binding created' } },
      },
      delete: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RolePermission' } },
          },
        },
        responses: { 200: { description: 'Binding revoked' } },
      },
    },
    '/rbac/user-roles': {
      post: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Assignment' } } },
        },
        responses: { 200: { description: 'Role assigned' } },
      },
      delete: {
        tags: ['RBAC'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Assignment' } } },
        },
        responses: { 200: { description: 'Role revoked' } },
      },
    },
  },
});
