import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({ db: null, isReady: false });

let globalDb: SQLite.SQLiteDatabase | null = null;
export function getGlobalDb(): SQLite.SQLiteDatabase | null { return globalDb; }

export function DBProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const database = await SQLite.openDatabaseAsync('smart_accountant.db', { useNewConnection: true });
        await database.execAsync('PRAGMA journal_mode = WAL');
        await createAllTables(database);
        await seedAllData(database);
        if (mounted) {
          setDb(database);
          globalDb = database;
          setIsReady(true);
        }
      } catch (error) {
        console.error('DB Error:', error);
        if (mounted) setIsReady(true);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() { return useContext(DatabaseContext); }

async function createAllTables(db: SQLite.SQLiteDatabase) {
  const tables = [
    "CREATE TABLE IF NOT EXISTS app_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, value TEXT)",
    "CREATE TABLE IF NOT EXISTS currencies (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE, name_ar TEXT, symbol TEXT, is_base INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS exchange_rates (id INTEGER PRIMARY KEY AUTOINCREMENT, currency_id INTEGER, rate REAL, date TEXT)",
    "CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE, name_ar TEXT, name_en TEXT, parent_id INTEGER, level INTEGER DEFAULT 1, type TEXT, nature TEXT, currency_id INTEGER, opening_balance REAL DEFAULT 0, current_balance REAL DEFAULT 0, is_postable INTEGER DEFAULT 1, is_virtual INTEGER DEFAULT 0, is_system INTEGER DEFAULT 0, is_leaf INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, notes TEXT)",
    "CREATE TABLE IF NOT EXISTS account_balances (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, currency_code TEXT, balance REAL DEFAULT 0, UNIQUE(account_id, currency_code))",
    "CREATE TABLE IF NOT EXISTS account_links (id INTEGER PRIMARY KEY AUTOINCREMENT, module TEXT, entity_type TEXT, entity_id INTEGER, account_id INTEGER)",
    "CREATE TABLE IF NOT EXISTS system_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, account_id INTEGER)",
    "CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT, phone TEXT, email TEXT, address TEXT, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS suppliers (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT, phone TEXT, email TEXT, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS banks (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, name_ar TEXT, account_number TEXT, balance REAL DEFAULT 0, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS cash_boxes (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, name_ar TEXT, balance REAL DEFAULT 0, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, name_ar TEXT, wallet_number TEXT, company TEXT, balance REAL DEFAULT 0, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS exchange_companies (id INTEGER PRIMARY KEY AUTOINCREMENT, account_id INTEGER, name_ar TEXT, buy_rate REAL, sell_rate REAL, balance REAL DEFAULT 0, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT, purchase_price REAL DEFAULT 0, sale_price REAL DEFAULT 0, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS warehouses (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT, address TEXT, is_active INTEGER DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT)",
    "CREATE TABLE IF NOT EXISTS units (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT)",
    "CREATE TABLE IF NOT EXISTS brands (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT)",
    "CREATE TABLE IF NOT EXISTS journal_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_number TEXT UNIQUE, date TEXT, description TEXT, reference TEXT, source_type TEXT, total_debit REAL DEFAULT 0, total_credit REAL DEFAULT 0, is_posted INTEGER DEFAULT 0)",
    "CREATE TABLE IF NOT EXISTS journal_lines (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER, account_id INTEGER, description TEXT, debit REAL DEFAULT 0, credit REAL DEFAULT 0, foreign_amount REAL DEFAULT 0, foreign_currency TEXT, exchange_rate REAL DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS sales_invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT, date TEXT, customer_id INTEGER, total REAL DEFAULT 0, net_total REAL DEFAULT 0, status TEXT DEFAULT 'draft')",
    "CREATE TABLE IF NOT EXISTS purchase_invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT, date TEXT, supplier_id INTEGER, total REAL DEFAULT 0, net_total REAL DEFAULT 0, status TEXT DEFAULT 'draft')",
    "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, value TEXT)",
    "CREATE TABLE IF NOT EXISTS number_sequences (id INTEGER PRIMARY KEY AUTOINCREMENT, entity_type TEXT, prefix TEXT, current_number INTEGER DEFAULT 1, padding INTEGER DEFAULT 4)",
    "CREATE TABLE IF NOT EXISTS backup_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, size INTEGER, type TEXT DEFAULT 'manual')",
    "CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, entity_type TEXT, entity_id INTEGER, action TEXT, user TEXT DEFAULT 'user', timestamp TEXT DEFAULT (datetime('now')))",
  ];

  for (const sql of tables) {
    try { await db.execAsync(sql); } catch (e) {}
  }
  console.log('✅ تم إنشاء جميع الجداول');
}

async function seedAllData(db: SQLite.SQLiteDatabase) {
  try {
    const count = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM currencies');
    if ((count as any)?.cnt > 0) { console.log('✅ البيانات موجودة'); return; }
  } catch (e) {}

  console.log('🌱 إدخال البيانات الأولية...');

  await db.runAsync("INSERT INTO currencies (code, name_ar, symbol, is_base) VALUES ('YER','ريال يمني','﷼',1)");
  await db.runAsync("INSERT INTO currencies (code, name_ar, symbol) VALUES ('USD','دولار','$'),('SAR','ريال سعودي','﷼')");
  await db.runAsync("INSERT INTO settings (key, value) VALUES ('language','ar'),('theme','dark')");
  await db.runAsync("INSERT INTO exchange_rates (currency_id, rate, date) VALUES ((SELECT id FROM currencies WHERE code='USD'), 530, date('now'))");
  await db.runAsync("INSERT INTO exchange_rates (currency_id, rate, date) VALUES ((SELECT id FROM currencies WHERE code='SAR'), 141, date('now'))");

  const accs = [
    ['1','الأصول','Assets',1,'asset','debit'],
    ['2','الخصوم','Liabilities',1,'liability','credit'],
    ['3','المصروفات','Expenses',1,'expense','debit'],
    ['4','الإيرادات','Revenues',1,'revenue','credit'],
    ['11','الأصول المتداولة','Current Assets',2,'asset','debit'],
    ['12','الأصول غير المتداولة','Non-Current Assets',2,'asset','debit'],
    ['21','الخصوم المتداولة','Current Liabilities',2,'liability','credit'],
    ['22','الخصوم طويلة الأجل','Long-term Liabilities',2,'liability','credit'],
    ['31','المصروفات التشغيلية','Operating Expenses',2,'expense','debit'],
    ['32','المصروفات الإدارية','Admin Expenses',2,'expense','debit'],
    ['41','إيرادات النشاط الرئيسي','Main Revenue',2,'revenue','credit'],
    ['42','الإيرادات الأخرى','Other Revenue',2,'revenue','credit'],
    ['1101','الصندوق','Cash',3,'asset','debit'],
    ['1102','البنوك','Banks',3,'asset','debit'],
    ['1103','شركات الصرافة','Exchange',3,'asset','debit'],
    ['1104','المحافظ الإلكترونية','Wallets',3,'asset','debit'],
    ['1105','العملاء','Customers',3,'asset','debit'],
    ['1106','المخزون','Inventory',3,'asset','debit'],
    ['1107','العهد','Advances',3,'asset','debit'],
    ['1201','الأراضي','Land',3,'asset','debit'],
    ['1202','المباني','Buildings',3,'asset','debit'],
    ['1203','السيارات','Vehicles',3,'asset','debit'],
    ['1204','الأجهزة','Equipment',3,'asset','debit'],
    ['1205','الأثاث','Furniture',3,'asset','debit'],
    ['2101','الموردون','Suppliers',3,'liability','credit'],
    ['2102','أوراق الدفع','Notes Payable',3,'liability','credit'],
    ['2103','الرواتب المستحقة','Accrued Salaries',3,'liability','credit'],
    ['2104','الضرائب المستحقة','Taxes Payable',3,'liability','credit'],
    ['2201','القروض','Loans',3,'liability','credit'],
    ['3101','الرواتب','Salaries',3,'expense','debit'],
    ['3102','الإيجارات','Rent',3,'expense','debit'],
    ['3103','الكهرباء والمياه','Utilities',3,'expense','debit'],
    ['3104','الاتصالات','Telecom',3,'expense','debit'],
    ['3105','الصيانة','Maintenance',3,'expense','debit'],
    ['3106','الوقود','Fuel',3,'expense','debit'],
    ['3107','النقل','Transportation',3,'expense','debit'],
    ['3201','القرطاسية','Stationery',3,'expense','debit'],
    ['3202','المصروفات البنكية','Bank Charges',3,'expense','debit'],
    ['4101','المبيعات','Sales',3,'revenue','credit'],
    ['4102','إيرادات الخدمات','Service Revenue',3,'revenue','credit'],
    ['4201','إيرادات أخرى','Other Income',3,'revenue','credit'],
    ['110101','الصندوق الرئيسي','Main Cash',4,'asset','debit'],
  ];

  for (const [code, name_ar, name_en, level, type, nature] of accs) {
    await db.runAsync('INSERT INTO accounts (code, name_ar, name_en, level, type, nature, is_system, is_virtual, is_leaf, is_postable) VALUES (?,?,?,?,?,?,1,1,0,0)', [code, name_ar, name_en, level, type, nature]);
  }
  await db.runAsync("UPDATE accounts SET is_leaf=1, is_postable=1, is_virtual=0 WHERE code='110101'");

  const parents = [
    ['11','1'],['12','1'],['21','2'],['22','2'],['31','3'],['32','3'],['41','4'],['42','4'],
    ['1101','11'],['1102','11'],['1103','11'],['1104','11'],['1105','11'],['1106','11'],['1107','11'],
    ['1201','12'],['1202','12'],['1203','12'],['1204','12'],['1205','12'],
    ['2101','21'],['2102','21'],['2103','21'],['2104','21'],
    ['2201','22'],
    ['3101','31'],['3102','31'],['3103','31'],['3104','31'],['3105','31'],['3106','31'],['3107','31'],
    ['3201','32'],['3202','32'],
    ['4101','41'],['4102','41'],
    ['4201','42'],
    ['110101','1101'],['11','1'],['12','1'],['21','2'],['31','3'],['41','4'],['1101','11'],['1102','11'],['1103','11'],['1104','11'],['1105','11'],['1106','11'],['2101','21'],['3101','31'],['4101','41'],['110101','1101']];
  for (const [code, pCode] of parents) {
    const p = await db.getFirstAsync('SELECT id FROM accounts WHERE code=?', [pCode]) as any;
    if (p) await db.runAsync('UPDATE accounts SET parent_id=? WHERE code=?', [p.id, code]);
  }

  const sys = [['cash_account','110101'],['sales_account','4101'],['customer_parent','1105'],['supplier_parent','2101'],['bank_parent','1102'],['exchange_parent','1103'],['wallet_parent','1104']];
  for (const [key, code] of sys) {
    const a = await db.getFirstAsync('SELECT id FROM accounts WHERE code=?', [code]) as any;
    if (a) await db.runAsync('INSERT INTO system_accounts (key, account_id) VALUES (?,?)', [key, a.id]);
  }

  console.log('✅ تم إدخال البيانات الأولية');
}
