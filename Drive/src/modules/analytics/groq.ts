import type { Drive, DriveEvent, EventType } from "@/core/db/connect";
import type { RiderInsights } from "@/modules/analytics/insights";
import {
  COACHING_SYSTEM_PROMPT,
  createFallbackReport,
  parseCoachingReport,
  type CoachingEventCounts,
  type CoachingReport,
} from "./coaching";
import { getGroqApiKey } from "./groqKey";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT_MS = 12_000;

export type CoachingResult = {
  report: CoachingReport;
  source: "groq" | "local";
  notice: string;
};

export async function generateOverallCoaching(
  insights: RiderInsights,
): Promise<CoachingResult> {
  return generateCoaching(insights.counts, {
    scope: "overall rider insights",
    completedRides: insights.drives.length,
    averageScore: insights.averageScore,
    totalMinutes: insights.totalMinutes,
    eventCounts: insights.counts,
  });
}

export async function generateRideCoaching(
  drive: Drive,
  events: DriveEvent[],
  counts: Record<EventType, number>,
): Promise<CoachingResult> {
  return generateCoaching(counts, {
    scope: "single completed ride",
    ride: {
      durationMinutes: Math.round(drive.duration_s / 60),
      score: drive.score,
      rating: drive.safety_rating,
      distanceKm: round(drive.distance_m / 1000),
      averageSpeedKph: round(drive.avg_speed_kph),
      maxSpeedKph: round(drive.max_speed_kph),
    },
    eventCounts: counts,
    events: events.slice(0, 20).map((event) => ({
      type: event.type,
      severity: event.severity,
      penalty: event.penalty,
      magnitude: round(event.magnitude),
      speedKph: event.speed_kph == null ? null : round(event.speed_kph),
      durationMs: event.duration_ms,
    })),
  });
}

async function generateCoaching(
  counts: CoachingEventCounts,
  telemetry: Record<string, unknown>,
): Promise<CoachingResult> {
  const fallback = createFallbackReport(counts);
  const apiKey = await getGroqApiKey().catch(() => null);
  if (!apiKey) {
    return {
      report: fallback,
      source: "local",
      notice: "Add a Groq API key in Settings for AI coaching.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_completion_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: COACHING_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create parked-review driving coaching from this telemetry JSON:\n${JSON.stringify(
              telemetry,
            )}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Groq returned ${response.status}`);
    const body = (await response.json()) as GroqChatCompletion;
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Groq returned an empty response");
    return {
      report: parseCoachingReport(content),
      source: "groq",
      notice: "Generated from recorded telemetry by Groq.",
    };
  } catch {
    return {
      report: fallback,
      source: "local",
      notice: "Groq coaching is unavailable. Showing local telemetry coaching.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

type GroqChatCompletion = {
  choices?: Array<{ message?: { content?: string | null } }>;
};
