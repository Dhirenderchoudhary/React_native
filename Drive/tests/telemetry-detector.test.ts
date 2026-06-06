// @ts-nocheck -- Executed directly by Node's strip-types runner.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TelemetryDetector } from "../src/services/telemetry/detector.js";

describe("TelemetryDetector", () => {
  it("detects harsh braking from GPS speed loss", () => {
    const detector = new TelemetryDetector("normal");
    detector.process({ ts: 10_000, speedMps: 15 });
    const events = detector.process({ ts: 11_000, speedMps: 9 });
    assert.equal(events[0]?.type, "harsh_brake");
    assert.equal(events[0]?.severity, "moderate");
  });

  it("detects harsh acceleration from GPS speed gain", () => {
    const detector = new TelemetryDetector("normal");
    detector.process({ ts: 10_000, speedMps: 3 });
    const events = detector.process({ ts: 11_000, speedMps: 9 });
    assert.equal(events[0]?.type, "harsh_accel");
  });

  it("detects a sharp turn while the vehicle is moving", () => {
    const detector = new TelemetryDetector("normal");
    detector.process({ ts: 10_000, speedMps: 8 });
    const events = detector.process({
      ts: 11_000,
      gyroscope: { x: 0.2, y: 0.1, z: 1.4 },
    });
    assert.equal(events[0]?.type, "sharp_turn");
  });

  it("detects phone handling from strong device motion while moving", () => {
    const detector = new TelemetryDetector("normal");
    detector.process({ ts: 10_000, speedMps: 8 });
    const events = detector.process({
      ts: 11_000,
      acceleration: { x: 11, y: 0, z: 0 },
    });
    assert.equal(events[0]?.type, "phone_handling");
  });

  it("suppresses repeated events during cooldown", () => {
    const detector = new TelemetryDetector("normal");
    detector.process({ ts: 10_000, speedMps: 15 });
    assert.equal(detector.process({ ts: 11_000, speedMps: 9 })[0]?.type, "harsh_brake");
    detector.process({ ts: 12_000, speedMps: 15 });
    const repeated = detector.process({ ts: 13_000, speedMps: 9 });
    assert.equal(repeated.some((event) => event.type === "harsh_brake"), false);
  });

  it("applies stricter thresholds in low sensitivity mode", () => {
    const low = new TelemetryDetector("low");
    const high = new TelemetryDetector("high");
    low.process({ ts: 10_000, speedMps: 10 });
    high.process({ ts: 10_000, speedMps: 10 });
    const lowEvents = low.process({ ts: 11_000, speedMps: 6.5 });
    const highEvents = high.process({ ts: 11_000, speedMps: 6.5 });
    assert.equal(lowEvents.some((event) => event.type === "harsh_brake"), false);
    assert.equal(highEvents.some((event) => event.type === "harsh_brake"), true);
  });

  it("ignores invalid GPS speed readings", () => {
    const detector = new TelemetryDetector("normal");
    detector.process({ ts: 10_000, speedMps: -1 });
    assert.deepEqual(detector.process({ ts: 11_000, speedMps: null }), []);
  });
});
