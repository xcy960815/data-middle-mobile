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

## DMS 登录配置

复制环境变量模板并填写 DMS 地址与 SM2 公钥：

```bash
cp .env.example .env
```

- `EXPO_PUBLIC_DMS_API_URL`：DMS 服务地址。真机不能使用 `localhost`，应填写手机可以访问的局域网地址或 HTTPS 域名。
- `EXPO_PUBLIC_DMS_SM2_PUBLIC_KEY`：与 DMS 的 `SM2_PUBLIC_KEY` 保持一致；这是公钥，可以进入客户端构建，但不能填写服务端私钥。

移动端登录继续使用 DMS 的 HttpOnly `BearerToken` Cookie、Redis session 和 `X-Device-Fingerprint` 设备绑定。首次接入时应在真机上确认：登录接口成功后，`/api/auth/user-info` 也能成功返回当前用户。

分析列表使用 DMS `POST /api/analysis/list`，看板列表使用 DMS `POST /api/dashboard/list`。真机联调时，DMS 需要监听局域网可访问地址，例如：

```bash
pnpm dev:pre --host 0.0.0.0
```

修改移动端 `.env` 后，清理 Metro 缓存并重新启动：

```bash
pnpm start -- --clear
```

分析与看板列表的搜索、排序、分页和下拉刷新均由 DMS 服务端处理，资源权限也以服务端返回为准；分析详情、分析数据查询、看板详情和看板 widget 数据尚未接入。

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
- `src/features/auth/`：DMS 登录、SM2、设备指纹、Cookie 会话和当前用户状态。
- `src/features/analysis/`：DMS 分析列表请求、类型和列表异步状态。
- `src/features/dashboard/`：DMS 看板列表请求、类型和列表异步状态。
- `assets/`：应用图标、启动图和静态资源。
- `.agents/`：项目协作边界和验证规则。

修改 Expo 或 Expo Router 相关代码前，请查阅 [Expo SDK 54 文档](https://docs.expo.dev/versions/v54.0.0/)。
