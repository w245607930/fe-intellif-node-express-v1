const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function assertSafeTestDatabase(databaseUrl, nodeEnv = process.env.NODE_ENV) {
  if (nodeEnv !== 'test') {
    throw new Error('数据库清理仅允许在 NODE_ENV=test 时执行');
  }

  if (!databaseUrl) {
    throw new Error('测试数据库地址未配置');
  }

  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error('测试数据库地址格式无效');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const databaseName = decodeURIComponent(url.pathname.slice(1));

  if (url.protocol !== 'mysql:') {
    throw new Error('测试数据库必须使用 MySQL');
  }

  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error('测试数据库必须位于本机');
  }

  if (!databaseName || !/(^|[_-])test($|[_-])/i.test(databaseName)) {
    throw new Error('测试数据库名称必须包含独立的 test 标识');
  }

  return true;
}
