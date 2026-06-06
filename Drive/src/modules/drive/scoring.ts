export function calculateScore(penalties: number[]): number {
  return Math.max(
    0,
    Math.min(100, 100 - penalties.reduce((total, penalty) => total + penalty, 0)),
  );
}

export function ratingForScore(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "poor";
}
