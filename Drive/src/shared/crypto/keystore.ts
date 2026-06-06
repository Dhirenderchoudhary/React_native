import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
} from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const MASTER_KEY_SLOT = "clutch.kdf.master";
const MASTER_KEY_ACCESS: number = SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY;

let cachedKey: AESEncryptionKey | null = null;

async function loadOrCreateMasterKey(): Promise<AESEncryptionKey> {
  if (cachedKey) return cachedKey;
  const existingHex = await SecureStore.getItemAsync(MASTER_KEY_SLOT, {
    keychainAccessible: MASTER_KEY_ACCESS,
  });
  if (existingHex) {
    cachedKey = await AESEncryptionKey.import(existingHex, "hex");
    return cachedKey;
  }
  const fresh = await AESEncryptionKey.generate(256);
  const hex = await fresh.encoded("hex");
  await SecureStore.setItemAsync(MASTER_KEY_SLOT, hex, {
    keychainAccessible: MASTER_KEY_ACCESS,
  });
  cachedKey = fresh;
  return fresh;
}

function toBase64(s: string): string {
  if (typeof globalThis.btoa === "function") return globalThis.btoa(s);
  const g = globalThis as unknown as { Buffer?: { from: (d: string, enc: string) => { toString: (e: string) => string } } };
  if (g.Buffer) return g.Buffer.from(s, "utf-8").toString("base64");
  throw new Error("No base64 encoder available");
}

function fromBase64(b64: string): string {
  if (typeof globalThis.atob === "function") return globalThis.atob(b64);
  const g = globalThis as unknown as { Buffer?: { from: (d: string, enc: string) => { toString: (e: string) => string } } };
  if (g.Buffer) return g.Buffer.from(b64, "base64").toString("utf-8");
  throw new Error("No base64 decoder available");
}

export async function encryptString(plaintext: string): Promise<string> {
  const key = await loadOrCreateMasterKey();
  const sealed = await aesEncryptAsync(toBase64(plaintext), key);
  return (await sealed.combined("base64")) as unknown as string;
}

export async function decryptString(combinedBase64: string): Promise<string> {
  const key = await loadOrCreateMasterKey();
  const sealed = AESSealedData.fromCombined(combinedBase64);
  const out = (await aesDecryptAsync(sealed, key, { output: "base64" })) as unknown as string;
  return fromBase64(out);
}

export async function hasMasterKey(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(MASTER_KEY_SLOT, {
    keychainAccessible: MASTER_KEY_ACCESS,
  });
  return !!v;
}

export async function destroyMasterKey(): Promise<void> {
  await SecureStore.deleteItemAsync(MASTER_KEY_SLOT);
  cachedKey = null;
}

export const _internals = {
  MASTER_KEY_SLOT,
  loadOrCreateMasterKey,
  toBase64,
  fromBase64,
};
