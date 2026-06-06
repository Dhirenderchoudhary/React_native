// @ts-nocheck -- Executed directly by Node's strip-types runner.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createFallbackReport,
  parseCoachingReport,
} from "../src/services/ai/coaching.js";

const validReport = {
  headline: "Smooth the next ride",
  summary: "Recorded events suggest earlier braking would be the most useful focus.",
  suggestions: [
    {
      title: "Leave more braking room",
      detail: "Increase following distance and begin braking earlier.",
      evidence: "2 harsh braking events were recorded.",
      priority: "high",
    },
  ],
  disclaimer: "Telemetry coaching is informational. Review it only while parked.",
};

describe("AI coaching response validation", () => {
  it("accepts a valid structured report", () => {
    assert.deepEqual(parseCoachingReport(JSON.stringify(validReport)), validReport);
  });

  it("accepts JSON wrapped in a code fence", () => {
    assert.deepEqual(
      parseCoachingReport(`\`\`\`json\n${JSON.stringify(validReport)}\n\`\`\``),
      validReport,
    );
  });

  it("rejects additional fields", () => {
    assert.throws(() =>
      parseCoachingReport(JSON.stringify({ ...validReport, unsafeMarkup: "<script>" })),
    );
  });

  it("rejects an invalid priority", () => {
    assert.throws(() =>
      parseCoachingReport(
        JSON.stringify({
          ...validReport,
          suggestions: [{ ...validReport.suggestions[0], priority: "critical" }],
        }),
      ),
    );
  });
});

describe("AI coaching fallback", () => {
  it("creates local evidence-based coaching when Groq is unavailable", () => {
    const report = createFallbackReport({
      harsh_brake: 2,
      harsh_accel: 0,
      sharp_turn: 0,
      aggressive_steer: 0,
      device_movement: 0,
      phone_handling: 0,
    });
    assert.equal(report.suggestions[0]?.title, "Leave more braking room");
    assert.match(report.suggestions[0]?.evidence ?? "", /2 harsh braking events/);
  });
});
