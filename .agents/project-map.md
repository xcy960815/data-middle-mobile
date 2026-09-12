# 项目地图

## 当前事实

- 这是一个 Expo SDK 54、React Native 0.81、React 19.1 和 TypeScript 5.9 的跨端应用，使用 pnpm 管理依赖。
- 应用入口为 `expo-router/entry`；业务路由集中在 `src/app/`，根布局为 `src/app/_layout.tsx`。
- `/` 重定向到 `/welcome`；当前业务路由包括 `/welcome`、`/login`、`/register`、`/account`、`/analyses`、`/analysis/[id]`、`/dashboards`、`/dashboard/[id]`、`/datasets`、`/dataset/[id]`、`/data-sources`、`/data-source-edit`（id 为 query 参数，缺省为新建）、`/notifications`、`/alarm-logs`、`/email-logs`、`/login-logs`、`/email-tasks`、`/monitor`、`/knowledge`、`/knowledge/[id]`、`/resource-history/[type]/[id]`（type ∈ analysis | dashboard | dataset，configId 通过 query 参数传递）、免登录的 `/share/analysis/[id]` 和 `/share/dashboard/[id]`，未知地址由 `src/app/+not-found.tsx` 处理。
- `src/screens/` 保存页面展示和页面内状态；`src/app/` 中的路由文件只负责编排导航。
- `src/components/BrandMark.tsx` 与 `src/components/WorkspacePreview.tsx` 是迁移业务页面共用的品牌组件。
- 分析列表已接入 DMS `/api/analysis/list`，分析详情和只读图表数据已接入 DMS `/api/analysis/detail` 与 `/api/analysis/data/query`；看板列表、看板详情和只读 widget 图表数据已接入 DMS `/api/dashboard/list`、`/api/dashboard/detail` 与 `/api/dashboard/analysis/data/query`，两个列表的搜索、排序、分页和刷新均由服务端处理，资源权限标签来自 DMS；数据集只读列表和详情预览已接入 DMS `/api/dataset/list`、`/api/dataset/detail` 与 `/api/dataset/preview/saved`；数据源只读列表已接入 DMS `/api/data-source/list`，搜索、排序、分页和刷新由服务端处理，权限标签与连接目标展示规则来自 DMS。登录已接入 DMS `/api/auth/login` 与 `/api/auth/user-info`，沿用 HttpOnly Cookie、Redis session、SM2 密码加密和设备指纹绑定。免登录分享视图已接入 DMS `/api/share/analysis/detail`、`/api/share/analysis/data/query`、`/api/share/dashboard/detail` 与 `/api/share/dashboard/analysis/data/query`，分享路由不做登录重定向；分享数据查询客户端只提交 `{analysisId, configId}`(看板额外带 `dashboardId`)，查询事实全部来自服务端当前保存配置，widget 的 `analysis` 为空表示该分析未开放分享。
- `src/features/auth/` 负责公开环境配置、安装级设备指纹、SM2 加密、统一认证请求和 React 登录态 Context。移动端不读取或持久化 JWT，Cookie 由原生网络层管理。`src/features/share/` 持分享视图的数据请求与状态 hook，复用认证模块的 SM2 加密请求，不依赖登录态。`src/features/notification/` 持通知中心的数据请求与状态 hook，接口均非加密。`src/features/resource/` 持历史版本与引用影响的数据请求与状态 hook（按 type 分发到分析/看板/数据集接口），接口均非加密。
- `src/features/common/` 持两个跨 feature 公共 hook：`usePagedList`（防抖搜索、服务端排序、分页、竞态取消、追加去重、附加并行加载），分析/看板/数据集/数据源/通知五类列表复用；`useAsyncResource`（资源加载生命周期：错误归一、401 回调、reload、enabled 门控），监控快照、历史版本、引用影响与数据集详情复用。401 判定与错误消息归一工具由 `api-client.ts` 导出。
- 通知中心已接入 DMS `/api/notification/list`、`/api/notification/count`、`/api/notification/read` 与 `/api/permission/apply/list`：通知列表分页、未读数、点击未读通知先标记已读再跳转资源、我的权限申请记录，并已迁移审批操作（`POST /api/permission/apply/handle`，待我审批分组同意/拒绝）；SSE 实时推送仍以下拉刷新替代。通知入口位于各列表页 header（`onNotificationsPress` prop），账户入口（`onAccountPress`）并列。
- 详情页 403 时提供权限申请入口：`src/components/ApplyAccessCard` 查询 `GET /api/permission/apply/status` 展示申请状态，未申请时通过 `POST /api/permission/apply/create` 提交申请。分析/看板/数据集详情均已接入。
- 管理操作：`src/components/ResourceManageCard` 提供重命名、描述、公开/分享开关与删除（分析 5 项全部支持，看板与数据集仅开关与删除），对应 DMS `update-name/update-desc/share/update/public/update/delete` 端点；分析需 edit+，开关与删除需 manage。分析/看板详情在 `shareEnabled === 1` 时提供分享链接（RN Share，链接由 API 地址推导同源 Web 入口）。
- 日志与管理员工具已接入：报警日志 `/api/log/alarm/list`、邮件日志 `/api/log/email/list`（两者带 analysisId 时创建人可见，全局仅管理员）、登录日志 `/api/log/login/list` 与邮件任务 `/api/email/task/list`（仅管理员），入口位于账户页管理员工具分区；宿主机监控快照 `/api/monitor/snapshot` 与知识库只读浏览 `/api/knowledge/base/list`、`/api/knowledge/document/list` 对全部登录用户开放。
- 系统广播：欢迎页横幅接入 `/api/system-broadcast/active` 与 `/api/system-broadcast/dismiss`。
- 注册已接入 `POST /api/auth/register`（SM2 加密密码，成功不建立会话）；账户页提供登出（`POST /api/auth/logout`）。
- 数据源已支持新建/编辑/删除与连接测试（`/api/data-source/create|update|delete|test-connection`，写操作为 SM2 加密请求体），连接完整性约束与 PC 一致：托管模式禁止携带连接字段，自建模式 host/port/username 必填、创建时密码必填。
- 历史版本与引用影响已接入 DMS `/api/analysis/config/history`、`/api/dashboard/config/history`、`/api/dataset/config/history`、`/api/analysis/usage/detail` 与 `/api/dataset/usage/detail`，接口均非加密。历史版本统一路由 `/resource-history/[type]/[id]` 只展示列表并标注当前版本（query 参数 `configId`），不提供“载入草稿”；分析历史入口按 `analysisPermission` 门控为 edit/manage（服务端要求编辑权限），看板与数据集入口对 view+ 开放。引用影响以 `src/components/UsagePanel.tsx` 内嵌卡片形式展示在分析与数据集详情页，纯统计不含操作；数据集邮件任务明细仅管理员可见，受限时显示数量并附说明。
- 样式使用 NativeWind 4、Tailwind CSS 3 和少量 React Native `StyleSheet`。全局入口为 `src/global.css`，Metro 输入路径也指向该文件。
- 应用配置保存在 `app.json`，继续沿用当前项目的名称、图标和启动图，并使用 Expo SDK 54 的新架构与 React Compiler 配置。
- Husky 在提交前运行 lint-staged，在提交信息阶段运行 Commitlint；提交信息遵循 Conventional Commits。
- ESLint 使用 Expo flat config；Prettier 负责代码格式化；TypeScript 启用严格模式。

## 目录边界

- `src/app/`：Expo Router 路由和根布局。
- `src/screens/`：页面组件和局部交互状态。
- `src/components/`：跨页面稳定复用的业务组件。
- `src/utils/`：跨页面复用的纯函数（当前仅时间格式化）。
- `assets/`：Expo 图标、启动图和静态图片。
- `.agents/`：AI 协作规则，只描述当前事实和可执行约定。

## 尚未建立的能力

全部只读能力、通知审批、轻量管理操作（重命名/描述/公开/分享/删除）、数据源表单、日志与运维页均已接入 DMS，但还没有通用业务 API 服务层、数据缓存、自动化测试或 CI。仍未迁移：分析图表编辑器、看板拖拽画布、数据集 SQL 编辑、历史版本“载入草稿”、AI 助手、SSE 实时推送、知识库上传与检索操作（当前仅只读浏览）。引入对应能力前，先确认职责、目录和对外契约。

## 已知迁移状态

项目由标准 Expo 模板迁入数据中台移动端页面。标准模板遗留页面、组件、辅助代码和资源已清理；新增模板代码前应确认其属于当前业务功能。
