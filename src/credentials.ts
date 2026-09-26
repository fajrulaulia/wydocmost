import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { resolve, join } from "node:path";
import { Entry } from "@napi-rs/keyring";

export type Credentials = {
  docmostUrl: string;
  email: string;
  authToken: string;
  expiresAt?: string;
  savedAt: string;
};

export type CredentialStorage = "file" | "keychain";
export type CredentialSaveResult = { storage: CredentialStorage; path: string; warning?: string };
type SecretStore = { setPassword(value: string): void; getPassword(): string | null };

const serviceName = "wydocmost";

export function credentialsPath(): string {
  const configDir = process.env.WYDOCMOST_CONFIG_DIR || join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "wydocmost");
  return resolve(configDir, "credentials.json");
}

function keychainEntry(): SecretStore {
  const account = createHash("sha256").update(credentialsPath()).digest("hex");
  return new Entry(serviceName, account, process.platform === "linux" ? { linux: { store: "secret-service" } } : undefined);
}

async function writeCredentialsFile(credentials: unknown): Promise<string> {
  const path = credentialsPath();
  const directory = join(path, "..");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(credentials, null, 2)}\n`, { mode: 0o600 });
  await chmod(temporary, 0o600);
  await rename(temporary, path);
  await chmod(path, 0o600);
  return path;
}

export async function saveCredentials(credentials: Credentials, storage: CredentialStorage = "file", secretStore?: SecretStore): Promise<string> {
  if (storage === "file") return writeCredentialsFile(credentials);

  (secretStore ?? keychainEntry()).setPassword(JSON.stringify(credentials));
  const { authToken: _authToken, ...metadata } = credentials;
  return writeCredentialsFile({ ...metadata, storage: "keychain" });
}

export async function saveCredentialsWithFallback(credentials: Credentials, storage: CredentialStorage, secretStore?: SecretStore): Promise<CredentialSaveResult> {
  try {
    return { storage, path: await saveCredentials(credentials, storage, secretStore) };
  } catch (error) {
    if (storage !== "keychain") throw error;
    const path = await saveCredentials(credentials, "file");
    return { storage: "file", path, warning: error instanceof Error ? error.message : String(error) };
  }
}

export async function loadCredentials(secretStore?: SecretStore): Promise<Credentials | null> {
  try {
    const stored = JSON.parse(await readFile(credentialsPath(), "utf8")) as Partial<Credentials> & { storage?: CredentialStorage };
    if (stored.storage === "keychain") {
      const password = (secretStore ?? keychainEntry()).getPassword();
      return password ? JSON.parse(password) as Credentials : null;
    }
    return stored as Credentials;
  } catch {
    return null;
  }
}
