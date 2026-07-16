# AI 协作入口

本项目的 AI 协作规则默认使用中文；代码、命令和第三方 API 名称保留原文。

本项目使用 Expo SDK 57。修改 Expo、Expo Router 或原生相关代码前，必须阅读对应的精确版本文档：<https://docs.expo.dev/versions/v57.0.0/>。

开始任务前，按需阅读 `.agents/` 中的规则：

- 项目现状与目录边界：`.agents/project-map.md`
- 可用命令：`.agents/commands.md`
- 需要先确认的变更：`.agents/decision-gates.md`
- 模块实现约定：`.agents/module-conventions.md`
- 验证与审查：`.agents/validation-and-review.md`

规则优先级：用户当前明确要求 > 本文件及 `.agents/` 规则 > 项目现有代码与配置事实。规则冲突或需求存在会显著影响产品行为的多种方案时，先说明影响并等待确认。

不要把面向人的背景、方案或决策历史写入 `.agents/`；这些内容应放入 `docs/`。
