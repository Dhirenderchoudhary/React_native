import type { EventSeverity, EventType } from "@/core/db/events.repo";

export type Sensitivity = "low" | "normal" | "high";

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type TelemetryFrame = {
  ts: number;
  speedMps?: number | null;
  acceleration?: Vector3 | null;
  gyroscope?: Vector3 | null;
};

export type DetectedEvent = {
  type: EventType;
  severity: EventSeverity;
  penalty: number;
  magnitude: number;
};

type DetectorThresholds = {
  brakeMps2: number;
  accelMps2: number;
  sharpTurnRadS: number;
  aggressiveSteerRadS: number;
  deviceMovementMps2: number;
  phoneHandlingMps2: number;
};

const GRAVITY = 9.80665;
const COOLDOWN_MS = 5000;

const THRESHOLDS: Record<Sensitivity, DetectorThresholds> = {
  low: {
    brakeMps2: 5.2,
    accelMps2: 5.2,
    sharpTurnRadS: 1.65,
    aggressiveSteerRadS: 2.3,
    deviceMovementMps2: 8,
    phoneHandlingMps2: 13,
  },
  normal: {
    brakeMps2: 4,
    accelMps2: 4,
    sharpTurnRadS: 1.25,
    aggressiveSteerRadS: 1.9,
    deviceMovementMps2: 6,
    phoneHandlingMps2: 10,
  },
  high: {
    brakeMps2: 3,
    accelMps2: 3,
    sharpTurnRadS: 0.95,
    aggressiveSteerRadS: 1.55,
    deviceMovementMps2: 4.5,
    phoneHandlingMps2: 8,
  },
};

export class TelemetryDetector {
  private previousSpeed: { speedMps: number; ts: number } | null = null;
  private readonly lastDetectedAt = new Map<EventType, number>();
  private readonly sensitivity: Sensitivity;

  constructor(sensitivity: Sensitivity = "normal") {
    this.sensitivity = sensitivity;
  }

  process(frame: TelemetryFrame): DetectedEvent[] {
    const thresholds = THRESHOLDS[this.sensitivity];
    const events: DetectedEvent[] = [];
    const speedMps = normalizeSpeed(frame.speedMps);

    if (speedMps != null) {
      const prior = this.previousSpeed;
      this.previousSpeed = { speedMps, ts: frame.ts };
      if (prior) {
        const elapsedSeconds = (frame.ts - prior.ts) / 1000;
        if (elapsedSeconds >= 0.35 && elapsedSeconds <= 5) {
          const longitudinalMps2 = (speedMps - prior.speedMps) / elapsedSeconds;
          const moving = Math.max(speedMps, prior.speedMps) >= 2;
          if (moving && longitudinalMps2 <= -thresholds.brakeMps2) {
            this.emit(events, frame.ts, {
              type: "harsh_brake",
              severity: severityFor(Math.abs(longitudinalMps2), thresholds.brakeMps2),
              penalty: penaltyFor(Math.abs(longitudinalMps2), thresholds.brakeMps2),
              magnitude: round(Math.abs(longitudinalMps2) / GRAVITY),
            });
          } else if (moving && longitudinalMps2 >= thresholds.accelMps2) {
            this.emit(events, frame.ts, {
              type: "harsh_accel",
              severity: severityFor(longitudinalMps2, thresholds.accelMps2),
              penalty: penaltyFor(longitudinalMps2, thresholds.accelMps2),
              magnitude: round(longitudinalMps2 / GRAVITY),
            });
          }
        }
      }
    }

    const rotation = magnitude(frame.gyroscope);
    if (rotation != null && (speedMps ?? this.previousSpeed?.speedMps ?? 0) >= 3) {
      if (rotation >= thresholds.aggressiveSteerRadS) {
        this.emit(events, frame.ts, {
          type: "aggressive_steer",
          severity: severityFor(rotation, thresholds.aggressiveSteerRadS),
          penalty: penaltyFor(rotation, thresholds.aggressiveSteerRadS),
          magnitude: round(rotation),
        });
      } else if (rotation >= thresholds.sharpTurnRadS) {
        this.emit(events, frame.ts, {
          type: "sharp_turn",
          severity: "light",
          penalty: 3,
          magnitude: round(rotation),
        });
      }
    }

    const motion = magnitude(frame.acceleration);
    if (motion != null) {
      const currentSpeed = speedMps ?? this.previousSpeed?.speedMps ?? 0;
      if (currentSpeed >= 2 && motion >= thresholds.phoneHandlingMps2) {
        this.emit(events, frame.ts, {
          type: "phone_handling",
          severity: severityFor(motion, thresholds.phoneHandlingMps2),
          penalty: penaltyFor(motion, thresholds.phoneHandlingMps2, 5),
          magnitude: round(motion),
        });
      } else if (motion >= thresholds.deviceMovementMps2) {
        this.emit(events, frame.ts, {
          type: "device_movement",
          severity: "light",
          penalty: 2,
          magnitude: round(motion),
        });
      }
    }

    return events;
  }

  private emit(events: DetectedEvent[], ts: number, event: DetectedEvent) {
    const lastDetected = this.lastDetectedAt.get(event.type) ?? 0;
    if (ts - lastDetected < COOLDOWN_MS) return;
    this.lastDetectedAt.set(event.type, ts);
    events.push(event);
  }
}

function magnitude(vector: Vector3 | null | undefined): number | null {
  if (!vector) return null;
  return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}

function normalizeSpeed(speedMps: number | null | undefined): number | null {
  if (speedMps == null || !Number.isFinite(speedMps) || speedMps < 0) return null;
  return speedMps;
}

function severityFor(value: number, threshold: number): EventSeverity {
  if (value >= threshold * 1.8) return "severe";
  if (value >= threshold * 1.25) return "moderate";
  return "light";
}

function penaltyFor(value: number, threshold: number, base = 3): number {
  const severity = severityFor(value, threshold);
  return severity === "severe" ? base + 7 : severity === "moderate" ? base + 3 : base;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
