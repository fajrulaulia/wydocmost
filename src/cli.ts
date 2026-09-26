#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { saveCredentialsWithFallback, type CredentialStorage } from "./credentials.js";
import { Docmost } from "./docmost.js";
import { startMcpServer } from "./mcp.js";
import { version } from "./version.js";

async function fetchDocmost(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
    throw new Error(`Cannot connect to Docmost at ${url}${cause}`);
  }
}

async function hiddenPrompt(label: string): Promise<string> {
  if (!input.isTTY || !output.isTTY) throw new Error("Password prompt requires an interactive terminal");
  output.write(label);
  input.setRawMode?.(true);
  input.resume();
  return await new Promise((resolve, reject) => {
    let value = "";
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      for (const char of text) {
        if (char === "\r" || char === "\n") {
          input.setRawMode?.(false);
          input.pause();
          input.off("data", onData);
          output.write("\n");
          resolve(value);
        } else if (char === "\u0003") {
          input.setRawMode?.(false);
          input.pause();
          input.off("data", onData);
          reject(new Error("Login cancelled"));
        } else if (char === "\u007f") {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };
    input.on("data", onData);
  });
}

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function applyGlobalOptions(args: string[]): { args: string[]; storage?: CredentialStorage } {
  const remaining: string[] = [];
  let configDir: string | undefined;
  let storage: CredentialStorage | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--config-dir") {
      if (configDir !== undefined) throw new Error("--config-dir can only be provided once");
      configDir = args[++i];
      if (!configDir || configDir.startsWith("--")) throw new Error("Expected a directory path after --config-dir");
    } else if (args[i] === "--storage") {
      if (storage !== undefined) throw new Error("--storage can only be provided once");
      const value = args[++i];
      if (value !== "keychain" && value !== "file") throw new Error("--storage must be keychain or file");
      storage = value;
    } else {
      remaining.push(args[i]);
    }
  }
  if (configDir !== undefined) process.env.WYDOCMOST_CONFIG_DIR = configDir;
  return { args: remaining, storage };
}

async function login(storageOption?: CredentialStorage) {
  const rl = createInterface({ input, output });
  try {
    const url = normalizeUrl(await rl.question("Docmost URL: "));
    const email = (await rl.question("Email: ")).trim();
    let storage = storageOption;
    if (!storage) {
      const choice = (await rl.question("Token storage: [K]eychain (recommended) / [F]ile JSON [K]: ")).trim().toLowerCase();
      if (choice && !["k", "keychain", "f", "file"].includes(choice)) throw new Error("Choose keychain or file");
      storage = choice === "f" || choice === "file" ? "file" : "keychain";
    }
    rl.close();
    const password = await hiddenPrompt("Password: ");

    if (!url || !email || !password) throw new Error("URL, email, and password are required");

    process.stdout.write("Checking login...\n");
    const loginResponse = await fetchDocmost(`${url}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!loginResponse.ok) throw new Error(`Login failed (HTTP ${loginResponse.status})`);

    const cookies = loginResponse.headers.getSetCookie();
    const cookie = cookies.find((item) => item.startsWith("authToken="));
    const token = cookie?.split(";", 1)[0].slice("authToken=".length);
    if (!token) throw new Error("Login succeeded but Docmost did not return authToken");

    const checkResponse = await fetchDocmost(`${url}/api/users/me`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` }
    });
    if (!checkResponse.ok) throw new Error(`Auth check failed (HTTP ${checkResponse.status})`);

    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as { exp?: number };
    const credentials = {
      docmostUrl: url,
      email,
      authToken: token,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined,
      savedAt: new Date().toISOString()
    };
    const saved = await saveCredentialsWithFallback(credentials, storage);
    if (saved.warning) console.error(`Warning: system keychain is unavailable (${saved.warning}). Saving the token to the protected JSON file instead.`);
    console.log("Login successful.");
    console.log(saved.storage === "keychain" ? "Session token saved in the system keychain." : `Session token saved to ${saved.path}`);
  } finally {
    rl.close();
  }
}

const help = `Usage: wydocmost <command> [options]

Commands:
  mcp                                Start the MCP server over stdio (default)
  login                              Log in and save the session
  user                               Show the current user
  space list                         List spaces
  space get --id <space>             Show a space
  space pages --id <space> [--recursive] [--include-content]
                                     List pages, optionally including descendants
  search --query <text>              Search pages
  page get --id <page>               Show a page
  page tree --id <page> [--include-content]
                                     Show a page and all accessible descendants
  page create --space <id> --title <title> --content <markdown> [--parent <id>]
  page update --id <page> [--title <title>] [--icon <icon>] [--content <markdown>]
  page delete --id <page>            Delete a page
  page duplicate --id <page>         Duplicate a page
  page move --id <page> --position <position> [--parent <id>] [--space <id>]
  page history --id <page>           Show page history
  comment list --page <id>           List page comments
  comment create --page <id> --content <text>
  comment update --id <comment> --content <text>

Options:
  --limit <number>  Limit list or search results
  --cursor <value>  Continue a paginated result
  --storage <where>  Choose keychain or file when logging in
  --config-dir <path>  Store and read credentials in this directory
  -h, --help        Show this help
  -v, --version     Show the package version`;

