import * as SQLite from 'expo-sqlite';
let db: any = null;
export const getDatabase = async () => {
  if (!db) db = await SQLite.openDatabaseAsync('smart_accountant.db');
  return db;
};
export default { getDatabase };
