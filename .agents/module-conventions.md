# 模块实现约定

## Expo 与路由

- 修改 Expo、Expo Router 或原生能力前，先阅读 Expo SDK 54 的精确版本文档：<https://docs.expo.dev/versions/v54.0.0/>。
- 路由文件放在 `src/app/`，只编排导航和页面级依赖；展示逻辑放在 `src/screens/`。
- 新增路由、菜单、守卫、重定向或深链接前遵循 `decision-gates.md`。
- 不要新增根级 `app/` 目录；当前 Expo Router 目录为 `src/app/`。

## 组件与样式

- React 组件使用 PascalCase，文件名与导出组件名保持一致。
- 只在至少两个稳定使用点存在时提取公共组件；单页面组件靠近所属 screen。
- 新增静态样式优先使用 NativeWind `className`；运行时尺寸、图表坐标和数据驱动颜色可使用局部 `style`。
- 条件类名必须写为完整的可静态扫描字符串，不拼接 Tailwind 类名片段。
- `ScrollView` 的静态容器样式使用 `contentContainerClassName`，动态值使用 `contentContainerStyle`。
- 新交互应提供可访问名称、清晰的禁用或加载状态，并考虑 iOS、Android、Web 差异。

## 数据与异步逻辑

- `src/features/auth/` 接入 DMS 登录、注册（SM2 加密密码）、当前用户和登出接口；`src/features/analysis/` 接入分析列表、分析详情、只读图表数据、分析历史版本、分析引用影响与轻量管理接口（改名/描述/公开/分享/删除），并管理搜索、排序、分页、刷新、请求取消和详情加载；`src/features/dashboard/` 接入看板列表、看板详情、只读 widget 数据、看板历史版本与管理接口（公开/分享/删除），并管理搜索、排序、分页、刷新、请求取消和详情加载；`src/features/dataset/` 接入数据集只读列表、详情、预览数据、数据集历史版本、数据集引用影响与管理接口（公开/删除）；`src/features/data-source/` 接入数据源列表、详情、新建、编辑、删除与连接测试接口（写操作为 SM2 加密请求体，连接完整性约束与 PC 一致），并管理搜索、排序、分页、刷新和请求取消；`src/features/share/` 接入免登录分享视图的分析/看板详情与加密数据查询接口，不依赖登录态，401 不跳转登录；`src/features/notification/` 接入通知列表、未读数、标记已读、我的权限申请、审批操作与申请创建/状态查询接口，接口均非加密；`src/features/resource/` 聚合历史版本与引用影响 hook（`use-resource-history` 按 type 分发，`use-resource-usage` 复用稳定的模块级 fetcher 引用并支持按权限门控拉取），接口均非加密；`src/features/log/` 接入报警/邮件/登录日志与邮件任务接口；`src/features/monitor/` 接入宿主机监控快照；`src/features/knowledge/` 接入知识库与文档只读列表；`src/features/broadcast/` 接入系统广播 active 与 dismiss；`src/features/common/` 持跨 feature 的通用分页列表 hook `usePagedList`（含排序、页大小、追加去重与附加并行加载）与资源加载生命周期 hook `useAsyncResource`（竞态取消、错误归一、401 回调、reload 与 enabled 门控）。跨详情页复用的引用影响卡片为 `src/components/UsagePanel.tsx`，管理操作卡片为 `src/components/ResourceManageCard.tsx`，权限申请卡片为 `src/components/ApplyAccessCard.tsx`。还没有业务缓存层。
- 新增请求、鉴权、持久化、缓存或全局状态前先确认目录和契约。
- 异步页面需要明确加载、空数据、失败、重复触发和取消行为；不得吞掉错误。

## 配置与资源

- `app.json` 管理应用标识和平台资源；修改前确认平台影响。
- NativeWind 配置由 `babel.config.js`、`metro.config.js`、`tailwind.config.js`、`src/global.css` 和 `nativewind-env.d.ts` 共同组成。
- 不提交密钥、真实凭据、本地环境文件或设备私有配置。
