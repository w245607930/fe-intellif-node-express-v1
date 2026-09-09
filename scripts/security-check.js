import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => !file.endsWith('.env.example'))
  .filter((file) => !file.startsWith('tests/'));
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /(?:api[_-]?key|access[_-]?token|refresh[_-]?token|jwt[_-]?secret)\s*[:=]\s*['"][^'"]{20,}['"]/i,
  /(?:mysql|postgres(?:ql)?|redis):\/\/[^\s:@]+:[^\s@]+@/i,
];
const findings = [];
for (const file of trackedFiles) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of secretPatterns) if (pattern.test(content)) findings.push(file);
}
if (findings.length) {
  process.stderr.write(
    `Potential secrets found in tracked files: ${[...new Set(findings)].join(', ')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(`Secret scan passed (${trackedFiles.length} tracked files checked)\n`);
}
