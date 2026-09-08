import 'dotenv/config';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { assertSafeTestDatabase } from '../src/utils/database-url.js';

const [, , command] = process.argv;
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

assertSafeTestDatabase(testDatabaseUrl, 'test');

const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
const commands = {
  migrate: [prismaCli, 'migrate', 'deploy'],
  test: [
    fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url)),
    'run',
    '--config',
    fileURLToPath(new URL('../vitest.database.config.js', import.meta.url)),
  ],
};

if (!(command in commands)) {
  throw new Error('仅支持 migrate 或 test 测试数据库命令');
}

const child = spawn(process.execPath, commands[command], {
  env: {
    ...process.env,
    NODE_ENV: 'test',
    DATABASE_URL: testDatabaseUrl,
  },
  stdio: 'inherit',
});

child.on('error', (error) => {
  process.stderr.write(`测试数据库命令启动失败：${error.message}\n`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
