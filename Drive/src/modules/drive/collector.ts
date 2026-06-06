import { Accelerometer, DeviceMotion, Gyroscope } from "expo-sensors";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { drivesRepo, eventsRepo, samplesRepo, type NewSample } from "@/core/db/connect";
import type { SensorKey, SensorState, LiveEvent } from "@/shared/driveStore";
import { TelemetryDetector, type Vector3 } from "./detector";
import { getTelemetrySettings } from "./settings";

type Subscription = { remove: () => void };

type CollectorOptions = {
  driveId: string;
  onEvent: (event: LiveEvent) => void;
  onSensor: (sensor: SensorKey, state: SensorState) => void;
};

type LatestTelemetry = {
  accel: Vector3 | null;
  gyro: Vector3 | null;
  motion: Vector3 | null;
  lat: number | null;
  lng: number | null;
  speedKph: number | null;
  heading: number | null;
};

let activeCollector: TelemetryCollector | null = null;

export async function startDriveTelemetry(options: CollectorOptions) {
  if (activeCollector?.driveId === options.driveId) return;
  await stopDriveTelemetry();
  const collector = new TelemetryCollector(options);
  activeCollector = collector;
  await collector.start();
}

export async function stopDriveTelemetry() {
  const collector = activeCollector;
  activeCollector = null;
  await collector?.stop();
}

class TelemetryCollector {
  readonly driveId: string;
  private readonly onEvent: CollectorOptions["onEvent"];
  private readonly onSensor: CollectorOptions["onSensor"];
  private readonly subscriptions: Subscription[] = [];
  private locationSubscription: Location.LocationSubscription | null = null;
  private sampleTimer: ReturnType<typeof setInterval> | null = null;
  private detector = new TelemetryDetector();
  private notifications = true;
  private stopped = false;
  private eventQueue: Promise<void> = Promise.resolve();
  private distanceM = 0;
  private speedTotalKph = 0;
  private speedSamples = 0;
  private maxSpeedKph = 0;
  private startCoordinate: { lat: number; lng: number } | null = null;
  private lastCoordinate: { lat: number; lng: number; ts: number } | null = null;
  private latest: LatestTelemetry = {
    accel: null,
    gyro: null,
    motion: null,
    lat: null,
    lng: null,
    speedKph: null,
    heading: null,
  };

  constructor(options: CollectorOptions) {
    this.driveId = options.driveId;
    this.onEvent = options.onEvent;
    this.onSensor = options.onSensor;
  }

  async start() {
    const settings = await getTelemetrySettings();
    if (this.stopped) return;
    this.detector = new TelemetryDetector(settings.sensitivity);
    this.notifications = settings.notifications;
    const intervalMs = Math.max(16, Math.round(1000 / settings.samplingRate));
    Accelerometer.setUpdateInterval(intervalMs);
    Gyroscope.setUpdateInterval(intervalMs);
    DeviceMotion.setUpdateInterval(intervalMs);

    await Promise.all([
      this.subscribeSensor("accel", Accelerometer, (measurement) => {
        this.latest.accel = measurement;
      }),
      this.subscribeSensor("gyro", Gyroscope, (measurement) => {
        this.latest.gyro = measurement;
        this.detect({ gyroscope: measurement });
      }),
      this.subscribeSensor("motion", DeviceMotion, (measurement) => {
        this.latest.motion = measurement.acceleration;
        this.detect({ acceleration: measurement.acceleration });
      }),
      this.subscribeLocation(settings.batteryMode),
    ]);

    if (this.stopped) return;
    const persistenceInterval = settings.batteryMode ? 1000 : 500;
    this.sampleTimer = setInterval(() => {
      void this.persistSample();
    }, persistenceInterval);
  }

  async stop() {
    this.stopped = true;
    if (this.sampleTimer) clearInterval(this.sampleTimer);
    this.sampleTimer = null;
    for (const subscription of this.subscriptions) subscription.remove();
    this.subscriptions.length = 0;
    this.locationSubscription?.remove();
    this.locationSubscription = null;
    await this.persistSample();
    await this.eventQueue;
    await this.persistRideMetrics();
    for (const sensor of ["accel", "gyro", "motion", "gps"] as SensorKey[]) {
      this.onSensor(sensor, "inactive");
    }
  }

  private async subscribeSensor<T>(
    key: SensorKey,
    sensor: {
      isAvailableAsync: () => Promise<boolean>;
      addListener: (listener: (measurement: T) => void) => Subscription;
    },
    listener: (measurement: T) => void,
  ) {
    try {
      const available = await sensor.isAvailableAsync();
      if (!available || this.stopped) {
        this.onSensor(key, "error");
        return;
      }
      this.subscriptions.push(sensor.addListener(listener));
      this.onSensor(key, "active");
    } catch {
      this.onSensor(key, "error");
    }
  }

