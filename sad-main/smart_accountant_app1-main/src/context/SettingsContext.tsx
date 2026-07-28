import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18n } from '../i18n/i18nService';
import { useDatabase } from './DatabaseContext';

interface SettingsState {
  language: string;
  theme: 'dark' | 'light';
  fontSize: number;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  autoBackup: boolean;
  preventNegativeSale: boolean;
  showTotals: boolean;
  showTransactionNumbers: boolean;
  darkMode: boolean;
}

interface SettingsContextType extends SettingsState {
  updateSetting: (key: keyof SettingsState, value: any) => Promise<void>;
  t: (key: string) => string;
}

const defaultSettings: SettingsState = {
  language: 'ar',
  theme: 'dark',
  fontSize: 14,
  pinEnabled: false,
  biometricEnabled: false,
  autoBackup: false,
  preventNegativeSale: false,
  showTotals: true,
  showTransactionNumbers: true,
  darkMode: true,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const { db, isReady } = useDatabase();

  useEffect(() => {
    if (!isReady || !db) return;
    
    async function init() {
      try {
        // إنشاء الجدول إذا لم يكن موجوداً
        await db!.execAsync("CREATE TABLE IF NOT EXISTS app_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, value TEXT)");
        await loadSettings();
      } catch (e) {
        console.log('Settings init error, using defaults:', e);
      }
    }
    
    init();
  }, [isReady, db]);

  async function loadSettings() {
    if (!db) return;
    try {
      const result = await db.getAllAsync("SELECT key, value FROM app_settings WHERE key IN ('language','theme','fontSize','pin_enabled','biometric_enabled','auto_backup','preventNegativeSale','showTotals','showTransactionNumbers','darkMode')") as any[];
      
      const newSettings = { ...defaultSettings };
      if (result) {
        result.forEach((row: any) => {
          if (row.key === 'language') newSettings.language = row.value || 'ar';
          else if (row.key === 'theme') newSettings.theme = row.value || 'dark';
          else if (row.key === 'fontSize') newSettings.fontSize = parseInt(row.value) || 14;
          else if (row.key === 'pin_enabled') newSettings.pinEnabled = row.value === 'true';
          else if (row.key === 'biometric_enabled') newSettings.biometricEnabled = row.value === 'true';
          else if (row.key === 'auto_backup') newSettings.autoBackup = row.value === 'true';
          else if (row.key === 'preventNegativeSale') newSettings.preventNegativeSale = row.value === 'true';
          else if (row.key === 'showTotals') newSettings.showTotals = row.value !== 'false';
          else if (row.key === 'showTransactionNumbers') newSettings.showTransactionNumbers = row.value !== 'false';
          else if (row.key === 'darkMode') newSettings.darkMode = row.value !== 'false';
        });
      }
      setSettings(newSettings);
      i18n.setLocale(newSettings.language);
    } catch (e) {
      console.log('Settings load error, using defaults:', e);
    }
  }

  async function updateSetting(key: keyof SettingsState, value: any) {
    if (!db) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?,?)", [key, String(value)]);
    } catch (e) {
      console.log('Settings save error:', e);
    }
    if (key === 'language') {
      i18n.setLocale(value);
    }
  }

  function t(key: string): string {
    return i18n.t(key);
  }

  return (
    <SettingsContext.Provider value={{ ...settings, updateSetting, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
