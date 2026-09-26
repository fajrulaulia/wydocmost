# 安全政策

本安全政策提供 10 种语言版本。英文为权威版本；其他译文仅供参考。如译文与英文内容有差异，以英文版本为准。

[English](SECURITY.md) | [Bahasa Indonesia](SECURITY.id.md) | 简体中文 | [हिन्दी](SECURITY.hi.md) | [Español](SECURITY.es.md) | [Français](SECURITY.fr.md) | [العربية](SECURITY.ar.md) | [বাংলা](SECURITY.bn.md) | [Português](SECURITY.pt-BR.md) | [Русский](SECURITY.ru.md)

## 支持的版本

只有最新发布的 `wydocmost` 版本会获得安全修复。旧版本不再受支持；报告安全问题前请先更新到最新版本。

CLI 要求 Node.js 20 或更高版本。它通过 Docmost 实例的 HTTP API 连接该实例。不同 Docmost 版本的兼容性可能有所不同；报告时请提供 Docmost 版本和部署详情，但不要提供凭据或会话令牌。

## 报告漏洞

请通过私密渠道向项目维护者报告疑似漏洞。如果项目托管在 GitHub 且启用了私密漏洞报告，请使用仓库中的 **Report a vulnerability** 功能。否则，请使用维护者提供的私密联系方式。不要在公开 issue 或讨论中发布漏洞利用细节、凭据或令牌。

请提供受影响的软件包版本、Node.js 版本、Docmost 版本、影响以及复现步骤。敏感时请隐去主机名或其他身份信息。维护者会确认收到报告，并与报告者协调修复和披露时间表。

## 本地凭据

`wydocmost login` 提供操作系统钥匙串或 JSON 文件，用于保存 Docmost 会话令牌。默认使用钥匙串。如果系统凭据存储无法保存令牌，CLI 会发出警告并回退到 JSON。JSON 文件名为 `credentials.json`，位于已配置的凭据目录中。默认路径为 `~/.config/wydocmost/credentials.json`；可使用 `XDG_CONFIG_HOME`、`--config-dir` 或 `WYDOCMOST_CONFIG_DIR` 选择其他位置。在操作系统支持的情况下，CLI 会将文件权限设为 `0600`，并以 `0700` 权限创建新的凭据目录。使用钥匙串时，JSON 文件仅包含定位钥匙串条目的元数据，不含令牌。请保护凭据目录的隐私，尤其是使用自定义路径时。CLI 不保存密码。

如果令牌可能已泄露，请在 Docmost 提供相应功能时撤销该会话，删除本地凭据文件，然后运行 `wydocmost login` 保存新会话。

不要提交 `credentials.json`、环境文件或其他机密信息。仓库会忽略常见的凭据和环境文件名。npm 软件包包含 README、许可证、安全政策文档、软件包清单和编译后的 CLI 文件；不包含本地凭据。

## 印度尼西亚个人数据保护（UU PDP）

印度尼西亚《2022 年第 27 号个人数据保护法》（**UU PDP**）目前有效。请参阅[官方法规记录](https://peraturan.go.id/id/uu-no-27-tahun-2022)或[官方法律文本](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)。

`wydocmost` 在本地保存 Docmost 会话凭据，并向用户选择的 Docmost 实例发送经过身份验证的请求。请保护凭据目录，不要分享会话令牌。使用 CLI 的组织和个人应根据自身数据处理活动，评估其在 UU PDP 及其他适用规则下的责任。本说明仅提供参考，并不表示任何特定部署或使用方式必然符合法律要求。

## 许可证

本项目根据 [MIT 许可证](LICENSE)发布。
