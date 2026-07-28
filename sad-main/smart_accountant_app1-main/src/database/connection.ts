import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;

  const expoDb = await SQLite.openDatabaseAsync('smart_accountant_v2.db', {
    useNewConnection: true,
  });

  // تفعيل WAL للمزامنة
  await expoDb.execAsync('PRAGMA journal_mode = WAL');
  await expoDb.execAsync('PRAGMA foreign_keys = ON');

  dbInstance = drizzle(expoDb, { schema });
  return dbInstance;
}

export function getDb() {
  return dbInstance;
}