  private async subscribeLocation(batteryMode: boolean) {
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== "granted" || this.stopped) {
        this.onSensor("gps", "error");
        return;
      }
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: batteryMode ? Location.Accuracy.Balanced : Location.Accuracy.High,
          timeInterval: batteryMode ? 3000 : 1000,
          distanceInterval: batteryMode ? 10 : 3,
        },
        (location) => this.handleLocation(location),
        () => this.onSensor("gps", "error"),
      );
      if (this.stopped) {
        subscription.remove();
        return;
      }
      this.locationSubscription = subscription;
      this.onSensor("gps", "active");
    } catch {
      this.onSensor("gps", "error");
    }
  }

  private handleLocation(location: Location.LocationObject) {
    const { latitude, longitude, heading, speed, accuracy } = location.coords;
    const speedMps = speed != null && speed >= 0 ? speed : null;
    const speedKph = speedMps == null ? null : speedMps * 3.6;
    const coordinate = { lat: latitude, lng: longitude, ts: location.timestamp };
    if ((accuracy ?? 0) <= 100) {
      this.startCoordinate ??= coordinate;
      if (this.lastCoordinate) {
        const elapsedSeconds = Math.max(1, (coordinate.ts - this.lastCoordinate.ts) / 1000);
        const segmentDistance = distanceMeters(this.lastCoordinate, coordinate);
        if (segmentDistance <= Math.max(100, elapsedSeconds * 80)) {
          this.distanceM += segmentDistance;
        }
      }
      this.lastCoordinate = coordinate;
    }
    if (speedKph != null) {
      this.maxSpeedKph = Math.max(this.maxSpeedKph, speedKph);
      this.speedTotalKph += speedKph;
      this.speedSamples += 1;
    }
    this.latest.lat = latitude;
    this.latest.lng = longitude;
    this.latest.heading = heading;
    this.latest.speedKph = speedKph;
    this.detect({ speedMps });
    void this.persistRideMetrics();
  }

  private detect(frame: {
    speedMps?: number | null;
    acceleration?: Vector3 | null;
    gyroscope?: Vector3 | null;
  }) {
    const ts = Date.now();
    for (const event of this.detector.process({ ts, ...frame })) {
      this.eventQueue = this.eventQueue.catch(() => undefined).then(async () => {
        const saved = await eventsRepo.insertEvent({
          drive_id: this.driveId,
          type: event.type,
          severity: event.severity,
          penalty: event.penalty,
          magnitude: event.magnitude,
          ts,
          lat: this.latest.lat,
          lng: this.latest.lng,
          speed_kph: this.latest.speedKph,
          duration_ms: 0,
        });
        this.onEvent(saved);
        if (this.notifications && saved.severity !== "light") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
            () => undefined,
          );
        }
      });
    }
  }

  private async persistSample() {
    if (
      this.latest.accel == null &&
      this.latest.gyro == null &&
      this.latest.lat == null
    ) {
      return;
    }
    const sample: NewSample = {
      drive_id: this.driveId,
      ts: Date.now(),
      ax: this.latest.accel?.x ?? this.latest.motion?.x ?? null,
      ay: this.latest.accel?.y ?? this.latest.motion?.y ?? null,
      az: this.latest.accel?.z ?? this.latest.motion?.z ?? null,
      gx: this.latest.gyro?.x ?? null,
      gy: this.latest.gyro?.y ?? null,
      gz: this.latest.gyro?.z ?? null,
      lat: this.latest.lat,
      lng: this.latest.lng,
      speed_kph: this.latest.speedKph,
      heading: this.latest.heading,
    };
    await samplesRepo.insertSample(sample).catch(() => undefined);
  }

  private async persistRideMetrics() {
    await drivesRepo
      .updateDrive(this.driveId, {
        distance_m: Math.round(this.distanceM),
        max_speed_kph: round(this.maxSpeedKph),
        avg_speed_kph: round(this.speedSamples ? this.speedTotalKph / this.speedSamples : 0),
        start_lat: this.startCoordinate?.lat ?? null,
        start_lng: this.startCoordinate?.lng ?? null,
        end_lat: this.lastCoordinate?.lat ?? null,
        end_lng: this.lastCoordinate?.lng ?? null,
      })
      .catch(() => undefined);
  }
}

function distanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const earthRadiusM = 6371000;
  const lat1 = degreesToRadians(from.lat);
  const lat2 = degreesToRadians(to.lat);
  const deltaLat = degreesToRadians(to.lat - from.lat);
  const deltaLng = degreesToRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
