# wydocmost

`wydocmost` is a command-line client for Docmost. Use it to log in, find spaces and pages, and manage page content and comments from a terminal. It is a CLI application; it does not start a server.

## Requirements

- Node.js 20 or newer
- Access to a Docmost instance

## Install and log in

Install the package globally:

```sh
npm install --global @wydforgs/wydocmost
wydocmost login
```

Or use it without a global install:

```sh
npx @wydforgs/wydocmost login
```

The login prompts for the Docmost URL, email, password, and token storage. Password input is hidden. Choose the system keychain or a JSON file. The keychain is selected by default; if it is unavailable, the CLI warns and falls back to the JSON file. You can choose a storage method without the extra prompt using `--storage keychain` or `--storage file`:

```sh
wydocmost --storage keychain login
wydocmost --storage file login
```

The CLI verifies the returned session token before saving it. It does not save the password. With keychain storage, the token is stored in the operating system credential store; `credentials.json` contains only metadata to locate the keychain entry. On Linux, keychain mode requires Secret Service (such as GNOME Keyring or KWallet); if it is unavailable, login falls back to JSON.

When you select JSON storage or the keychain is unavailable, the token is stored in `~/.config/wydocmost/credentials.json` with file permission `0600`. If `XDG_CONFIG_HOME` is set, the location is `$XDG_CONFIG_HOME/wydocmost/credentials.json`. To choose another directory, pass `--config-dir` to login and subsequent commands:

```sh
wydocmost --config-dir "$HOME/.local/share/wydocmost" login
wydocmost --config-dir "$HOME/.local/share/wydocmost" space list
```

Alternatively, set `WYDOCMOST_CONFIG_DIR` in your shell environment. That directory will contain `credentials.json`. Log in again if the session expires.

Keep the credentials file private. Do not commit it, paste its contents into an issue, or include it in a support request. The repository ignores common credentials and environment files, and the npm package allowlist includes the compiled app and documented skills, not local credentials or tests.

See [SECURITY.md](SECURITY.md) for supported versions and vulnerability
reporting guidance.

## License

This project is licensed under the [MIT License](LICENSE).

## Support and legal notice

The maintainer does not guarantee support, a response to every issue or vulnerability report, a fix, or a response or remediation timeline. The documentation is not legal advice and does not guarantee that a particular use complies with applicable law. Users and organizations are responsible for protecting their systems and credentials and assessing their own legal obligations, including under Indonesia's UU PDP where applicable. See [SECURITY.md](SECURITY.md) for details. Nothing in this notice waives rights or excludes duties or liability that applicable law does not permit to be waived or excluded.

## Use with AI agents (MCP)

`wydocmost` can run as an MCP server over standard input and output. Configure any MCP client to launch it with `npx -y @wydforgs/wydocmost`. The no-argument invocation used by MCP clients starts the MCP server. No Codex-specific setup is needed.

If the agent reports that you are not logged in or your session expired, run the login command it provides in a local interactive terminal. For the default credentials location, use:

```sh
npx -y @wydforgs/wydocmost login
```

The login flow asks for your Docmost URL, email, hidden password, and storage choice (system keychain or protected JSON file). Your password is never sent through MCP or stored. To use a custom credentials directory, pass the same path both to login and the MCP process:

```sh
npx -y @wydforgs/wydocmost --config-dir "$HOME/.config/wydocmost-work" login
```

For MCP clients, add `"--config-dir"` and the same directory path to the server command's argument list after `@wydforgs/wydocmost` as well (use an absolute path in the agent configuration). This configures the MCP process to read the same credentials location, and the MCP `login` tool will display the matching login command. The login flow then offers system keychain or a protected local JSON file.

### Agent configuration examples

Use the configuration style supported by your agent. After saving the configuration, restart or reload the agent so it starts the MCP process.

