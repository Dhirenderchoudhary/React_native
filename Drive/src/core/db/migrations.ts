export interface Migration {
  version: number;
  sql: string;
}

const M1_PROFILE: string = `
CREATE TABLE IF NOT EXISTS profile (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  name        TEXT    NOT NULL,
  avatar_key  TEXT    NOT NULL,
  created_at  INTEGER NOT NULL
);
`;

const M2_DRIVES: string = `
CREATE TABLE IF NOT EXISTS drives (
  id              TEXT    PRIMARY KEY,
  started_at      INTEGER NOT NULL,
  ended_at        INTEGER,
  status          TEXT    NOT NULL CHECK (status IN ('active','completed','discarded')),
  score           INTEGER NOT NULL DEFAULT 100,
  safety_rating   TEXT,
  distance_m      REAL    NOT NULL DEFAULT 0,
  duration_s      INTEGER NOT NULL DEFAULT 0,
  max_speed_kph   REAL    NOT NULL DEFAULT 0,
  avg_speed_kph   REAL    NOT NULL DEFAULT 0,
  start_lat       REAL,
  start_lng       REAL,
  end_lat         REAL,
  end_lng         REAL,
  notes           TEXT,
  ai_feedback     TEXT
);
CREATE INDEX IF NOT EXISTS idx_drives_started_at ON drives (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_drives_status     ON drives (status);
`;

const M3_EVENTS: string = `
CREATE TABLE IF NOT EXISTS events (
  id          TEXT    PRIMARY KEY,
  drive_id    TEXT    NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  type        TEXT    NOT NULL,
  severity    TEXT    NOT NULL,
  penalty     INTEGER NOT NULL,
  magnitude   REAL    NOT NULL,
  ts          INTEGER NOT NULL,
  lat         REAL,
  lng         REAL,
  speed_kph   REAL,
  duration_ms INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_events_drive_id ON events (drive_id);
CREATE INDEX IF NOT EXISTS idx_events_ts       ON events (ts);
CREATE INDEX IF NOT EXISTS idx_events_type     ON events (type);
`;

const M4_SAMPLES: string = `
CREATE TABLE IF NOT EXISTS drive_samples (
  drive_id    TEXT    NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  ts          INTEGER NOT NULL,
  ax          REAL,
  ay          REAL,
  az          REAL,
  gx          REAL,
  gy          REAL,
  gz          REAL,
  lat         REAL,
  lng         REAL,
  speed_kph   REAL,
  heading     REAL,
  PRIMARY KEY (drive_id, ts)
);
CREATE INDEX IF NOT EXISTS idx_samples_drive_ts ON drive_samples (drive_id, ts);
`;

const M5_SETTINGS: string = `
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

const M6_IS_DEMO: string = `
ALTER TABLE drives ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0;
`;

export const MIGRATIONS: Migration[] = [
  { version: 1, sql: M1_PROFILE },
  { version: 2, sql: M2_DRIVES },
  { version: 3, sql: M3_EVENTS },
  { version: 4, sql: M4_SAMPLES },
  { version: 5, sql: M5_SETTINGS },
  { version: 6, sql: M6_IS_DEMO },
];
