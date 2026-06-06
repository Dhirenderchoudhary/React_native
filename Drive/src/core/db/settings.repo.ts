import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "./index";

export type SettingRow = { key: string; value: string };

export async function getSetting(
  key: string,
  db?: SQLiteDatabase,
): Promise<string | null> {
  const conn = db ?? (await getDatabase());
  const row = await conn.getFirstAsync<SettingRow>(
    "SELECT key, value FROM settings WHERE key = ?",
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(
  key: string,
  value: string,
  db?: SQLiteDatabase,
): Promise<void> {
  const conn = db ?? (await getDatabase());
  await conn.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

export async function deleteSetting(
  key: string,
  db?: SQLiteDatabase,
): Promise<void> {
  const conn = db ?? (await getDatabase());
  await conn.runAsync("DELETE FROM settings WHERE key = ?", [key]);
}

export async function getAllSettings(
  db?: SQLiteDatabase,
): Promise<Record<string, string>> {
  const conn = db ?? (await getDatabase());
  const rows = await conn.getAllAsync<SettingRow>("SELECT key, value FROM settings");
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}
