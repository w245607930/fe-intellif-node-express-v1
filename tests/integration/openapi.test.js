import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../../src/app.js';

describe('OpenAPI contract', () => {
  it('serves the machine-readable document and Swagger UI', async () => {
    const document = await request(app).get('/api/v1/openapi.json').expect(200);
    expect(document.body.openapi).toBe('3.0.3');
    expect(document.body.paths['/auth/login']).toBeDefined();
    expect(document.body.paths['/rbac/role-permissions'].post.security).toEqual([
      { bearerAuth: [] },
    ]);
    await request(app).get('/api/v1/docs/').expect(200);
  });
});