type Options = Record<string, string>;
function parseOptions(args: string[]): Options {
  const options: Options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!key.startsWith("--")) throw new Error(`Unexpected argument: ${key}`);
    const name = key.slice(2).replaceAll("-", "_");
    if (name === "recursive" || name === "include_content") {
      if (name in options) throw new Error(`Option ${key} was provided more than once`);
      options[name] = "true";
      continue;
    }
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error(`Expected a value after ${key}`);
    if (name in options) throw new Error(`Option ${key} was provided more than once`);
    options[name] = value;
  }
  return options;
}
function required(options: Options, name: string): string {
  const value = options[name];
  if (!value) throw new Error(`Missing required option --${name.replaceAll("_", "-")}`);
  return value;
}
function optionalLimit(options: Options): number | undefined {
  if (options.limit === undefined) return undefined;
  const value = Number(options.limit);
  if (!Number.isInteger(value) || value < 1) throw new Error("--limit must be a positive integer");
  return value;
}
function print(value: unknown) { console.log(JSON.stringify(value, null, 2)); }

async function main() {
  const parsed = applyGlobalOptions(process.argv.slice(2));
  const args = parsed.args;
  const [command, subcommand, ...rest] = args;
  if (!command) {
    if (input.isTTY && output.isTTY) console.log(help);
    else await startMcpServer();
    return;
  }
  if (command === "mcp") {
    if (args.length !== 1) throw new Error("mcp accepts --config-dir only");
    if (parsed.storage) throw new Error("--storage can only be used with login");
    await startMcpServer();
    return;
  }
  if (command === "help" || command === "--help" || command === "-h") { console.log(help); return; }
  if (command === "--version" || command === "-v") { console.log(version); return; }
  if (command === "login") {
    if (args.length > 1) throw new Error("login accepts --storage and --config-dir only");
    await login(parsed.storage);
    return;
  }
  if (parsed.storage) throw new Error("--storage can only be used with login");
  const optionArgs = command === "space" || command === "page" || command === "comment" ? rest : [subcommand, ...rest].filter((value): value is string => value !== undefined);
  const options = parseOptions(optionArgs);
  const api = await Docmost.connect();
  if (command === "user" && !subcommand) return print(await api.user());
  if (command === "space" && subcommand === "list") return print(await api.spaces());
  if (command === "space" && subcommand === "get") return print(await api.space(required(options, "id")));
  if (command === "space" && subcommand === "pages") {
    if (options.include_content && !options.recursive) throw new Error("--include-content requires --recursive");
    if (options.recursive) return print(await api.pageTree({ spaceId: required(options, "id") }, optionalLimit(options), options.cursor, Boolean(options.include_content)));
    return print(await api.pages(required(options, "id"), optionalLimit(options), options.cursor));
  }
  if (command === "search") return print(await api.search(required(options, "query"), options.space, optionalLimit(options)));
  if (command === "page" && subcommand === "get") return print(await api.page(required(options, "id")));
  if (command === "page" && subcommand === "tree") return print(await api.pageTree({ pageId: required(options, "id") }, optionalLimit(options), options.cursor, Boolean(options.include_content)));
  if (command === "page" && subcommand === "create") return print(await api.createPage(required(options, "space"), required(options, "title"), required(options, "content"), options.parent));
  if (command === "page" && subcommand === "update") {
    const fields = { ...(options.title ? { title: options.title } : {}), ...(options.icon ? { icon: options.icon } : {}), ...(options.content !== undefined ? { content: options.content } : {}) };
    if (!Object.keys(fields).length) throw new Error("Provide at least one of --title, --icon, or --content");
    return print(await api.updatePage(required(options, "id"), fields));
  }
  if (command === "page" && subcommand === "delete") return print(await api.deletePage(required(options, "id")));
  if (command === "page" && subcommand === "duplicate") return print(await api.duplicatePage(required(options, "id")));
  if (command === "page" && subcommand === "move") return print(await api.movePage(required(options, "id"), required(options, "position"), options.parent, options.space));
  if (command === "page" && subcommand === "history") return print(await api.history(required(options, "id"), optionalLimit(options), options.cursor));
  if (command === "comment" && subcommand === "list") return print(await api.comments(required(options, "page"), optionalLimit(options), options.cursor));
  if (command === "comment" && subcommand === "create") return print(await api.createComment(required(options, "page"), required(options, "content")));
  if (command === "comment" && subcommand === "update") return print(await api.updateComment(required(options, "id"), required(options, "content")));
  throw new Error(`Unknown command: ${[command, subcommand].filter(Boolean).join(" ")}. Run: wydocmost --help`);
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
