import Storage from "expo-sqlite/kv-store";

const ONBOARDED = "clutch.onboarded";
const PERMS_GRANTED = "clutch.permissions.granted";
const ACTIVE_DRIVE_ID = "clutch.activeDriveId";

export async function getOnboarded(): Promise<boolean> {
  return (await Storage.getItem(ONBOARDED)) === "1";
}
export async function setOnboarded(v: boolean): Promise<void> {
  await Storage.setItem(ONBOARDED, v ? "1" : "0");
}

export async function getPermissionsGranted(): Promise<boolean> {
  return (await Storage.getItem(PERMS_GRANTED)) === "1";
}
export async function setPermissionsGranted(v: boolean): Promise<void> {
  await Storage.setItem(PERMS_GRANTED, v ? "1" : "0");
}

export async function getActiveDriveId(): Promise<string | null> {
  return (await Storage.getItem(ACTIVE_DRIVE_ID)) ?? null;
}
export async function setActiveDriveId(id: string | null): Promise<void> {
  if (id == null) await Storage.removeItem(ACTIVE_DRIVE_ID);
  else await Storage.setItem(ACTIVE_DRIVE_ID, id);
}

export async function clearAllFlags(): Promise<void> {
  await Promise.all([
    Storage.removeItem(ONBOARDED),
    Storage.removeItem(PERMS_GRANTED),
    Storage.removeItem(ACTIVE_DRIVE_ID),
  ]);
}
