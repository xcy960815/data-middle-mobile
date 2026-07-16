# 命令

## 包管理

- 只使用 pnpm；不要使用 npm、yarn 或 bun，也不要重新生成 `package-lock.json`。
- 安装依赖：`pnpm install`。
- 当前项目声明使用 `pnpm@10.33.0`。

## 开发

- `pnpm start`：启动 Expo 开发服务器。
- `pnpm ios`：通过 Expo 启动 iOS。
- `pnpm android`：通过 Expo 启动 Android。
- `pnpm web`：启动 Web 开发服务器。

## 验证

- `pnpm typecheck`：运行 TypeScript 严格类型检查。
- `pnpm lint`：运行 ESLint。
- `pnpm format`：使用 Prettier 写入格式化结果。
- `pnpm format:check`：检查格式但不写入。
- `pnpm validate`：依次执行格式、ESLint 和 TypeScript 检查。
- `pnpm exec expo export --platform web`：验证 Expo Router、Metro、Babel 和 NativeWind 的 Web 构建链路。

当前没有自动化测试脚本，不要声称测试通过。

## 提交门禁

- `.husky/pre-commit` 调用 lint-staged，对暂存的 JS、TS、TSX 文件运行 Prettier 和 ESLint 修复。
- `.husky/commit-msg` 调用 Commitlint，校验 Conventional Commits 提交信息。
- 可用 `pnpm commitmsg --edit <commit-message-file>` 手动验证提交信息。
