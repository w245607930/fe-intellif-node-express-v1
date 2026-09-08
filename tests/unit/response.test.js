import { describe, expect, it } from 'vitest';

import { failure, paginated, success } from '../../src/utils/response.js';

describe('response utilities', () => {
  it('builds a successful response', () => {
    expect(success({ id: 1 })).toEqual({
      code: 0,
      message: 'success',
      data: { id: 1 },
    });
  });

  it('builds a failure response without undefined optional fields', () => {
    expect(failure({ code: 50000, message: '服务器内部错误' })).toEqual({
      code: 50000,
      message: '服务器内部错误',
      data: null,
    });
  });

  it('builds a paginated response', () => {
    expect(paginated({ list: [{ id: 1 }], total: 1, page: 1, pageSize: 20 })).toEqual({
      code: 0,
      message: 'success',
      data: { list: [{ id: 1 }], total: 1, page: 1, pageSize: 20 },
    });
  });
});
