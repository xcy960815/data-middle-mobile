# Android 发布流程

发布链路：推送 `v*` 格式的 tag → GitHub Actions 运行 `.github/workflows/release-android.yml` → `pnpm validate` 校验 → EAS 云端构建 Android APK → 到 expo.dev 项目 Builds 页面下载 APK。

## 一次性配置（已于 2026-09-13 完成）

以下步骤已执行完毕，保留在此作为记录；更换账号或令牌失效时按同样步骤重做。

### 1. 关联 Expo 项目（eas init）✅

已执行 `eas init --account xcy960815`，项目为 `@xcy960815/data-middle-mobile`，`projectId: e485c13a-de8d-4cb1-a00a-854e11e99639`（已写入 `app.json` 的 `extra.eas.projectId`）。项目主页：<https://expo.dev/accounts/xcy960815/projects/data-middle-mobile>。

### 2. 配置 GitHub Secret ✅

已通过 `gh secret set EXPO_TOKEN` 写入仓库 Secret。令牌名为 `github-actions-data-middle-mobile`，创建于 expo.dev → Account Settings → Access Tokens；令牌值只在创建时展示一次，失效或泄露时在 expo.dev 撤销后重建并重新 `gh secret set`。

### 3. 配置构建环境变量 ✅

已通过 `eas env:set` 写入 EAS 的 `production` 环境（值与 `.env.prod` 一致，变量会内联进 APK，故用 `plaintext`）：

```sh
pnpm dlx eas-cli@latest env:set --name EXPO_PUBLIC_DMS_API_URL --value "https://正式DMS地址" --environment production --visibility plaintext
pnpm dlx eas-cli@latest env:set --name EXPO_PUBLIC_DMS_SM2_PUBLIC_KEY --value "SM2公钥" --environment production --visibility plaintext
```

也可在 expo.dev 项目页 → Environment variables 中查看和修改。

## 日常发布

1. 确认 `app.json` 的 `version`（面向用户显示的版本号，如需更新手动修改并提交）。
2. 打 tag 并推送，触发构建：

```sh
git tag v1.0.0
git push origin v1.0.0
```

3. 在仓库 Actions 页查看进度；构建成功后到 expo.dev 项目 → Builds → 对应构建详情下载 APK。

## 版本号规则

- `versionCode` 由 EAS 远端自增（`eas.json` 的 `cli.appVersionSource: "remote"` + `autoIncrement: true`），首次构建为 1，每次构建 +1，无需手动维护。
- `version`（用户可见版本名）在 tag 触发的构建中自动取自 tag（`v1.2.3` → `1.2.3`，由 workflow 的 "Sync version from tag" 步骤写入 `app.json`），无需手动修改；本地 `workflow_dispatch` 手动触发时沿用 `app.json` 当前值。

## 包体积优化（已启用）

`app.json` 的 `expo-build-properties` 配置了以下 Android 构建选项：

- `buildArchs: ["armeabi-v7a", "arm64-v8a"]`：不再打包 x86/x86_64（模拟器架构），APK 显著变小；如需模拟器安装包临时改回。
- `enableMinifyInReleaseBuilds` + `enableShrinkResourcesInReleaseBuilds`：R8 代码收缩与资源收缩。发版后需重点回归登录、图表、分享等主流程。
- `assets/images/icon.png` 已做调色板量化压缩（784KB → 267KB，1024×1024 不变）。

## 注意事项

- `app.json` 的 `android.package` 当前为占位值 `com.xcy960815.datamiddlemobile`，首次对外发布前确认或修改；改包名后用户需重新安装。
- 首次构建时 EAS 会自动生成 Android 签名 keystore 并保存在 Expo 云端，无需本地管理。
- 当前产物为 APK（`buildType: "apk"`），适用于直接分发安装；如将来要上架 Google Play，把 profile 改为 `"buildType": "app-bundle"`。
- OTA 热更新（EAS Update）当前未启用：依赖中没有 `expo-updates`，如需启用要先添加该依赖并重新发布一次基础包。
