import { SQLiteDatabase } from 'expo-sqlite';

let dbInstance: SQLiteDatabase | null = null;

export function setGlobalDb(db: SQLiteDatabase) {
  dbInstance = db;
}

export function getGlobalDb(): SQLiteDatabase | null {
  return dbInstance;
}
