import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../../src/app.js';

describe('health endpoints', () => {
  it('returns liveness status', async () => {
    const response = await request(app).get('/api/v1/health/live').expect(200);

    expect(response.body).toEqual({
      code: 0,
      message: 'success',
      data: { status: 'ok' },
    });
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('returns the standard response for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown').expect(404);

    expect(response.body).toMatchObject({
      code: 40400,
      message: '接口不存在',
      data: null,
    });
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });
});
