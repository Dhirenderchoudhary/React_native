import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "./index";

export type DriveStatus = "active" | "completed" | "discarded";

export type Drive = {
  id: string;
  started_at: number;
  ended_at: number | null;
  status: DriveStatus;
  score: number;
  safety_rating: string | null;
  distance_m: number;
  duration_s: number;
  max_speed_kph: number;
  avg_speed_kph: number;
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
  notes: string | null;
  ai_feedback: string | null;
  is_demo: number;
};

export type NewDrive = {
  id?: string;
  started_at: number;
  start_lat?: number | null;
  start_lng?: number | null;
  status?: DriveStatus;
};

export async function createDrive(
  data: NewDrive,
  db?: SQLiteDatabase,
): Promise<Drive> {
  const conn = db ?? (await getDatabase());
  const id = data.id ?? Crypto.randomUUID();
  await conn.runAsync(
    `INSERT INTO drives
       (id, started_at, status, start_lat, start_lng)
     VALUES (?, ?, ?, ?, ?)`,
    [
      id,
      data.started_at,
      data.status ?? "active",
      data.start_lat ?? null,
      data.start_lng ?? null,
    ],
  );
  const row = await getDrive(id, conn);
  if (!row) throw new Error("Failed to create drive");
  return row;
}

export async function getDrive(
  id: string,
  db?: SQLiteDatabase,
): Promise<Drive | null> {
  const conn = db ?? (await getDatabase());
  const row = await conn.getFirstAsync<Drive>(
    "SELECT * FROM drives WHERE id = ?",
    [id],
  );
  return row ?? null;
}

export async function getActiveDrive(db?: SQLiteDatabase): Promise<Drive | null> {
  const conn = db ?? (await getDatabase());
  const row = await conn.getFirstAsync<Drive>(
    "SELECT * FROM drives WHERE status = 'active' ORDER BY started_at DESC LIMIT 1",
  );
  return row ?? null;
}

export async function listDrives(
  limit = 50,
  db?: SQLiteDatabase,
): Promise<Drive[]> {
  const conn = db ?? (await getDatabase());
  return conn.getAllAsync<Drive>(
    "SELECT * FROM drives WHERE status != 'active' ORDER BY started_at DESC LIMIT ?",
    [limit],
  );
}

export type DriveUpdate = Partial<
  Omit<Drive, "id" | "started_at" | "status">
> & { status?: DriveStatus };

export async function updateDrive(
  id: string,
  patch: DriveUpdate,
  db?: SQLiteDatabase,
): Promise<Drive | null> {
  const conn = db ?? (await getDatabase());
  const keys = Object.keys(patch) as (keyof DriveUpdate)[];
  if (keys.length === 0) return getDrive(id, conn);
  const setSql = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => (patch as any)[k]);
  await conn.runAsync(`UPDATE drives SET ${setSql} WHERE id = ?`, [...values, id]);
  return getDrive(id, conn);
}
