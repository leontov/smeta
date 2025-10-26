import * as SQLite from 'expo-sqlite';

const DB_NAME = 'smeta.offline.db';

let database: SQLite.SQLiteDatabase | null = null;

export const getDatabase = () => {
  if (!database) {
    database = SQLite.openDatabase(DB_NAME);
  }
  return database;
};

export const ensureDatabase = async () => {
  const db = getDatabase();
  await executeAsync(db, `CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);
  await executeAsync(db, `CREATE TABLE IF NOT EXISTS normative_index (
      code TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      collection TEXT NOT NULL,
      work_type TEXT,
      vector BLOB
    )`);
  await executeAsync(db, `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL
    )`);
  await executeAsync(db, `CREATE TABLE IF NOT EXISTS project_norms (
      project_id TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      collection TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      PRIMARY KEY (project_id, code),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);
  await executeAsync(db, `CREATE TABLE IF NOT EXISTS project_settings (
      project_id TEXT PRIMARY KEY,
      calculation_method TEXT NOT NULL,
      region TEXT,
      index_profile TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);
};

export const executeAsync = (db: SQLite.SQLiteDatabase, sql: string, params: unknown[] = []) =>
  new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
