import { create } from "zustand";
import type { EventSeverity, EventType } from "@/core/db/events.repo";
import { calculateScore } from "@/modules/drive/scoring";

export type LiveEvent = {
  id: string;
  type: EventType;
  severity: EventSeverity;
  penalty: number;
  magnitude: number;
  ts: number;
};

export type SensorState = "active" | "inactive" | "error";
export type SensorKey = "gyro" | "accel" | "motion" | "gps";

type Sensors = Record<SensorKey, SensorState>;

type DriveState = {
  driveId: string | null;
  startedAt: number | null;
  score: number;
  events: LiveEvent[];
  sensors: Sensors;
  start: (driveId: string, startedAt?: number) => void;
  end: () => void;
  addEvent: (e: LiveEvent) => void;
  hydrateEvents: (events: LiveEvent[]) => void;
  setSensor: (name: SensorKey, state: SensorState) => void;
};

const initialSensors: Sensors = {
  gyro: "inactive",
  accel: "inactive",
  motion: "inactive",
  gps: "inactive",
};

export const useDriveStore = create<DriveState>((set) => ({
  driveId: null,
  startedAt: null,
  score: 100,
  events: [],
  sensors: initialSensors,
  start: (driveId, startedAt = Date.now()) =>
    set((state) => {
      if (state.driveId === driveId) return state;
      return {
        driveId,
        startedAt,
        score: 100,
        events: [],
        sensors: initialSensors,
      };
    }),
  end: () =>
    set({
      driveId: null,
      startedAt: null,
      score: 100,
      events: [],
      sensors: initialSensors,
    }),
  addEvent: (e) =>
    set((s) => ({
      events: [e, ...s.events].slice(0, 20),
      score: Math.max(0, Math.min(100, s.score - e.penalty)),
    })),
  hydrateEvents: (events) =>
    set({
      events: [...events].sort((a, b) => b.ts - a.ts).slice(0, 20),
      score: calculateScore(events.map((event) => event.penalty)),
    }),
  setSensor: (name, state) =>
    set((s) => ({ sensors: { ...s.sensors, [name]: state } })),
}));

export const EVENT_META: Record<
  EventType,
  { label: string; icon: import("@/core/ui/Icon").IconName }
> = {
  harsh_brake: { label: "Harsh Braking", icon: "brake" },
  harsh_accel: { label: "Harsh Acceleration", icon: "accel" },
  sharp_turn: { label: "Sharp Turn", icon: "steering" },
  aggressive_steer: { label: "Aggressive Steering", icon: "steering" },
  device_movement: { label: "Device Movement", icon: "handling" },
  phone_handling: { label: "Phone Handling", icon: "phone" },
};
