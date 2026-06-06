import * as SecureStore from "expo-secure-store";

const GROQ_API_KEY_SLOT = "clutch.groq.apiKey";
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export function normalizeGroqApiKey(value: string) {
  return value.trim();
}

export function isValidGroqApiKey(value: string) {
  const key = normalizeGroqApiKey(value);
  return key.startsWith("gsk_") && key.length >= 24;
}

export async function saveGroqApiKey(value: string) {
  const key = normalizeGroqApiKey(value);
  if (!isValidGroqApiKey(key)) throw new Error("Enter a valid Groq API key.");
  await SecureStore.setItemAsync(GROQ_API_KEY_SLOT, key, OPTIONS);
}

export async function getGroqApiKey() {
  return SecureStore.getItemAsync(GROQ_API_KEY_SLOT, OPTIONS);
}

export async function hasGroqApiKey() {
  return Boolean(await getGroqApiKey());
}

export async function deleteGroqApiKey() {
  await SecureStore.deleteItemAsync(GROQ_API_KEY_SLOT, OPTIONS);
}
