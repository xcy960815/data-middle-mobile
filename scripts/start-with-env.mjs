/**
 * 以指定环境变量集启动 Expo 开发服务器，供 package.json 中的 start:daily/pre/prod/pc 调用。
 *
 * 用法：pnpm start:<daily|pre|prod|pc> [Expo 参数]，第 3 个起的命令行参数原样透传给
 * `pnpm exec expo start`（如 `pnpm start:daily --clear`）。
 *
 * 参数与行为：
 * - argv[2] 为环境名，必填；读取项目根目录下的 `.env.<环境名>`，缺环境名或文件不存在时
 *   在 stderr 打印中文提示并以退出码 1 结束。
 * - 解析 .env 中 `KEY=VALUE` 行（键须为合法环境变量名，取值支持单双引号包裹；解析失败
 *   的行如注释行直接跳过），覆盖式合并进 process.env 后作为子进程环境变量。
 * - 以 `pnpm exec expo start` 启动子进程，stdio 继承当前终端；子进程退出时本脚本以相同
 *   退出码退出，被信号终止按退出码 1 处理。
 */
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
  if (!match) continue;
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
