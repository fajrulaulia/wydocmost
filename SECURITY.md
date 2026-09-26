# Security Policy

This security policy is available in 10 languages. English is the canonical
version; translated copies are provided for convenience. If a translation
differs from the English text, the English version controls.

English | [Bahasa Indonesia](SECURITY.id.md) | [简体中文](SECURITY.zh-CN.md) | [हिन्दी](SECURITY.hi.md) | [Español](SECURITY.es.md) | [Français](SECURITY.fr.md) | [العربية](SECURITY.ar.md) | [বাংলা](SECURITY.bn.md) | [Português](SECURITY.pt-BR.md) | [Русский](SECURITY.ru.md)

## Supported versions

Only the latest published version of `wydocmost` receives security fixes. Older
versions are unsupported; update to the latest release before reporting a
security issue.

The CLI requires Node.js 20 or newer. It connects to a Docmost instance using
that instance's HTTP API. Compatibility with Docmost releases can vary; include
the Docmost version and deployment details in a report, but do not include
credentials or session tokens.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to the project maintainer.
If this project is hosted on GitHub and private vulnerability reporting is
enabled, use the repository's **Report a vulnerability** feature. Otherwise,
use a private contact channel listed by the maintainer. Do not post exploit
details, credentials, or tokens in a public issue or discussion.

Include the affected package version, Node.js version, Docmost version, impact,
and steps to reproduce. Redact hostnames or other identifying information when
they are sensitive. The maintainer will acknowledge the report and coordinate
a fix and disclosure timeline with the reporter.

## Local credentials

`wydocmost login` offers the operating system keychain or a JSON file for the
Docmost session token. Keychain storage is selected by default. If the system
credential store cannot save the token, the CLI warns and falls back to JSON.
The JSON file is `credentials.json` under the configured credentials
directory. The default is `~/.config/wydocmost/credentials.json`;
`XDG_CONFIG_HOME`, `--config-dir`, or `WYDOCMOST_CONFIG_DIR` can select another
location. The CLI requests file permissions of `0600` and creates a new
credentials directory with permissions of `0700` where supported by the
operating system. With keychain storage, the JSON file contains metadata only,
not the token. Keep the credentials directory private, especially when
choosing a custom path. The password is not stored.

If a token may have been exposed, revoke the session from Docmost if available,
remove the local credentials file, and run `wydocmost login` to save a new
session.

Do not commit `credentials.json`, environment files, or other secrets. The
repository ignores common credential and environment file names. The npm
package includes the README, license, security policy documents, package
manifest, and compiled CLI files; it does not include local credentials.

## Personal data protection in Indonesia (UU PDP)

Indonesia's Personal Data Protection Law, **Law No. 27 of 2022 (UU PDP)**, is
in force. See the official [regulation record](https://peraturan.go.id/id/uu-no-27-tahun-2022)
or the [official law text](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022).

`wydocmost` stores Docmost session credentials locally and sends authenticated
requests to the Docmost instance selected by the user. Keep the credentials
directory private and do not share session tokens. Organizations and
individuals using the CLI should assess their own processing activities and
responsibilities under the UU PDP and any other applicable rules. This notice
provides a reference only; it does not assert that a particular deployment or
use of the CLI is compliant with the law.

## License

This project is distributed under the [MIT License](LICENSE).
