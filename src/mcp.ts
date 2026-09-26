import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { Docmost } from "./docmost.js";
import { version } from "./version.js";

type JsonObject = Record<string, unknown>;
type Tool = {
  name: string;
  description: string;
  inputSchema: JsonObject;
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };
  run: (args: JsonObject) => Promise<unknown>;
};

const string = { type: "string" };
const integer = { type: "integer", minimum: 1 };
const schema = (properties: JsonObject, required: string[] = []): JsonObject => ({
  type: "object", properties, required, additionalProperties: false
});
const requiredString = (args: JsonObject, name: string): string => {
  const value = args[name];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing required string argument: ${name}`);
  return value;
};
const optionalString = (args: JsonObject, name: string): string | undefined => {
  const value = args[name];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`Argument ${name} must be a string`);
  return value;
};
const optionalInteger = (args: JsonObject, name: string): number | undefined => {
  const value = args[name];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) throw new Error(`Argument ${name} must be a positive integer`);
  return value;
};
const optionalBoolean = (args: JsonObject, name: string): boolean => {
  const value = args[name];
  if (value === undefined) return false;
  if (typeof value !== "boolean") throw new Error(`Argument ${name} must be a boolean`);
  return value;
};

function loginCommand(): string {
  const configDir = process.env.WYDOCMOST_CONFIG_DIR;
  const quotedDir = configDir ? `'${configDir.replaceAll("'", "'\\''")}'` : undefined;
  return quotedDir
    ? `npx -y @wydforgs/wydocmost --config-dir ${quotedDir} login`
    : "npx -y @wydforgs/wydocmost login";
}

const tools: Tool[] = [
  {
    name: "login",
    description: "Check authentication and show the installed CLI login command when needed. Login prompts require the user's interactive terminal; never ask for a password in chat.",
    inputSchema: schema({}),
    async run() {
      try {
        const api = await Docmost.connect();
        const user = await api.user();
        return { loggedIn: true, user };
      } catch (error) {
        if (!(error instanceof Error) || !/Not logged in|token expired|HTTP 401/i.test(error.message)) throw error;
        return {
          loggedIn: false,
          command: loginCommand(),
          instructions: "Run the command in a local interactive terminal. It prompts for the Docmost URL, email, hidden password, and token storage (Keychain or JSON file). The command includes the MCP server's custom credentials directory when one is configured. Do not send the password in AI chat. After login, retry the Docmost tool."
        };
      }
    }
  },
  { name: "user", description: "Get the authenticated Docmost user.", inputSchema: schema({}), run: async () => (await Docmost.connect()).user() },
  { name: "space_list", description: "List Docmost spaces accessible to the authenticated user.", inputSchema: schema({}), run: async () => (await Docmost.connect()).spaces() },
  { name: "space_get", description: "Get a Docmost space by ID or slug.", inputSchema: schema({ id: string }, ["id"]), run: async (a) => (await Docmost.connect()).space(requiredString(a, "id")) },
  { name: "space_pages", description: "List top-level pages in a space. Set recursive=true to return the accessible nested page tree; includeContent adds page bodies.", inputSchema: schema({ id: string, limit: integer, cursor: string, recursive: { type: "boolean" }, includeContent: { type: "boolean" } }, ["id"]), run: async (a) => {
    const api = await Docmost.connect();
    const recursive = optionalBoolean(a, "recursive");
    const includeContent = optionalBoolean(a, "includeContent");
    if (includeContent && !recursive) throw new Error("includeContent requires recursive=true");
    const id = requiredString(a, "id");
    const limit = optionalInteger(a, "limit");
    const cursor = optionalString(a, "cursor");
    return recursive ? api.pageTree({ spaceId: id }, limit, cursor, includeContent) : api.pages(id, limit, cursor);
  } },
  { name: "search", description: "Search Docmost pages by text, optionally limited to a space.", inputSchema: schema({ query: string, spaceId: string, limit: integer }, ["query"]), run: async (a) => (await Docmost.connect()).search(requiredString(a, "query"), optionalString(a, "spaceId"), optionalInteger(a, "limit")) },
  { name: "page_get", description: "Read a Docmost page by ID, including its content.", inputSchema: schema({ id: string }, ["id"]), run: async (a) => (await Docmost.connect()).page(requiredString(a, "id")) },
  { name: "page_tree", description: "Read a page and all accessible descendants as a nested tree. Set includeContent=true to fetch page bodies.", inputSchema: schema({ id: string, limit: integer, includeContent: { type: "boolean" } }, ["id"]), run: async (a) => (await Docmost.connect()).pageTree({ pageId: requiredString(a, "id") }, optionalInteger(a, "limit"), undefined, optionalBoolean(a, "includeContent")) },
  { name: "page_create", description: "Create a Markdown page in a Docmost space. This changes the workspace.", inputSchema: schema({ spaceId: string, title: string, content: string, parentPageId: string }, ["spaceId", "title", "content"]), run: async (a) => (await Docmost.connect()).createPage(requiredString(a, "spaceId"), requiredString(a, "title"), requiredString(a, "content"), optionalString(a, "parentPageId")) },
  { name: "page_update", description: "Update a page title, icon, and/or Markdown content. This changes the workspace.", inputSchema: schema({ id: string, title: string, icon: string, content: string }, ["id"]), run: async (a) => {
    const fields = { ...(optionalString(a, "title") !== undefined ? { title: optionalString(a, "title") } : {}), ...(optionalString(a, "icon") !== undefined ? { icon: optionalString(a, "icon") } : {}), ...(optionalString(a, "content") !== undefined ? { content: optionalString(a, "content") } : {}) };
    if (!Object.keys(fields).length) throw new Error("Provide at least one of title, icon, or content");
    return (await Docmost.connect()).updatePage(requiredString(a, "id"), fields);
  } },
  { name: "page_delete", description: "Move a Docmost page to trash. This changes the workspace; confirm the target with the user first.", inputSchema: schema({ id: string }, ["id"]), run: async (a) => (await Docmost.connect()).deletePage(requiredString(a, "id")) },
  { name: "page_duplicate", description: "Duplicate a Docmost page. This creates new pages in the workspace.", inputSchema: schema({ id: string }, ["id"]), run: async (a) => (await Docmost.connect()).duplicatePage(requiredString(a, "id")) },
  { name: "page_move", description: "Move a Docmost page. This changes the page hierarchy.", inputSchema: schema({ id: string, position: string, parentPageId: string, spaceId: string }, ["id", "position"]), run: async (a) => (await Docmost.connect()).movePage(requiredString(a, "id"), requiredString(a, "position"), optionalString(a, "parentPageId"), optionalString(a, "spaceId")) },
  { name: "page_history", description: "List revisions in a Docmost page history.", inputSchema: schema({ id: string, limit: integer, cursor: string }, ["id"]), run: async (a) => (await Docmost.connect()).history(requiredString(a, "id"), optionalInteger(a, "limit"), optionalString(a, "cursor")) },
  { name: "comment_list", description: "List comments on a Docmost page.", inputSchema: schema({ pageId: string, limit: integer, cursor: string }, ["pageId"]), run: async (a) => (await Docmost.connect()).comments(requiredString(a, "pageId"), optionalInteger(a, "limit"), optionalString(a, "cursor")) },
  { name: "comment_create", description: "Add a comment to a Docmost page. This changes the workspace.", inputSchema: schema({ pageId: string, content: string }, ["pageId", "content"]), run: async (a) => (await Docmost.connect()).createComment(requiredString(a, "pageId"), requiredString(a, "content")) },
  { name: "comment_update", description: "Update a Docmost comment. This changes the workspace.", inputSchema: schema({ id: string, content: string }, ["id", "content"]), run: async (a) => (await Docmost.connect()).updateComment(requiredString(a, "id"), requiredString(a, "content")) }
];

function rpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

export async function handleMcpRequest(message: JsonObject): Promise<JsonObject | null> {
  const method = message.method;
  const id = message.id;
  const params = (message.params && typeof message.params === "object" ? message.params : {}) as JsonObject;
  if (typeof method !== "string") return rpcError(id, -32600, "Invalid JSON-RPC request");
  if (method.startsWith("notifications/")) return null;
  if (method === "initialize") {
    const requestedVersion = params.protocolVersion;
    const versions = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
    const protocolVersion = typeof requestedVersion === "string" && versions.includes(requestedVersion) ? requestedVersion : versions[0];
    return { jsonrpc: "2.0", id, result: {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "wydocmost", version },
      instructions: `Use login to check authentication. If it reports not logged in, tell the user to run ${loginCommand()} in a local interactive terminal. Never request or relay their password in chat. Once authenticated, use the Docmost tools with the user's normal permissions. Confirm before page/comment mutations.`
    } };
  }
  if (method === "ping") return { jsonrpc: "2.0", id, result: {} };
  if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: tools.map(({ name, description, inputSchema }) => ({
    name, description, inputSchema,
    annotations: {
      readOnlyHint: ["login", "user", "space_list", "space_get", "space_pages", "search", "page_get", "page_tree", "page_history", "comment_list"].includes(name),
      destructiveHint: ["page_update", "page_delete", "page_move", "comment_update"].includes(name),
      idempotentHint: ["login", "user", "space_list", "space_get", "space_pages", "search", "page_get", "page_tree", "page_update", "page_delete", "page_move", "page_history", "comment_list", "comment_update"].includes(name),
      openWorldHint: true
    }
  })) } };
  if (method === "tools/call") {
    const name = params.name;
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool) return rpcError(id, -32602, `Unknown tool: ${String(name)}`);
    const args = params.arguments && typeof params.arguments === "object" ? params.arguments as JsonObject : {};
    try {
      const result = await tool.run(args);
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }], isError: false } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const guided = /Not logged in|token expired|HTTP 401/i.test(message)
        ? `${message}. Log in locally with: ${loginCommand()}. Password entry stays in the local terminal, not AI chat.`
        : message;
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: guided }], isError: true } };
    }
  }
  if (id === undefined) return null;
  return rpcError(id, -32601, `Method not found: ${method}`);
}

export async function startMcpServer(): Promise<void> {
  const lines = createInterface({ input: stdin, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    let response: JsonObject | null;
    try {
      response = await handleMcpRequest(JSON.parse(line) as JsonObject);
    } catch (error) {
      response = rpcError(null, -32700, error instanceof Error ? error.message : "Parse error");
    }
    if (response) stdout.write(`${JSON.stringify(response)}\n`);
  }
}
