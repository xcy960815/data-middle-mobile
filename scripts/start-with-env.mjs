import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const environment = process.argv[2];
const expoArgs = process.argv.slice(3);

if (!environment) {
  console.error('用法：pnpm start:<daily|pre|prod|pc> [Expo 参数]');
  process.exit(1);
}

const envPath = resolve(process.cwd(), `.env.${environment}`);
let envText;
try {
  envText = readFileSync(envPath, 'utf8');
} catch {
  console.error(`找不到环境文件：${envPath}`);
  process.exit(1);
}

const environmentVariables = { ...process.env };
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (!match || match[1].startsWith('#')) continue;
  environmentVariables[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(command, ['exec', 'expo', 'start', ...expoArgs], {
  cwd: process.cwd(),
  env: environmentVariables,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 1));
});
