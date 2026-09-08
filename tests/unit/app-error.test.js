import { describe, expect, it } from 'vitest';

import { AppError } from '../../src/errors/app-error.js';

describe('AppError', () => {
  it('preserves public error metadata and cause', () => {
    const cause = new Error('database unavailable');
    const error = new AppError({
      statusCode: 503,
      code: 50300,
      message: '服务暂不可用',
      details: { retryable: true },
      cause,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      name: 'AppError',
      statusCode: 503,
      code: 50300,
      message: '服务暂不可用',
      details: { retryable: true },
      isOperational: true,
      cause,
    });
  });
});
