import { getGlobalDb } from '../db/globalDb';

export class LicenseService {
  static async waitForDb(timeout = 5000): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const db = getGlobalDb();
      if (db) return db;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Database not ready');
  }

  static async getSetting(key: string): Promise<string | null> {
    const db = await LicenseService.waitForDb();
    const row = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]) as any;
    return row?.value || null;
  }

  static async setSetting(key: string, value: string): Promise<void> {
    const db = await LicenseService.waitForDb();
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }

  static async startTrial(): Promise<void> {
    const trialStart = new Date().toISOString();
    await LicenseService.setSetting('trial_start', trialStart);
    await LicenseService.setSetting('trial_active', 'true');
  }

  static async checkLicense() {
    try {
      let trialActive = await LicenseService.getSetting('trial_active');
      if (!trialActive) {
        await LicenseService.startTrial();
      }
      return { valid: true, tampered: false, message: 'مرخص' };
    } catch (e) {
      console.error('License check error:', e);
      return { valid: true, tampered: false, message: '' };
    }
  }
}
