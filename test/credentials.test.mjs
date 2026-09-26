import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import { credentialsPath, loadCredentials, saveCredentials, saveCredentialsWithFallback } from "../dist/credentials.js";

const original = {
  configDir: process.env.WYDOCMOST_CONFIG_DIR,
  xdgConfigHome: process.env.XDG_CONFIG_HOME
};
const temporaryDirectories = [];

afterEach(async () => {
  if (original.configDir === undefined) delete process.env.WYDOCMOST_CONFIG_DIR;
  else process.env.WYDOCMOST_CONFIG_DIR = original.configDir;
  if (original.xdgConfigHome === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = original.xdgConfigHome;
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function temporaryDirectory() {
  const directory = await mkdtemp(join(tmpdir(), "wydocmost-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

test("uses the existing XDG default credentials location", () => {
  delete process.env.WYDOCMOST_CONFIG_DIR;
  process.env.XDG_CONFIG_HOME = "/tmp/wydocmost-xdg-test";
  assert.equal(credentialsPath(), "/tmp/wydocmost-xdg-test/wydocmost/credentials.json");
});

test("supports a custom credentials directory and restricts token file permissions", async () => {
  const directory = await temporaryDirectory();
  process.env.WYDOCMOST_CONFIG_DIR = directory;
  const credentials = {
    docmostUrl: "https://docs.example.test",
    email: "user@example.test",
    authToken: "sensitive-token",
    savedAt: new Date().toISOString()
  };
  const savedPath = await saveCredentials(credentials);
  assert.equal(savedPath, join(directory, "credentials.json"));
  assert.deepEqual(await loadCredentials(), credentials);
  assert.equal((await stat(savedPath)).mode & 0o777, 0o600);
  assert.equal(JSON.parse(await readFile(savedPath, "utf8")).authToken, "sensitive-token");
});

test("returns null when no credentials file exists", async () => {
  process.env.WYDOCMOST_CONFIG_DIR = await temporaryDirectory();
  assert.equal(await loadCredentials(), null);
});

test("stores the token in the keychain and leaves only metadata in JSON", async () => {
  const directory = await temporaryDirectory();
  process.env.WYDOCMOST_CONFIG_DIR = directory;
  let storedSecret;
  const secretStore = {
    setPassword(value) { storedSecret = value; },
    getPassword() { return storedSecret ?? null; }
  };
  const credentials = {
    docmostUrl: "https://docs.example.test",
    email: "user@example.test",
    authToken: "keychain-only-token",
    savedAt: new Date().toISOString()
  };

  await saveCredentials(credentials, "keychain", secretStore);
  assert.equal((await loadCredentials(secretStore)).authToken, credentials.authToken);
  const metadata = await readFile(credentialsPath(), "utf8");
  assert.match(metadata, /"storage": "keychain"/);
  assert.doesNotMatch(metadata, /keychain-only-token/);
});

test("falls back to the JSON file if keychain storage fails", async () => {
  process.env.WYDOCMOST_CONFIG_DIR = await temporaryDirectory();
  const credentials = {
    docmostUrl: "https://docs.example.test",
    email: "user@example.test",
    authToken: "fallback-token",
    savedAt: new Date().toISOString()
  };
  const secretStore = {
    setPassword() { throw new Error("keychain locked"); },
    getPassword() { return null; }
  };

  const result = await saveCredentialsWithFallback(credentials, "keychain", secretStore);
  assert.equal(result.storage, "file");
  assert.match(result.warning, /keychain locked/);
  assert.deepEqual(await loadCredentials(), credentials);
});
