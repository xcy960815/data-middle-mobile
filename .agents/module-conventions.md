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

- `src/features/auth/` 接入 DMS 登录、当前用户和登出接口；`src/features/analysis/` 与 `src/features/dashboard/` 分别接入分析、看板列表接口并管理搜索、排序、分页、刷新和请求取消。分析详情、分析数据查询、看板详情、看板 widget 数据和数据集仍未接入，也没有业务缓存层。
- 新增请求、鉴权、持久化、缓存或全局状态前先确认目录和契约。
- 异步页面需要明确加载、空数据、失败、重复触发和取消行为；不得吞掉错误。

## 配置与资源

- `app.json` 管理应用标识和平台资源；修改前确认平台影响。
- NativeWind 配置由 `babel.config.js`、`metro.config.js`、`tailwind.config.js`、`src/global.css` 和 `nativewind-env.d.ts` 共同组成。
- 不提交密钥、真实凭据、本地环境文件或设备私有配置。
