# 数据中台移动端

基于 Expo SDK 54、React Native、Expo Router 和 NativeWind 构建的数据中台跨端应用。

本项目的业务功能迁移自 PC 数据中台项目 `/Users/opera/Documents/my-repositories/data-middle-station`。迁移来源与边界参见 [`docs/project-origin.md`](docs/project-origin.md)。

## 环境要求

- Node.js 22
- pnpm 10.33.0

项目统一使用 pnpm。不要使用 npm、Yarn 或 Bun 安装依赖，也不要生成其他锁文件。

## 开始开发

```bash
pnpm install
pnpm start
```

平台命令：

```bash
pnpm ios
pnpm android
pnpm web
```

## 代码质量

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm validate
```

提交前由 Husky 和 lint-staged 自动格式化并检查暂存代码；提交信息使用 Conventional Commits，并由 Commitlint 校验。

## 项目结构

- `src/app/`：Expo Router 路由。
- `src/screens/`：页面组件和页面内状态。
- `src/components/`：共享组件。
- `assets/`：应用图标、启动图和静态资源。
- `.agents/`：项目协作边界和验证规则。

修改 Expo 或 Expo Router 相关代码前，请查阅 [Expo SDK 54 文档](https://docs.expo.dev/versions/v54.0.0/)。
