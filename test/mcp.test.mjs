import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import { handleMcpRequest } from "../dist/mcp.js";

test("MCP initializes and advertises the Docmost tools", async () => {
  const response = await handleMcpRequest({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "1" } }
  });
  assert.equal(response.result.protocolVersion, "2025-11-25");
  assert.equal(response.result.serverInfo.name, "wydocmost");

  const tools = await handleMcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  assert.ok(tools.result.tools.some((tool) => tool.name === "page_tree"));
  assert.ok(tools.result.tools.some((tool) => tool.name === "login"));
});

test("login tool guides an unauthenticated user to local interactive login", async () => {
  const configDir = await mkdtemp(join(tmpdir(), "wydocmost-mcp-test-"));
  const previous = process.env.WYDOCMOST_CONFIG_DIR;
  process.env.WYDOCMOST_CONFIG_DIR = configDir;
  try {
    const response = await handleMcpRequest({
      jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "login", arguments: {} }
    });
    const result = response.result;
    assert.equal(result.isError, false);
    const body = JSON.parse(result.content[0].text);
    assert.equal(body.loggedIn, false);
    assert.equal(body.command, `npx -y @wydforgs/wydocmost --config-dir '${configDir}' login`);
    assert.match(body.instructions, /Do not send the password in AI chat/);

    const unauthenticatedCall = await handleMcpRequest({
      jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "space_list", arguments: {} }
    });
    assert.equal(unauthenticatedCall.result.isError, true);
    assert.ok(unauthenticatedCall.result.content[0].text.includes(body.command));
  } finally {
    if (previous === undefined) delete process.env.WYDOCMOST_CONFIG_DIR;
    else process.env.WYDOCMOST_CONFIG_DIR = previous;
    await rm(configDir, { recursive: true, force: true });
  }
});

test("running the package without arguments starts an MCP stdio process", async () => {
  const child = spawn(process.execPath, ["dist/cli.js"], { stdio: ["pipe", "pipe", "pipe"] });
  let output = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 4, method: "initialize", params: { protocolVersion: "2025-11-25" } })}\n`);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("MCP process did not respond")), 3000);
    child.stdout.once("data", () => { clearTimeout(timeout); resolve(); });
    child.once("error", reject);
  });
  child.stdin.end();
  await new Promise((resolve, reject) => {
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`MCP process exited ${code}`)));
  });
  const message = JSON.parse(output.trim().split("\n")[0]);
  assert.equal(message.id, 4);
  assert.equal(message.result.serverInfo.name, "wydocmost");
});
