import { useCallback, useEffect, useState } from "react";
import { DeviceMotion } from "expo-sensors";
import * as Location from "expo-location";
import { setPermissionsGranted } from "@/shared/asyncFlags";
import {
  checkPermissions,
  fromExpoStatus,
  initialPermissions,
  type PermSnapshot,
  type PermStatus,
} from "@/shared/permissions";

export function usePermissions(autoCheck = true) {
  const [state, setState] = useState<PermSnapshot>(initialPermissions);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const snap = await checkPermissions();
      setState(snap);
      return snap;
    } catch {
      return initialPermissions;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setBusy(true);
    try {
      const r = await Location.requestForegroundPermissionsAsync();
      const next = fromExpoStatus(r.status);
      setState((s) => ({ ...s, location: next }));
      return next;
    } finally {
      setBusy(false);
    }
  }, []);

  const requestMotion = useCallback(async () => {
    setBusy(true);
    try {
      let next: PermStatus = "granted";
      try {
        const r = await DeviceMotion.requestPermissionsAsync();
        next = fromExpoStatus(r.status);
      } catch {
        next = "granted";
      }
      setState((s) => ({ ...s, motion: next }));
      return next;
    } finally {
      setBusy(false);
    }
  }, []);

  const requestAll = useCallback(async () => {
    setBusy(true);
    try {
      const locNext = await requestLocation();
      const motionNext = await requestMotion();
      const both = locNext === "granted" && motionNext === "granted";
      if (both) {
        await setPermissionsGranted(true);
      }
      return both;
    } finally {
      setBusy(false);
    }
  }, [requestLocation, requestMotion]);

  useEffect(() => {
    if (autoCheck) {
      void refresh();
    }
  }, [autoCheck, refresh]);

  const allGranted =
    state.location === "granted" && state.motion === "granted";

  return { state, busy, allGranted, refresh, requestLocation, requestMotion, requestAll };
}
