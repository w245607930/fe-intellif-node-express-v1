import { describe, expect, it } from 'vitest';

import { buildRedisKey } from '../../src/utils/redis-key.js';

describe('buildRedisKey', () => {
  it('按统一顺序构造 Redis Key', () => {
    expect(
      buildRedisKey({
        app: 'fe-intellif',
        environment: 'test',
        domain: 'auth',
        entity: 'session',
        identifier: 'session-123',
        purpose: 'access',
      }),
    ).toBe('fe-intellif:test:auth:session:session-123:access');
  });

  it.each(['Admin', 'with space', '', 'camelCase', '中文'])('拒绝不安全 Key 片段：%s', (value) => {
    expect(() =>
      buildRedisKey({
        app: 'fe-intellif',
        environment: 'test',
        domain: value,
        entity: 'session',
        identifier: 'session-123',
      }),
    ).toThrow('domain 必须是非空小写 kebab-case 字符串');
  });
});
