import { loadCredentials } from "./credentials.js";

type Json = Record<string, unknown>;

async function fetchDocmost(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
    throw new Error(`Cannot connect to Docmost at ${url}${cause}`);
  }
}

function proseMirror(text: string): string {
  return JSON.stringify({ type: "doc", content: text.split("\n").map((line) => line ? { type: "paragraph", content: [{ type: "text", text: line }] } : { type: "paragraph" }) });
}

export class Docmost {
  private constructor(private readonly baseUrl: string, private readonly token: string) {}

  static async connect(): Promise<Docmost> {
    const credentials = await loadCredentials();
    if (!credentials) throw new Error("Not logged in. Run: wydocmost login");
    if (credentials.expiresAt && Date.parse(credentials.expiresAt) <= Date.now()) throw new Error("Docmost token expired. Run: wydocmost login");
    return new Docmost(credentials.docmostUrl, credentials.authToken);
  }

  private async request(path: string, payload: unknown): Promise<unknown> {
    const response = await fetchDocmost(`${this.baseUrl}/api${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Docmost API error: HTTP ${response.status} ${await response.text()}`);
    const data = await response.json() as Json;
    return data?.data ?? data;
  }

  user() { return this.request("/users/me", {}); }
  spaces() { return this.request("/spaces", {}); }
  space(id: string) { return this.request("/spaces/info", { spaceId: id }); }
  page(id: string) { return this.request("/pages/info", { pageId: id }); }
  search(query: string, spaceId?: string, limit?: number) { return this.request("/search", { query, ...(spaceId ? { spaceId } : {}), ...(limit !== undefined ? { limit } : {}) }); }
  async pages(spaceId: string, limit?: number, cursor?: string) {
    const space = await this.space(spaceId) as Json;
    return this.request("/pages/sidebar-pages", { spaceId: space.id ?? spaceId, ...(limit !== undefined ? { limit } : {}), ...(cursor ? { cursor } : {}) });
  }
  updatePage(pageId: string, fields: { title?: string; icon?: string; content?: string }) {
    return this.request("/pages/update", { pageId, ...fields, ...(fields.content !== undefined ? { content: fields.content, format: "markdown", operation: "replace" } : {}) });
  }
  deletePage(pageId: string) { return this.request("/pages/delete", { pageId }); }
  duplicatePage(pageId: string) { return this.request("/pages/duplicate", { pageId }); }
  movePage(pageId: string, position: string, parentPageId?: string, spaceId?: string) { return this.request("/pages/move", { pageId, position, ...(parentPageId ? { parentPageId } : {}), ...(spaceId ? { spaceId } : {}) }); }
  history(pageId: string, limit?: number, cursor?: string) { return this.request("/pages/history", { pageId, ...(limit !== undefined ? { limit } : {}), ...(cursor ? { cursor } : {}) }); }
  comments(pageId: string, limit?: number, cursor?: string) { return this.request("/comments", { pageId, ...(limit !== undefined ? { limit } : {}), ...(cursor ? { cursor } : {}) }); }
  createComment(pageId: string, content: string) { return this.request("/comments/create", { pageId, content: proseMirror(content) }); }
  updateComment(commentId: string, content: string) { return this.request("/comments/update", { commentId, content: proseMirror(content) }); }

  async createPage(spaceId: string, title: string, content: string, parentPageId?: string) {
    const space = await this.space(spaceId) as Json;
    const markdown = content.trimStart().startsWith("#") ? content : `# ${title}\n\n${content}`;
    const form = new FormData();
    form.append("spaceId", String(space.id ?? spaceId));
    if (parentPageId) form.append("parentPageId", parentPageId);
    form.append("file", new Blob([markdown], { type: "text/markdown" }), `${title}.md`);
    const response = await fetchDocmost(`${this.baseUrl}/api/pages/import`, { method: "POST", headers: { authorization: `Bearer ${this.token}` }, body: form });
    if (!response.ok) throw new Error(`Docmost API error: HTTP ${response.status} ${await response.text()}`);
    const data = await response.json() as Json;
    return data?.data ?? data;
  }
}
