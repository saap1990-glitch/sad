import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { translations } from './translations';

class I18nService {
  private i18n: I18n;
  private static instance: I18nService;
  private currentLocale: string = 'ar';

  private constructor() {
    this.i18n = new I18n(translations);
    this.i18n.enableFallback = true;
    this.i18n.defaultLocale = 'ar';
    this.i18n.locale = 'ar';
  }

  static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  init() {
    try {
      // استخدام لغة الجهاز مباشرة
      const locales = getLocales();
      const deviceLang = locales[0]?.languageCode;
      this.currentLocale = deviceLang === 'en' ? 'en' : 'ar';
      this.i18n.locale = this.currentLocale;
    } catch {
      this.i18n.locale = 'ar';
      this.currentLocale = 'ar';
    }
  }

  t(key: string): string {
    return this.i18n.t(key) || key;
  }

  setLocale(locale: string) {
    this.i18n.locale = locale;
    this.currentLocale = locale;
  }

  getLocale(): string {
    return this.currentLocale;
  }

  isRTL(): boolean {
    return this.currentLocale === 'ar';
  }
}

export const i18n = I18nService.getInstance();
