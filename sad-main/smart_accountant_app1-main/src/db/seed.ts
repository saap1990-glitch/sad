import * as SQLite from 'expo-sqlite';
import { SCHEMA, ALL_TABLES } from './schema';

export async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  // إنشاء جميع الجداول
  for (const sql of ALL_TABLES) {
    await db.execAsync(sql);
  }

  // التحقق من وجود بيانات
  const count = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM accounts');
  if ((count as any)?.cnt > 0) return;

  // العملات
  await db.runAsync(`INSERT OR IGNORE INTO currencies (code, name_ar, name_en, symbol, is_base) VALUES 
    ('YER', 'ريال يمني', 'Yemeni Rial', '﷼', 1),
    ('USD', 'دولار أمريكي', 'US Dollar', '$', 0),
    ('SAR', 'ريال سعودي', 'Saudi Riyal', '﷼', 0),
    ('EUR', 'يورو', 'Euro', '€', 0)
  `);

  // الإعدادات الافتراضية
  const defaultSettings = [
    ['language', 'ar', 'system'], ['theme', 'dark', 'system'],
    ['direction', 'rtl', 'system'], ['fiscal_year_start', '01-01', 'fiscalYear'],
    ['fiscal_year_end', '12-31', 'fiscalYear'], ['auto_number_accounts', 'true', 'accounts'],
    ['max_account_levels', '5', 'accounts'], ['default_currency', 'YER', 'currency'],
    ['decimals', '2', 'currency'],
  ];
  for (const [k, v, g] of defaultSettings) {
    await db.runAsync('INSERT OR IGNORE INTO settings (key, value, "group") VALUES (?,?,?)', [k, v, g]);
  }

  // دليل الحسابات
  const accounts = [
    { code: '1', name_ar: 'الأصول', name_en: 'Assets', level: 1, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '2', name_ar: 'الخصوم', name_en: 'Liabilities', level: 1, type: 'liability', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '3', name_ar: 'المصروفات', name_en: 'Expenses', level: 1, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '4', name_ar: 'الإيرادات', name_en: 'Revenues', level: 1, type: 'revenue', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    // المستوى 2
    { code: '11', name_ar: 'الأصول المتداولة', name_en: 'Current Assets', level: 2, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '12', name_ar: 'الأصول غير المتداولة', name_en: 'Non-Current Assets', level: 2, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '21', name_ar: 'الخصوم المتداولة', name_en: 'Current Liabilities', level: 2, type: 'liability', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '22', name_ar: 'الخصوم طويلة الأجل', name_en: 'Long-term Liabilities', level: 2, type: 'liability', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '31', name_ar: 'المصروفات التشغيلية', name_en: 'Operating Expenses', level: 2, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '32', name_ar: 'المصروفات الإدارية', name_en: 'Admin Expenses', level: 2, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '33', name_ar: 'المصروفات البيعية', name_en: 'Selling Expenses', level: 2, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '41', name_ar: 'إيرادات النشاط الرئيسي', name_en: 'Main Revenue', level: 2, type: 'revenue', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '42', name_ar: 'الإيرادات الأخرى', name_en: 'Other Revenue', level: 2, type: 'revenue', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    // المستوى 3
    { code: '1101', name_ar: 'الصندوق', name_en: 'Cash', level: 3, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '1102', name_ar: 'البنوك', name_en: 'Banks', level: 3, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '1103', name_ar: 'شركات الصرافة', name_en: 'Exchange Companies', level: 3, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '1104', name_ar: 'المحافظ الإلكترونية', name_en: 'E-Wallets', level: 3, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '1105', name_ar: 'العملاء', name_en: 'Customers', level: 3, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '1106', name_ar: 'المخزون', name_en: 'Inventory', level: 3, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '1107', name_ar: 'العهد', name_en: 'Advances', level: 3, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '2101', name_ar: 'الموردون', name_en: 'Suppliers', level: 3, type: 'liability', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '2102', name_ar: 'الضرائب المستحقة', name_en: 'Taxes Payable', level: 3, type: 'liability', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '2103', name_ar: 'الرواتب المستحقة', name_en: 'Accrued Salaries', level: 3, type: 'liability', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '3101', name_ar: 'الرواتب', name_en: 'Salaries', level: 3, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '3102', name_ar: 'الإيجارات', name_en: 'Rent', level: 3, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '3103', name_ar: 'الكهرباء والمياه', name_en: 'Utilities', level: 3, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '3104', name_ar: 'الاتصالات', name_en: 'Telecom', level: 3, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '3105', name_ar: 'الصيانة', name_en: 'Maintenance', level: 3, type: 'expense', nature: 'debit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '4101', name_ar: 'المبيعات', name_en: 'Sales', level: 3, type: 'revenue', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    { code: '4102', name_ar: 'إيرادات الخدمات', name_en: 'Service Revenue', level: 3, type: 'revenue', nature: 'credit', is_system: 1, is_virtual: 1, is_leaf: 0, is_postable: 0 },
    // حسابات نهائية
    { code: '110101', name_ar: 'الصندوق الرئيسي', name_en: 'Main Cash', level: 4, type: 'asset', nature: 'debit', is_system: 1, is_virtual: 0, is_leaf: 1, is_postable: 1 },
  ];

  for (const acc of accounts) {
    await db.runAsync(
      `INSERT OR IGNORE INTO accounts (code, name_ar, name_en, level, type, nature, is_system, is_virtual, is_leaf, is_postable) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [acc.code, acc.name_ar, acc.name_en, acc.level, acc.type, acc.nature, acc.is_system, acc.is_virtual, acc.is_leaf, acc.is_postable]
    );
  }

  // حسابات النظام
  const sysAccounts = [
    ['cash_account', '110101', 'حساب الصندوق الافتراضي'],
    ['sales_account', '4101', 'حساب المبيعات'],
    ['customer_parent', '1105', 'الحساب الأب للعملاء'],
    ['supplier_parent', '2101', 'الحساب الأب للموردين'],
    ['bank_parent', '1102', 'الحساب الأب للبنوك'],
    ['exchange_parent', '1103', 'الحساب الأب لشركات الصرافة'],
    ['wallet_parent', '1104', 'الحساب الأب للمحافظ'],
  ];

  for (const [key, code, desc] of sysAccounts) {
    const acc = await db.getFirstAsync('SELECT id FROM accounts WHERE code = ?', [code]) as any;
    if (acc) {
      await db.runAsync('INSERT OR IGNORE INTO system_accounts (key, account_id, description) VALUES (?,?,?)', [key, acc.id, desc]);
    }
  }

  // إعدادات الترقيم
  const sequences = [
    ['account', '', '', 1, 4],
    ['customer', 'CUST-', '', 1, 4],
    ['supplier', 'SUPP-', '', 1, 4],
    ['journal', 'JV-', '', 1, 4],
    ['invoice_sale', 'INV-S-', '', 1, 4],
    ['invoice_purchase', 'INV-P-', '', 1, 4],
  ];
  for (const [type, pre, suf, num, pad] of sequences) {
    await db.runAsync('INSERT OR IGNORE INTO number_sequences (entity_type, prefix, suffix, current_number, padding) VALUES (?,?,?,?,?)', [type, pre, suf, num, pad]);
  }

  console.log('✅ Seed completed');
}
