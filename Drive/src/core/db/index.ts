import * as SQLite from "expo-sqlite";
import { MIGRATIONS } from "./migrations";

const DB_NAME = "clutch.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      PRAGMA synchronous = NORMAL;
    `);
    await runMigrations(db);
    dbInstance = db;
    return db;
  })();
  return initPromise;
}

async function runMigrations(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    await db.execAsync(`BEGIN; ${migration.sql}; COMMIT;`);
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
  }
}

export async function resetDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
  if (initPromise) {
    initPromise = null;
  }
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    DROP TABLE IF EXISTS drive_samples;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS drives;
    DROP TABLE IF EXISTS profile;
    DROP TABLE IF EXISTS settings;
  `);
  await db.closeAsync();
  initPromise = null;
}
