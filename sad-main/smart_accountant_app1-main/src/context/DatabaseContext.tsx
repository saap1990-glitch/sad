import React, { createContext, useContext, useEffect, useState } from 'react';
import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite';
import { runMigrations } from '../db/migrations';
import { seedAccounts } from '../db/seed';
import { setGlobalDb } from '../db/globalDb';

interface DBContextType {
  db: SQLiteDatabase | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DBContextType>({ db: null, isReady: false });

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const database = await openDatabaseAsync('smart_accountant.db');
      setGlobalDb(database);
      await runMigrations(database);
      await seedAccounts(database);
      setDb(database);
      setIsReady(true);
    }
    init();
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
