# Changelog

## 0.1.2 - 2026-09-26

### Added

- MCP server over stdio, with tools for checking login, exploring spaces and pages, searching, page history, and comments.
- MCP login guidance that sends users to the local interactive CLI and never asks them to share passwords in chat.
- Recursive page-tree retrieval for spaces and individual pages, with optional page content.
- MCP setup examples and an MCP-focused agent skill.

### Changed

- Running the package without arguments starts MCP in non-interactive environments while retaining CLI help in a terminal.
- Documented configuration for Codex, OpenCode, Claude, Cline, Cursor, and VS Code/Copilot.
