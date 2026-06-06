import { DeviceMotion } from "expo-sensors";
import * as Location from "expo-location";

export type PermStatus = "granted" | "denied" | "undetermined" | "unknown";

export type PermSnapshot = {
  location: PermStatus;
  motion: PermStatus;
};

export const initialPermissions: PermSnapshot = {
  location: "unknown",
  motion: "unknown",
};

export function fromExpoStatus(status: string | undefined): PermStatus {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  if (status === "undetermined") return "undetermined";
  return "unknown";
}

export async function checkPermissions(): Promise<PermSnapshot> {
  const location = await Location.getForegroundPermissionsAsync();
  let motionStatus = "granted";
  try {
    const motion = await DeviceMotion.getPermissionsAsync();
    motionStatus = motion.status;
  } catch {
    // Some Android devices expose sensors without a runtime motion prompt.
  }
  return {
    location: fromExpoStatus(location.status),
    motion: fromExpoStatus(motionStatus),
  };
}
