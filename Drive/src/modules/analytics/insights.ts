import { drivesRepo, eventsRepo, type Drive, type DriveEvent, type EventType } from "@/core/db/connect";

const insightsListeners = new Set<() => void>();
export function subscribeToInsightsChanges(cb: () => void): () => void {
  insightsListeners.add(cb);
  return () => insightsListeners.delete(cb);
}
export function notifyInsightsChanged(): void {
  insightsListeners.forEach((cb) => cb());
}

export const EVENT_TYPES: EventType[] = [
  "harsh_brake",
  "harsh_accel",
  "sharp_turn",
  "aggressive_steer",
  "device_movement",
  "phone_handling",
];

export const EVENT_LABELS: Record<EventType, string> = {
  harsh_brake: "Harsh Braking",
  harsh_accel: "Harsh Acceleration",
  sharp_turn: "Sharp Turns",
  aggressive_steer: "Aggressive Steering",
  device_movement: "Device Movement",
  phone_handling: "Phone Handling",
};

export type RiderInsights = {
  drives: Drive[];
  events: DriveEvent[];
  counts: Record<EventType, number>;
  averageScore: number;
  totalMinutes: number;
};

export async function getRiderInsights(): Promise<RiderInsights> {
  const drives = (await drivesRepo.listDrives(50)).filter(
    (drive) => drive.status === "completed",
  );
  const eventLists = await Promise.all(
    drives.map((drive) => eventsRepo.listEventsForDrive(drive.id)),
  );
  return summarize(drives, eventLists.flat());
}

export async function getRideInsights(
  driveId: string,
): Promise<{ drive: Drive | null; events: DriveEvent[]; counts: Record<EventType, number> }> {
  const [drive, events] = await Promise.all([
    drivesRepo.getDrive(driveId),
    eventsRepo.listEventsForDrive(driveId),
  ]);
  return { drive, events, counts: countByType(events) };
}

export function countByType(events: DriveEvent[]): Record<EventType, number> {
  const counts = Object.fromEntries(EVENT_TYPES.map((type) => [type, 0])) as Record<
    EventType,
    number
  >;
  for (const event of events) counts[event.type] += 1;
  return counts;
}

function summarize(drives: Drive[], events: DriveEvent[]): RiderInsights {
  const averageScore = drives.length
    ? Math.round(drives.reduce((sum, drive) => sum + drive.score, 0) / drives.length)
    : 100;
  const totalMinutes = Math.round(
    drives.reduce((sum, drive) => sum + drive.duration_s, 0) / 60,
  );
  return {
    drives,
    events: [...events].sort((a, b) => b.ts - a.ts),
    counts: countByType(events),
    averageScore,
    totalMinutes,
  };
}
