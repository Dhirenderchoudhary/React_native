import { settingsRepo } from "@/core/db/connect";
import type { Sensitivity } from "./detector";

export const TELEMETRY_SETTING_KEYS = {
  sensitivity: "detection_sensitivity",
  batteryMode: "battery_efficiency",
  notifications: "critical_notifications",
  samplingRate: "sampling_rate_hz",
} as const;

export type TelemetrySettings = {
  sensitivity: Sensitivity;
  batteryMode: boolean;
  notifications: boolean;
  samplingRate: 30 | 60 | 120;
};

export async function getTelemetrySettings(): Promise<TelemetrySettings> {
  const settings = await settingsRepo.getAllSettings();
  const sensitivity = settings[TELEMETRY_SETTING_KEYS.sensitivity];
  const storedRate = Number(settings[TELEMETRY_SETTING_KEYS.samplingRate]);
  return {
    sensitivity: isSensitivity(sensitivity) ? sensitivity : "normal",
    batteryMode: settings[TELEMETRY_SETTING_KEYS.batteryMode] === "1",
    notifications: settings[TELEMETRY_SETTING_KEYS.notifications] !== "0",
    samplingRate: storedRate === 30 || storedRate === 120 ? storedRate : 60,
  };
}

export function isSensitivity(value: string | undefined): value is Sensitivity {
  return value === "low" || value === "normal" || value === "high";
}
