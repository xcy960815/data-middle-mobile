# 项目地图

## 当前事实

- 这是一个 Expo SDK 54、React Native 0.81、React 19.1 和 TypeScript 5.9 的跨端应用，使用 pnpm 管理依赖。
- 应用入口为 `expo-router/entry`；业务路由集中在 `src/app/`，根布局为 `src/app/_layout.tsx`。
- `/` 重定向到 `/welcome`；当前业务路由包括 `/welcome`、`/login`、`/analyses`、`/analysis/[id]`、`/dashboards`、`/dashboard/[id]`、`/datasets`、`/dataset/[id]`、`/data-sources`、免登录的 `/share/analysis/[id]` 和 `/share/dashboard/[id]`，未知地址由 `src/app/+not-found.tsx` 处理。
- `src/screens/` 保存页面展示和页面内状态；`src/app/` 中的路由文件只负责编排导航。
- `src/components/BrandMark.tsx` 与 `src/components/WorkspacePreview.tsx` 是迁移业务页面共用的品牌组件。
- 分析列表已接入 DMS `/api/analysis/list`，分析详情和只读图表数据已接入 DMS `/api/analysis/detail` 与 `/api/analysis/data/query`；看板列表、看板详情和只读 widget 图表数据已接入 DMS `/api/dashboard/list`、`/api/dashboard/detail` 与 `/api/dashboard/analysis/data/query`，两个列表的搜索、排序、分页和刷新均由服务端处理，资源权限标签来自 DMS；数据集只读列表和详情预览已接入 DMS `/api/dataset/list`、`/api/dataset/detail` 与 `/api/dataset/preview/saved`；数据源只读列表已接入 DMS `/api/data-source/list`，搜索、排序、分页和刷新由服务端处理，权限标签与连接目标展示规则来自 DMS。登录已接入 DMS `/api/auth/login` 与 `/api/auth/user-info`，沿用 HttpOnly Cookie、Redis session、SM2 密码加密和设备指纹绑定。免登录分享视图已接入 DMS `/api/share/analysis/detail`、`/api/share/analysis/data/query`、`/api/share/dashboard/detail` 与 `/api/share/dashboard/analysis/data/query`，分享路由不做登录重定向；分享数据查询客户端只提交 `{analysisId, configId}`(看板额外带 `dashboardId`)，查询事实全部来自服务端当前保存配置，widget 的 `analysis` 为空表示该分析未开放分享。
- `src/features/auth/` 负责公开环境配置、安装级设备指纹、SM2 加密、统一认证请求和 React 登录态 Context。移动端不读取或持久化 JWT，Cookie 由原生网络层管理。`src/features/share/` 持分享视图的数据请求与状态 hook，复用认证模块的 SM2 加密请求，不依赖登录态。
- 样式使用 NativeWind 4、Tailwind CSS 3 和少量 React Native `StyleSheet`。全局入口为 `src/global.css`，Metro 输入路径也指向该文件。
- 应用配置保存在 `app.json`，继续沿用当前项目的名称、图标和启动图，并使用 Expo SDK 54 的新架构与 React Compiler 配置。
- Husky 在提交前运行 lint-staged，在提交信息阶段运行 Commitlint；提交信息遵循 Conventional Commits。
- ESLint 使用 Expo flat config；Prettier 负责代码格式化；TypeScript 启用严格模式。

## 目录边界

- `src/app/`：Expo Router 路由和根布局。
- `src/screens/`：页面组件和局部交互状态。
- `src/components/`：跨页面稳定复用的业务组件。
- `assets/`：Expo 图标、启动图和静态图片。
- `.agents/`：AI 协作规则，只描述当前事实和可执行约定。

## 尚未建立的能力

当前认证模块、分析列表、分析只读详情、看板列表和看板只读详情、数据集只读列表/预览、数据源只读列表和免登录分享视图已接入 DMS，但还没有通用业务 API 服务层、数据缓存、自动化测试或 CI。数据集与数据源编辑仍未迁移；引入对应能力前，先确认职责、目录和对外契约。

## 已知迁移状态

项目由标准 Expo 模板迁入数据中台移动端页面。标准模板遗留页面、组件、辅助代码和资源已清理；新增模板代码前应确认其属于当前业务功能。
