# wydocmost

`wydocmost` is a command-line client for Docmost. Use it to log in, find spaces and pages, and manage page content and comments from a terminal. It is a CLI application; it does not start a server.

## Requirements

- Node.js 20 or newer
- Access to a Docmost instance

## Install and log in

After the package is published to npm, install it globally:

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

Keep the credentials file private. Do not commit it, paste its contents into an issue, or include it in a support request. The repository ignores common credentials and environment files, and the npm package allowlist includes only the compiled CLI files.

See [SECURITY.md](SECURITY.md) for supported versions and vulnerability
reporting guidance.

## Commands

API results are printed as JSON. Quote values that contain spaces or Markdown.

```sh
# Account and spaces
wydocmost user
wydocmost space list
wydocmost space get --id <space-id-or-slug>
wydocmost space pages --id <space-id-or-slug> [--limit 20] [--cursor <cursor>]

# Search
wydocmost search --query "onboarding" [--space <space-id>] [--limit 10]

# Pages
wydocmost page get --id <page-id>
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

## Develop and test

```sh
npm ci
npm test
node dist/cli.js --help
npm pack --dry-run
```

`npm test` builds the TypeScript source and runs the unit tests. `npm pack` and `npm publish` build the CLI automatically. The npm package contains the README, package manifest, and compiled CLI files; it does not include the source tests or local credentials.
