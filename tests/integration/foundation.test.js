import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../../src/app.js';
import { validate } from '../../src/middlewares/validate.js';
import { success } from '../../src/utils/response.js';

const app = createApp({
  configureRoutes(application) {
    application.get('/test/sync-error', () => {
      throw new Error('sensitive internal error');
    });

    application.get('/test/async-error', async () => {
      await Promise.resolve();
      throw new Error('async sensitive internal error');
    });

    application.post(
      '/test/validate/:id',
      express.json(),
      validate({
        body: z.object({ name: z.string().trim().min(2) }),
        query: z.object({ page: z.coerce.number().int().positive() }),
        params: z.object({ id: z.coerce.number().int().positive() }),
        headers: z.object({ 'x-client-id': z.string().uuid() }).passthrough(),
      }),
      (req, res) => res.json(success(req.validated)),
    );
  },
});

describe('HTTP foundation', () => {
  it('passes through a client request ID', async () => {
    const requestId = 'client-request-id';
    const response = await request(app)
      .get('/api/v1/health/live')
      .set('x-request-id', requestId)
      .expect(200);

    expect(response.headers['x-request-id']).toBe(requestId);
  });

  it.each(['/test/sync-error', '/test/async-error'])(
    'handles unexpected errors from %s',
    async (path) => {
      const response = await request(app).get(path).expect(500);

      expect(response.body).toMatchObject({
        code: 50000,
        message: '服务器内部错误',
        data: null,
      });
      expect(JSON.stringify(response.body)).not.toContain('sensitive internal error');
      expect(response.body.requestId).toBe(response.headers['x-request-id']);
    },
  );

  it('returns parsed values from every validated request source', async () => {
    const response = await request(app)
      .post('/test/validate/42?page=2')
      .set('x-client-id', '550e8400-e29b-41d4-a716-446655440000')
      .send({ name: ' Alice ' })
      .expect(200);

    expect(response.body.data).toMatchObject({
      body: { name: 'Alice' },
      query: { page: 2 },
      params: { id: 42 },
      headers: { 'x-client-id': '550e8400-e29b-41d4-a716-446655440000' },
    });
  });

  it('returns stable details for validation failures', async () => {
    const response = await request(app)
      .post('/test/validate/not-a-number?page=0')
      .set('x-client-id', 'invalid')
      .send({ name: '' })
      .expect(400);

    expect(response.body).toMatchObject({
      code: 40001,
      message: '请求参数校验失败',
      data: null,
    });
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'body', path: 'name' }),
        expect.objectContaining({ source: 'query', path: 'page' }),
        expect.objectContaining({ source: 'params', path: 'id' }),
        expect.objectContaining({ source: 'headers', path: 'x-client-id' }),
      ]),
    );
  });

  it('normalizes malformed JSON errors', async () => {
    const response = await request(app)
      .post('/test/validate/1?page=1')
      .set('content-type', 'application/json')
      .send('{ invalid json')
      .expect(400);

    expect(response.body).toMatchObject({
      code: 40002,
      message: '请求体不是有效的 JSON',
      data: null,
    });
  });
});
