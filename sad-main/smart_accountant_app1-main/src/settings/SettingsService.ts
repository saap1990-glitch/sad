import { eventBus } from '../events/eventBus';

// ✅ الإعدادات الافتراضية
const DEFAULT_SETTINGS = {
  company: {
    name: 'المحاسب الذكي', logo: '', activity: '', address: '', phone: '',
    email: '', taxNumber: '', commercialRegister: '',
    fiscalYearStart: '01-01', fiscalYearEnd: '12-31', timezone: 'Asia/Aden',
  },
  system: {
    language: 'ar', direction: 'rtl', theme: 'dark',
    fontSize: 14, fontFamily: 'Cairo', dateFormat: 'yyyy-MM-dd',
    timeFormat: 'HH:mm', numberFormat: '#,##0.00',
  },
  currency: {
    base: 'YER', additional: ['USD', 'SAR'],
    decimals: 2, exchangeRate: 1, symbol: '﷼', autoUpdate: true,
  },
  fiscalYear: { current: '2024', openPeriod: '2024-06', allowClose: false },
  accounts: { autoNumber: true, maxLevels: 5, allowDelete: false, allowEdit: true, preventDeleteIfUsed: true },
  journal: { autoCreate: true, autoPost: true, manualApproval: false, allowUnapproved: false, allowReverse: true, allowEditAfterPost: false },
  sales: { invoicePrefix: 'CSI', allowNegative: false, creditLimit: 100000, paymentDays: 30, defaultTax: 5, defaultDiscount: 0 },
  purchases: { invoicePrefix: 'CPI', paymentDays: 30, defaultTax: 5, defaultDiscount: 0, inventoryMethod: 'weighted_average' },
  inventory: { minQty: 10, maxQty: 1000, allowNegative: false, periodic: false, uom: 'unit' },
  cashBank: { defaultCash: '111', defaultBank: '112', maxCash: 500000 },
  customers: { autoNumber: true, creditLimit: 50000, paymentDays: 30, allowNegativeBalance: false, dueAlerts: true },
  tax: { rate: 5, type: 'sales', account: '212', method: 'inclusive' },
  assets: { depreciationMethod: 'straight', defaultLife: 5, autoDepreciation: true },
  payroll: { workDays: 26, workHours: 8, allowances: {}, deductions: {} },
  backup: { auto: true, time: '02:00', location: 'local', keepCount: 5 },
  print: { paperSize: 'A4', printerType: 'pdf', showLogo: true, footer: 'شكراً لتعاملكم معنا', copies: 1 },
  security: { password: '', biometric: false, pin: '', autoLogout: 15, encryptDB: false },
  notifications: { lowStock: true, dueDate: true, backup: true, yearEnd: true },
  reports: { logo: '', pdfFormat: 'A4', excelFormat: 'xlsx', font: 'Cairo' },
  closing: { allowCloseYear: false, allowClosePeriod: false, autoCreateClosingEntries: true, preventEditAfterClose: true, requirePassword: true },
  ai: { enabled: true, voiceInput: true, autoAnalysis: true, suggestions: true },
};

class SettingsService {
  private settings: any = { ...DEFAULT_SETTINGS };
  private loaded = false;

  async load() {
    // تحميل من قاعدة البيانات أو AsyncStorage
    const stored = null; // await AsyncStorage.getItem('settings');
    if (stored) {
      this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    this.loaded = true;
    eventBus.emit('settings.loaded', this.settings);
    return this.settings;
  }

  get(key: string): any {
    const keys = key.split('.');
    let value = this.settings;
    for (const k of keys) {
      value = value?.[k];
    }
    return value ?? null;
  }

  getSection(section: string): any {
    return this.settings[section] || {};
  }

  getAll(): any {
    return { ...this.settings };
  }

  async update(key: string, value: any) {
    const keys = key.split('.');
    let obj = this.settings;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    // حفظ في AsyncStorage
    // await AsyncStorage.setItem('settings', JSON.stringify(this.settings));
    
    // ✅ إرسال حدث التغيير
    eventBus.emit('settings.changed', { key, value, section: keys[0] });
    
    // ✅ تطبيق التغيير على الواجهة فوراً
    this.applyUISettings();
    
    return this.settings;
  }

  private applyUISettings() {
    // تطبيق اللغة والاتجاه والمظهر
    const { language, direction, theme } = this.settings.system;
    eventBus.emit('ui.update', { language, direction, theme });
  }
}

export const settingsService = new SettingsService();
export default settingsService;
