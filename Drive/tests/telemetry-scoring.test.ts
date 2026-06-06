// @ts-nocheck -- Executed directly by Node's strip-types runner.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateScore, ratingForScore } from "../src/services/telemetry/scoring.js";

describe("telemetry scoring", () => {
  it("subtracts penalties from a perfect score", () => {
    assert.equal(calculateScore([5, 3, 2]), 90);
  });

  it("clamps scores to zero", () => {
    assert.equal(calculateScore([80, 40]), 0);
  });

  it("maps score boundaries to ratings", () => {
    assert.equal(ratingForScore(90), "excellent");
    assert.equal(ratingForScore(75), "good");
    assert.equal(ratingForScore(60), "fair");
    assert.equal(ratingForScore(59), "poor");
  });
});
