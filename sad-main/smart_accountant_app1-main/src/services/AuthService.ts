import { getGlobalDb } from '../context/DatabaseContext';
import * as LocalAuthentication from 'expo-local-authentication';

export class AuthService {
  static async waitForDb(timeout = 5000): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const db = getGlobalDb();
      if (db) return db;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Database not ready after timeout');
  }

  static async setSetting(key: string, value: string): Promise<void> {
    const db = await this.waitForDb();
    await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?,?)", [key, value]);
  }

  static async getSetting(key: string): Promise<string | null> {
    try {
      const db = await this.waitForDb();
      const result = await db.getFirstAsync("SELECT value FROM app_settings WHERE key = ?", [key]) as any;
      return result?.value || null;
    } catch {
      return null;
    }
  }

  static async login(pin: string): Promise<boolean> {
    const savedPin = await this.getSetting('user_pin');
    if (!savedPin) {
      await this.setSetting('user_pin', pin);
      return true;
    }
    return savedPin === pin;
  }

  static async logout(): Promise<void> {}

  static async isPinEnabled(): Promise<boolean> {
    const val = await this.getSetting('pin_enabled');
    return val === 'true';
  }

  static async isBiometricEnabled(): Promise<boolean> {
    const val = await this.getSetting('biometric_enabled');
    return val === 'true';
  }

  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch {
      return false;
    }
  }

  static async loginWithBiometrics(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'بصمة الإصبع لتسجيل الدخول',
        fallbackLabel: 'استخدام PIN',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  }

  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.setSetting('biometric_enabled', String(enabled));
  }
}
