import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import { saveCredentials } from "../dist/credentials.js";
import { Docmost } from "../dist/docmost.js";

const originalConfigDir = process.env.WYDOCMOST_CONFIG_DIR;
const originalFetch = globalThis.fetch;
let temporaryDirectory;

afterEach(async () => {
  if (originalConfigDir === undefined) delete process.env.WYDOCMOST_CONFIG_DIR;
  else process.env.WYDOCMOST_CONFIG_DIR = originalConfigDir;
  globalThis.fetch = originalFetch;
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = undefined;
  }
});

test("builds a recursive page tree across cursor pages and optionally includes content", async () => {
  temporaryDirectory = await mkdtemp(join(tmpdir(), "wydocmost-tree-test-"));
  process.env.WYDOCMOST_CONFIG_DIR = temporaryDirectory;
  await saveCredentials({
    docmostUrl: "https://docmost.example.test",
    email: "user@example.test",
    authToken: "test-token",
    savedAt: new Date().toISOString()
  });

  const requests = [];
  const responses = [
    { data: { id: "space-id" } },
    { data: { items: [{ id: "parent", title: "Parent", hasChildren: true }], meta: { hasNextPage: true, nextCursor: "root-next" } } },
    { data: { items: [{ id: "sibling", title: "Sibling", hasChildren: false }], meta: { hasNextPage: false, nextCursor: null } } },
    { data: { items: [{ id: "child", title: "Child", parentPageId: "parent", hasChildren: false }], meta: { hasNextPage: false, nextCursor: null } } },
    { data: { id: "child", title: "Child", content: { type: "doc", content: [] } } },
    { data: { id: "parent", title: "Parent", content: { type: "doc", content: [] } } },
    { data: { id: "sibling", title: "Sibling", content: { type: "doc", content: [] } } }
  ];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), body: init.body ? JSON.parse(init.body) : {} });
    const body = responses.shift();
    assert.ok(body, `Unexpected request: ${url}`);
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  };

  const api = await Docmost.connect();
  const tree = await api.pageTree({ spaceId: "my-space" }, undefined, undefined, true);

  assert.deepEqual(tree, [
    {
      id: "parent",
      title: "Parent",
      path: ["Parent"],
      children: [{
        id: "child",
        title: "Child",
        path: ["Parent", "Child"],
        parentPageId: "parent",
        content: { type: "doc", content: [] },
        children: []
      }],
      content: { type: "doc", content: [] }
    },
    {
      id: "sibling",
      title: "Sibling",
      path: ["Sibling"],
      children: [],
      content: { type: "doc", content: [] }
    }
  ]);
  assert.deepEqual(requests.map(({ url, body }) => [url.split("/api")[1], body]), [
    ["/spaces/info", { spaceId: "my-space" }],
    ["/pages/sidebar-pages", { spaceId: "space-id" }],
    ["/pages/sidebar-pages", { spaceId: "space-id", cursor: "root-next" }],
    ["/pages/sidebar-pages", { pageId: "parent" }],
    ["/pages/info", { pageId: "child" }],
    ["/pages/info", { pageId: "parent" }],
    ["/pages/info", { pageId: "sibling" }]
  ]);
  assert.equal(responses.length, 0);
});
