import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "./index";

export type DriveSample = {
  drive_id: string;
  ts: number;
  ax: number | null;
  ay: number | null;
  az: number | null;
  gx: number | null;
  gy: number | null;
  gz: number | null;
  lat: number | null;
  lng: number | null;
  speed_kph: number | null;
  heading: number | null;
};

export type NewSample = Omit<DriveSample, "ts"> & { ts: number };

export async function insertSample(
  s: NewSample,
  db?: SQLiteDatabase,
): Promise<void> {
  const conn = db ?? (await getDatabase());
  await conn.runAsync(
    `INSERT OR REPLACE INTO drive_samples
       (drive_id, ts, ax, ay, az, gx, gy, gz, lat, lng, speed_kph, heading)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      s.drive_id,
      s.ts,
      s.ax,
      s.ay,
      s.az,
      s.gx,
      s.gy,
      s.gz,
      s.lat,
      s.lng,
      s.speed_kph,
      s.heading,
    ],
  );
}

export async function bulkInsertSamples(
  samples: NewSample[],
  db?: SQLiteDatabase,
): Promise<void> {
  if (samples.length === 0) return;
  const conn = db ?? (await getDatabase());
  await conn.withTransactionAsync(async () => {
    for (const s of samples) {
      await conn.runAsync(
        `INSERT OR REPLACE INTO drive_samples
           (drive_id, ts, ax, ay, az, gx, gy, gz, lat, lng, speed_kph, heading)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.drive_id,
          s.ts,
          s.ax,
          s.ay,
          s.az,
          s.gx,
          s.gy,
          s.gz,
          s.lat,
          s.lng,
          s.speed_kph,
          s.heading,
        ],
      );
    }
  });
}

export async function listSamplesForDrive(
  drive_id: string,
  limit = 5000,
  db?: SQLiteDatabase,
): Promise<DriveSample[]> {
  const conn = db ?? (await getDatabase());
  return conn.getAllAsync<DriveSample>(
    "SELECT * FROM drive_samples WHERE drive_id = ? ORDER BY ts ASC LIMIT ?",
    [drive_id, limit],
  );
}

export async function downsampleForTrail(
  drive_id: string,
  maxPoints = 240,
  db?: SQLiteDatabase,
): Promise<{ ts: number; lat: number; lng: number; speed_kph: number | null }[]> {
  const conn = db ?? (await getDatabase());
  const total = await conn.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM drive_samples WHERE drive_id = ? AND lat IS NOT NULL",
    [drive_id],
  );
  const count = total?.n ?? 0;
  if (count === 0) return [];
  const step = Math.max(1, Math.floor(count / maxPoints));
  return conn.getAllAsync<{
    ts: number;
    lat: number;
    lng: number;
    speed_kph: number | null;
  }>(
    `SELECT ts, lat, lng, speed_kph
       FROM drive_samples
      WHERE drive_id = ? AND lat IS NOT NULL
      ORDER BY ts ASC`,
    [drive_id],
  ).then((rows) =>
    rows.filter((_, i) => i % step === 0).slice(0, maxPoints),
  );
}
