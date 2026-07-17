# 项目地图

## 当前事实

- 这是一个 Expo SDK 54、React Native 0.81、React 19.1 和 TypeScript 5.9 的跨端应用，使用 pnpm 管理依赖。
- 应用入口为 `expo-router/entry`；业务路由集中在 `src/app/`，根布局为 `src/app/_layout.tsx`。
- `/` 重定向到 `/welcome`；当前业务路由包括 `/welcome`、`/login`、`/analyses`、`/dashboards`，未知地址由 `src/app/+not-found.tsx` 处理。
- `/explore` 仍由标准 Expo 模板遗留文件 `src/app/explore.tsx` 生成，可以直接访问，但不属于当前数据中台业务导航。
- `src/screens/` 保存页面展示和页面内状态；`src/app/` 中的路由文件只负责编排导航。
- `src/components/BrandMark.tsx` 与 `src/components/WorkspacePreview.tsx` 是迁移业务页面共用的品牌组件。
- `src/screens/DatasetListScreen.tsx` 已存在，但当前没有对应路由或全局入口。
- 页面数据目前均为本地 mock；登录只做本地校验，尚未接入 API、真实会话、权限、缓存或持久化。
- 样式使用 NativeWind 4、Tailwind CSS 3 和少量 React Native `StyleSheet`。全局入口为 `src/global.css`，Metro 输入路径也指向该文件。
- 应用配置保存在 `app.json`，继续沿用当前项目的名称、图标和启动图，并使用 Expo SDK 54 的新架构与 React Compiler 配置。
- Husky 在提交前运行 lint-staged，在提交信息阶段运行 Commitlint；提交信息遵循 Conventional Commits。
- ESLint 使用 Expo flat config；Prettier 负责代码格式化；TypeScript 启用严格模式。

## 目录边界

- `src/app/`：Expo Router 路由和根布局。
- `src/screens/`：页面组件、页面内 mock 数据和局部交互状态。
- `src/components/`：跨页面或模板遗留组件。
- `src/hooks/`、`src/constants/`：标准 Expo 模板遗留辅助代码；当前迁移业务路由未依赖其中的大部分文件。
- `assets/`：Expo 图标、启动图和静态图片。
- `.agents/`：AI 协作规则，只描述当前事实和可执行约定。

## 尚未建立的能力

当前没有 API 服务层、真实鉴权、全局状态、持久化缓存、路由守卫、业务详情页、自动化测试或 CI。引入这些基础设施前，先确认职责、目录和对外契约。

## 已知迁移状态

项目由标准 Expo 模板迁入数据中台移动端页面。部分未被业务入口引用的 Expo 模板组件仍保留在 `src/components/`、`src/hooks/` 和 `src/constants/`，不要误认为它们属于当前业务功能；是否清理由独立任务决定。
