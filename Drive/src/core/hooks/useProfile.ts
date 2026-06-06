import { useCallback, useEffect, useState } from "react";
import { profileRepo } from "@/core/db/connect";
import { parseAvatarKey, subscribeToProfileChanges } from "@/modules/profile/profile";
import type { Profile } from "@/core/db/connect";

let cachedProfile: Profile | null | undefined;

export type UseProfileResult = {
  profile: Profile | null;
  avatar: ReturnType<typeof parseAvatarKey>;
  refresh: () => Promise<void>;
};

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(cachedProfile ?? null);

  const refresh = useCallback(async () => {
    try {
      const p = await profileRepo.getProfile();
      cachedProfile = p;
      setProfile(p);
    } catch {
      cachedProfile = null;
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToProfileChanges(() => {
      refresh();
    });
  }, [refresh]);

  const avatar = profile
    ? parseAvatarKey(profile.avatar_key, profile.name)
    : { kind: "preset" as const, index: 1 };

  return { profile, avatar, refresh };
}
