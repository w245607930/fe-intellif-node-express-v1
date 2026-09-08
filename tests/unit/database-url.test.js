import { describe, expect, it } from 'vitest';
import { assertSafeTestDatabase } from '../../src/utils/database-url.js';

describe('assertSafeTestDatabase', () => {
  it('接受本机独立测试数据库', () => {
    expect(assertSafeTestDatabase('mysql://user:password@localhost:3306/app_test', 'test')).toBe(
      true,
    );
  });

  it('接受本机 IPv6 测试数据库', () => {
    expect(assertSafeTestDatabase('mysql://user:password@[::1]:3306/app_test', 'test')).toBe(true);
  });

  it.each([
    ['非测试环境', 'mysql://user:password@localhost:3306/app_test', 'development'],
    ['远程主机', 'mysql://user:password@db.example.com:3306/app_test', 'test'],
    ['无测试标识库名', 'mysql://user:password@localhost:3306/app', 'test'],
    ['非 MySQL 协议', 'postgresql://user:password@localhost:5432/app_test', 'test'],
    ['缺少地址', undefined, 'test'],
    ['非法地址', 'not-a-database-url', 'test'],
    ['私网主机', 'mysql://user:password@192.168.1.10:3306/app_test', 'test'],
    ['非独立测试标识', 'mysql://user:password@localhost:3306/contest', 'test'],
  ])('拒绝%s', (_, databaseUrl, nodeEnv) => {
    expect(() => assertSafeTestDatabase(databaseUrl, nodeEnv)).toThrow();
  });

  it('错误消息不回显连接信息', () => {
    const databaseUrl = 'mysql://secret-user:secret-password@example.com:3306/app_test';

    expect(() => assertSafeTestDatabase(databaseUrl, 'test')).toThrow('测试数据库必须位于本机');
    try {
      assertSafeTestDatabase(databaseUrl, 'test');
    } catch (error) {
      expect(error.message).not.toContain('secret-user');
      expect(error.message).not.toContain('secret-password');
    }
  });
});
