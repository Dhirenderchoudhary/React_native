import { drivesRepo, eventsRepo, type Drive } from "@/core/db/connect";
import { setActiveDriveId, getActiveDriveId } from "@/shared/asyncFlags";
import { checkPermissions } from "@/shared/permissions";
import { stopDriveTelemetry } from "@/modules/drive/collector";
import { calculateScore, ratingForScore } from "@/modules/drive/scoring";

export async function startActiveDrive(): Promise<Drive> {
  const permissions = await checkPermissions();
  if (permissions.location !== "granted" || permissions.motion !== "granted") {
    throw new Error("Location and motion permissions are required to record a ride.");
  }
  const existing = await drivesRepo.getActiveDrive();
  if (existing) {
    await setActiveDriveId(existing.id);
    return existing;
  }
  const started_at = Date.now();
  const drive = await drivesRepo.createDrive({ started_at, status: "active" });
  await setActiveDriveId(drive.id);
  return drive;
}

export async function endActiveDrive(
  driveId: string,
  startedAt: number,
): Promise<Drive | null> {
  await stopDriveTelemetry();
  const ended_at = Date.now();
  const duration_s = Math.max(0, Math.round((ended_at - startedAt) / 1000));
  const events = await eventsRepo.listEventsForDrive(driveId);
  const persistedScore = calculateScore(events.map((event) => event.penalty));
  const rating = ratingForScore(persistedScore);
  const updated = await drivesRepo.updateDrive(driveId, {
    ended_at,
    status: "completed",
    score: persistedScore,
    safety_rating: rating,
    duration_s,
  });
  await setActiveDriveId(null);
  return updated;
}

export async function discardActiveDrive(driveId: string): Promise<void> {
  await stopDriveTelemetry();
  await drivesRepo.updateDrive(driveId, {
    ended_at: Date.now(),
    status: "discarded",
  });
  await setActiveDriveId(null);
}

export async function recoverActiveDrive(): Promise<Drive | null> {
  const id = await getActiveDriveId();
  const storedDrive = id ? await drivesRepo.getDrive(id) : null;
  const drive = storedDrive?.status === "active" ? storedDrive : await drivesRepo.getActiveDrive();
  if (drive) {
    await setActiveDriveId(drive.id);
    return drive;
  }
  await setActiveDriveId(null);
  return null;
}
