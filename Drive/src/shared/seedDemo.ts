import * as Crypto from "expo-crypto";
import { getDatabase } from "@/core/db/index";
import { drivesRepo, eventsRepo } from "@/core/db/connect";
import type { EventSeverity, EventType } from "@/core/db/events.repo";
import { notifyInsightsChanged } from "@/modules/analytics/insights";

type SeedDrive = {
  daysAgo: number;
  durationMin: number;
  score: number;
  rating: string;
  events: Array<{ type: EventType; severity: EventSeverity; penalty: number; magnitude: number }>;
};

const DEMO_DRIVES: SeedDrive[] = [
  {
    daysAgo: 1, durationMin: 18, score: 91, rating: "A",
    events: [
      { type: "harsh_brake", severity: "light", penalty: 5, magnitude: 0.38 },
      { type: "sharp_turn", severity: "light", penalty: 4, magnitude: 0.42 },
    ],
  },
  {
    daysAgo: 2, durationMin: 34, score: 78, rating: "B",
    events: [
      { type: "harsh_brake", severity: "moderate", penalty: 10, magnitude: 0.61 },
      { type: "harsh_accel", severity: "light", penalty: 5, magnitude: 0.44 },
      { type: "phone_handling", severity: "moderate", penalty: 7, magnitude: 0.55 },
    ],
  },
  {
    daysAgo: 3, durationMin: 12, score: 96, rating: "A",
    events: [
      { type: "device_movement", severity: "light", penalty: 4, magnitude: 0.31 },
    ],
  },
  {
    daysAgo: 5, durationMin: 47, score: 65, rating: "C",
    events: [
      { type: "harsh_brake", severity: "severe", penalty: 15, magnitude: 0.82 },
      { type: "sharp_turn", severity: "moderate", penalty: 10, magnitude: 0.67 },
      { type: "aggressive_steer", severity: "moderate", penalty: 8, magnitude: 0.58 },
      { type: "harsh_accel", severity: "light", penalty: 5, magnitude: 0.47 },
      { type: "phone_handling", severity: "light", penalty: 5, magnitude: 0.39 },
      { type: "harsh_brake", severity: "light", penalty: 5, magnitude: 0.41 },
      { type: "sharp_turn", severity: "light", penalty: 4, magnitude: 0.35 },
    ],
  },
  {
    daysAgo: 7, durationMin: 22, score: 88, rating: "B",
    events: [
      { type: "harsh_brake", severity: "light", penalty: 5, magnitude: 0.43 },
      { type: "phone_handling", severity: "moderate", penalty: 7, magnitude: 0.51 },
    ],
  },
];

export async function isDemoSeeded(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM drives WHERE is_demo = 1`
  );
  return (row?.count ?? 0) > 0;
}

export async function seedDemoData(): Promise<void> {
  const now = Date.now();
  for (const seed of DEMO_DRIVES) {
    const startedAt = now - seed.daysAgo * 86_400_000;
    const id = Crypto.randomUUID();
    await drivesRepo.createDrive({ id, started_at: startedAt, status: "active" });
    await drivesRepo.updateDrive(id, {
      status: "completed",
      ended_at: startedAt + seed.durationMin * 60_000,
      duration_s: seed.durationMin * 60,
      score: seed.score,
      safety_rating: seed.rating,
      distance_m: seed.durationMin * 400,
      is_demo: 1,
    });
    for (const ev of seed.events) {
      await eventsRepo.insertEvent({
        drive_id: id,
        type: ev.type,
        severity: ev.severity,
        penalty: ev.penalty,
        magnitude: ev.magnitude,
        ts: startedAt + Math.floor(Math.random() * seed.durationMin * 60_000),
        lat: null, lng: null, speed_kph: null, duration_ms: 0,
      });
    }
  }
  notifyInsightsChanged();
}

export async function unseedDemoData(): Promise<void> {
  const db = await getDatabase();
  // events cascade-delete via FK ON DELETE CASCADE
  await db.runAsync(`DELETE FROM drives WHERE is_demo = 1`);
  notifyInsightsChanged();
}
