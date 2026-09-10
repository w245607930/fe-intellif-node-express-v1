import { describe, expect, it } from 'vitest';

import { paginationSchema } from '../../src/modules/rbac/user.schema.js';

describe('user pagination schema', () => {
  it('applies safe defaults and coerces query strings', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(paginationSchema.parse({ page: '2', pageSize: '50' })).toEqual({
      page: 2,
      pageSize: 50,
    });
  });

  it.each([{ page: '0' }, { pageSize: '101' }, { page: 'nope' }])(
    'rejects invalid pagination input %#',
    (input) => {
      expect(() => paginationSchema.parse(input)).toThrow();
    },
  );
});
