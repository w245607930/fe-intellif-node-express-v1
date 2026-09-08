import { execFileSync } from 'node:child_process';

if (process.platform === 'win32' && process.stdout.isTTY) {
  try {
    execFileSync('chcp.com', ['65001'], { stdio: 'ignore' });
  } catch {
    // 编码切换失败不应阻止应用启动，终端仍可手动执行 chcp 65001。
  }
}
