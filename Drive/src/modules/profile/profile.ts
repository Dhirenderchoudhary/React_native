import * as Crypto from "expo-crypto";
import { profileRepo } from "@/core/db/connect";
import { setOnboarded } from "@/shared/asyncFlags";

export const AVATAR_PRESETS = Array.from({ length: 27 }, (_, index) => {
  const label = String(index + 1).padStart(2, "0");
  return { id: `preset:${label}`, label };
});

export const INITIAL_COLORS = [
  "#e5e2da",
  "#cfccc4",
  "#8a8780",
  "#f1b54a",
  "#3ecf8e",
  "#6aa9ff",
] as const;

export type PresetAvatar = (typeof AVATAR_PRESETS)[number]["id"];
export type InitialsAvatar = `initials:#${string}`;

const profileListeners = new Set<() => void>();

export function subscribeToProfileChanges(listener: () => void): () => void {
  profileListeners.add(listener);
  return () => profileListeners.delete(listener);
}

function notifyProfileChanged(): void {
  profileListeners.forEach((listener) => listener());
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function parseAvatarKey(
  key: string,
  fallbackName = "",
): { kind: "preset" | "initials"; index?: number; color?: string; initials?: string } {
  if (key.startsWith("preset:")) {
    const idx = parseInt(key.slice(7), 10);
    if (idx >= 1 && idx <= 27) return { kind: "preset", index: idx };
  }
  if (key.startsWith("initials:")) {
    const rest = key.slice("initials:".length);
    const [color, ...letters] = rest.split(":");
    return {
      kind: "initials",
      color: color || INITIAL_COLORS[0],
      initials: (letters.join(":") || initialsFromName(fallbackName)),
    };
  }
  return { kind: "preset", index: 1 };
}

export async function saveProfile(
  name: string,
  avatarKey: string,
): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new Error("Name is required");
  await profileRepo.upsertProfile({ name: trimmed, avatar_key: avatarKey });
  await setOnboarded(true);
  notifyProfileChanged();
}

export async function generateProfileId(): Promise<string> {
  return Crypto.randomUUID();
}
