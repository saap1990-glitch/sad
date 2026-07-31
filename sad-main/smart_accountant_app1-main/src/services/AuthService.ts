import { getGlobalDb } from '../db/globalDb';

export class AuthService {
  static async waitForDb(timeout = 5000): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const db = getGlobalDb();
      if (db) return db;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Database not ready');
  }

  static async isPinEnabled(): Promise<boolean> {
    const db = await AuthService.waitForDb();
    const row = await db.getFirstAsync("SELECT value FROM settings WHERE key='auth_pin_enabled'") as any;
    return row?.value === 'true';
  }

  static async isBiometricEnabled(): Promise<boolean> {
    const db = await AuthService.waitForDb();
    const row = await db.getFirstAsync("SELECT value FROM settings WHERE key='auth_biometric_enabled'") as any;
    return row?.value === 'true';
  }

  static async setSetting(key: string, value: string): Promise<void> {
    const db = await AuthService.waitForDb();
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
}
