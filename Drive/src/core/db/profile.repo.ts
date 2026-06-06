import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "./index";

export type Profile = {
  id: 1;
  name: string;
  avatar_key: string;
  created_at: number;
};

export async function getProfile(db?: SQLiteDatabase): Promise<Profile | null> {
  const conn = db ?? (await getDatabase());
  const row = await conn.getFirstAsync<Profile>(
    "SELECT id, name, avatar_key, created_at FROM profile WHERE id = 1",
  );
  return row ?? null;
}

export async function upsertProfile(
  data: Omit<Profile, "id" | "created_at"> & { created_at?: number },
  db?: SQLiteDatabase,
): Promise<Profile> {
  const conn = db ?? (await getDatabase());
  const existing = await getProfile(conn);
  if (existing) {
    await conn.runAsync(
      "UPDATE profile SET name = ?, avatar_key = ? WHERE id = 1",
      [data.name, data.avatar_key],
    );
    return { ...existing, name: data.name, avatar_key: data.avatar_key };
  }
  const created = data.created_at ?? Date.now();
  await conn.runAsync(
    "INSERT INTO profile (id, name, avatar_key, created_at) VALUES (1, ?, ?, ?)",
    [data.name, data.avatar_key, created],
  );
  return { id: 1, name: data.name, avatar_key: data.avatar_key, created_at: created };
}

export async function clearProfile(db?: SQLiteDatabase): Promise<void> {
  const conn = db ?? (await getDatabase());
  await conn.runAsync("DELETE FROM profile");
}
