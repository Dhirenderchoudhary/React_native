import * as Crypto from "expo-crypto";
import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "./index";

export type EventType =
  | "harsh_brake"
  | "harsh_accel"
  | "sharp_turn"
  | "aggressive_steer"
  | "device_movement"
  | "phone_handling";

export type EventSeverity = "light" | "moderate" | "severe";

export type DriveEvent = {
  id: string;
  drive_id: string;
  type: EventType;
  severity: EventSeverity;
  penalty: number;
  magnitude: number;
  ts: number;
  lat: number | null;
  lng: number | null;
  speed_kph: number | null;
  duration_ms: number;
};

export type NewEvent = Omit<DriveEvent, "id"> & { id?: string };

export async function insertEvent(
  data: NewEvent,
  db?: SQLiteDatabase,
): Promise<DriveEvent> {
  const conn = db ?? (await getDatabase());
  const id = data.id ?? Crypto.randomUUID();
  await conn.runAsync(
    `INSERT INTO events
       (id, drive_id, type, severity, penalty, magnitude, ts, lat, lng, speed_kph, duration_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.drive_id,
      data.type,
      data.severity,
      data.penalty,
      data.magnitude,
      data.ts,
      data.lat ?? null,
      data.lng ?? null,
      data.speed_kph ?? null,
      data.duration_ms ?? 0,
    ],
  );
  return { id, ...data } as DriveEvent;
}

export async function listEventsForDrive(
  drive_id: string,
  db?: SQLiteDatabase,
): Promise<DriveEvent[]> {
  const conn = db ?? (await getDatabase());
  return conn.getAllAsync<DriveEvent>(
    "SELECT * FROM events WHERE drive_id = ? ORDER BY ts ASC",
    [drive_id],
  );
}

export async function countEventsByType(
  drive_id: string,
  db?: SQLiteDatabase,
): Promise<Record<EventType, number>> {
  const conn = db ?? (await getDatabase());
  const rows = await conn.getAllAsync<{ type: EventType; n: number }>(
    "SELECT type, COUNT(*) as n FROM events WHERE drive_id = ? GROUP BY type",
    [drive_id],
  );
  const out: Record<EventType, number> = {
    harsh_brake: 0,
    harsh_accel: 0,
    sharp_turn: 0,
    aggressive_steer: 0,
    device_movement: 0,
    phone_handling: 0,
  };
  for (const r of rows) out[r.type] = r.n;
  return out;
}