**OpenCode** (`opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "wydocmost": {
      "type": "local",
      "command": ["npx", "-y", "@wydforgs/wydocmost"]
    }
  }
}
```

**Codex CLI** (`~/.codex/config.toml`):

```toml
[mcp_servers.wydocmost]
command = "npx"
args = ["-y", "@wydforgs/wydocmost"]
```

Alternatively, register it with `codex mcp add wydocmost -- npx -y @wydforgs/wydocmost`.

**Claude Code**:

```sh
claude mcp add --scope user wydocmost -- npx -y @wydforgs/wydocmost
```

**Claude Desktop, Cline, or Cursor** (MCP servers JSON configuration):

```json
{
  "mcpServers": {
    "wydocmost": {
      "command": "npx",
      "args": ["-y", "@wydforgs/wydocmost"]
    }
  }
}
```

**VS Code / GitHub Copilot** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "wydocmost": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@wydforgs/wydocmost"]
    }
  }
}
```

The MCP tools let an AI agent search and read spaces/pages, inspect page trees and history, and work with pages and comments using the permissions of your Docmost account. The agent skill at [`skills/wydocmost-mcp/SKILL.md`](skills/wydocmost-mcp/SKILL.md) explains login handling, safe exploration, and mutation practices. The repository also keeps a CLI-focused skill at [`.SKILL/SKILL.md`](.SKILL/SKILL.md) for agents that use shell commands instead of MCP.

For a custom credentials directory, include `"--config-dir", "/absolute/path/to/credentials"` after the package name in the MCP server arguments. The login command returned by the MCP `login` tool will use that same path.

## Use with AI agents through the CLI

The existing [`.SKILL/SKILL.md`](.SKILL/SKILL.md) is an instruction file for agents that use the CLI through a shell, without MCP. It does not connect an agent by itself. Most agents do not discover `.SKILL` automatically. For Codex CLI, OpenCode, and other agents that support the shared `.agents/skills` location, install it for your user with:

```sh
git clone https://github.com/fajrulaulia/wydocmost.git
mkdir -p "$HOME/.agents/skills/wydocmost-docmost-cli"
cp wydocmost/.SKILL/SKILL.md "$HOME/.agents/skills/wydocmost-docmost-cli/SKILL.md"
```

To make it available only in the current project instead, copy it into the standard project skill directory:

```sh
mkdir -p .agents/skills/wydocmost-docmost-cli
cp /path/to/wydocmost/.SKILL/SKILL.md .agents/skills/wydocmost-docmost-cli/SKILL.md
```

Codex CLI and OpenCode can discover skills from `.agents/skills`. Ask the agent to use `wydocmost-docmost-cli`, or describe the Docmost task; the skill description helps the agent select it when relevant. In Codex, you can also browse available skills with `/skills` or invoke one by name. See the [Codex skills guide](https://developers.openai.com/plugins/concepts/skills) and [OpenCode skills guide](https://opencode.ai/docs/skills) for their current discovery and invocation behavior.

For other agent tools, use their native Agent Skills directory. For example, GitHub Copilot CLI can install the source file as a project skill with `copilot skill add --project /path/to/wydocmost/.SKILL/SKILL.md`; Claude Code can use a copy under `.claude/skills/wydocmost-docmost-cli/SKILL.md`. See the [Copilot CLI skills guide](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) for Copilot's supported locations and install command. Other Agent Skills-compatible tools may use a different discovery path or require you to enable the skill in their settings. Check that tool's documentation if the skill does not appear.

After installing the skill, install and authenticate the CLI separately:

```sh
npm install --global @wydforgs/wydocmost
wydocmost login
```

The agent uses its shell tool to run `wydocmost` commands and receives JSON output. Page or comment changes apply immediately, so review the task and the skill's mutation guidance before allowing the agent to make changes.

## Commands

API results are printed as JSON. Quote values that contain spaces or Markdown.

```sh
# Account and spaces
wydocmost user
wydocmost space list
wydocmost space get --id <space-id-or-slug>
wydocmost space pages --id <space-id-or-slug> [--limit 20] [--cursor <cursor>]
wydocmost space pages --id <space-id-or-slug> --recursive [--include-content]

# Search
wydocmost search --query "onboarding" [--space <space-id>] [--limit 10]

# Pages
wydocmost page get --id <page-id>
wydocmost page tree --id <page-id> [--include-content]
wydocmost page create --space <space-id> --title "Onboarding" --content "Welcome!" [--parent <page-id>]
wydocmost page update --id <page-id> [--title "New title"] [--icon "📘"] [--content "Updated Markdown"]
wydocmost page delete --id <page-id>
wydocmost page duplicate --id <page-id>
wydocmost page move --id <page-id> --position <position> [--parent <page-id>] [--space <space-id>]
wydocmost page history --id <page-id> [--limit 10] [--cursor <cursor>]

# Comments
wydocmost comment list --page <page-id> [--limit 10] [--cursor <cursor>]
wydocmost comment create --page <page-id> --content "Please review this section."
wydocmost comment update --id <comment-id> --content "Updated comment"
```

Run `wydocmost --help` for the full command list or `wydocmost --version` for the installed version. Commands that change pages or comments update Docmost immediately.

`space pages --recursive` returns a nested tree of pages the logged-in user can access. `page tree` returns the selected page and its accessible descendants. Add `--include-content` to fetch each page's content as well. Recursive traversal follows Docmost's paginated sidebar-pages endpoint one parent at a time, so large hierarchies may take longer than a normal listing.

## Develop and test

```sh
npm ci
npm test
node dist/cli.js --help
npm pack --dry-run
```

`npm test` builds the TypeScript source and runs the unit tests. `npm pack` and `npm publish` build the CLI automatically. The npm package contains the README, package manifest, and compiled CLI files; it does not include the source tests or local credentials.
