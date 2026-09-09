import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../../src/app.js';

describe('security middleware', () => {
  it('sets security headers and allows configured origins', async () => {
    const response = await request(app)
      .get('/api/v1/health/live')
      .set('Origin', 'http://localhost:3000')
      .expect(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('rejects origins outside the allowlist', async () => {
    const response = await request(app)
      .get('/api/v1/health/live')
      .set('Origin', 'https://untrusted.example')
      .expect(403);
    expect(response.body.code).toBe(40300);
  });
});
