import { useEffect } from "react";
import { eventsRepo } from "@/core/db/connect";
import { startDriveTelemetry, stopDriveTelemetry } from "@/modules/drive/collector";
import { useDriveStore } from "@/shared/driveStore";

export function DriveTelemetryBridge() {
  const driveId = useDriveStore((state) => state.driveId);
  const addEvent = useDriveStore((state) => state.addEvent);
  const hydrateEvents = useDriveStore((state) => state.hydrateEvents);
  const setSensor = useDriveStore((state) => state.setSensor);

  useEffect(() => {
    let mounted = true;
    if (!driveId) {
      void stopDriveTelemetry();
      return;
    }
    eventsRepo
      .listEventsForDrive(driveId)
      .then((events) => {
        if (!mounted) return;
        hydrateEvents(events);
        return startDriveTelemetry({
          driveId,
          onEvent: addEvent,
          onSensor: setSensor,
        });
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      void stopDriveTelemetry();
    };
  }, [addEvent, driveId, hydrateEvents, setSensor]);

  return null;
}
