import { SQLiteDatabase } from 'expo-sqlite';

export async function runMigrations(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode=WAL');
  await db.execAsync('PRAGMA foreign_keys=ON');

  await db.execAsync(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT, "group" TEXT DEFAULT 'general')`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    symbol TEXT,
    exchange_rate REAL DEFAULT 1,
    is_base INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_id INTEGER REFERENCES currencies(id),
    rate REAL NOT NULL,
    date TEXT NOT NULL,
    source TEXT DEFAULT 'manual',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS account_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    nature TEXT NOT NULL,
    type TEXT NOT NULL,
    normal_side TEXT NOT NULL,
    is_system INTEGER DEFAULT 0
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    parent_id INTEGER,
    level INTEGER DEFAULT 1,
    type TEXT NOT NULL,
    nature TEXT DEFAULT 'debit',
    currency_id INTEGER REFERENCES currencies(id),
    opening_balance REAL DEFAULT 0,
    current_balance REAL DEFAULT 0,
    is_postable INTEGER DEFAULT 1,
    is_virtual INTEGER DEFAULT 0,
    is_system INTEGER DEFAULT 0,
    is_leaf INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    code TEXT,
    name_ar TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    balance REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    code TEXT,
    name_ar TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    balance REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL,
    account_number TEXT,
    balance REAL DEFAULT 0,
    currency_id INTEGER REFERENCES currencies(id),
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL,
    wallet_number TEXT,
    balance REAL DEFAULT 0,
    currency_id INTEGER REFERENCES currencies(id),
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS exchange_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL,
    account_number TEXT,
    balance REAL DEFAULT 0,
    currency_id INTEGER REFERENCES currencies(id),
    buy_rate REAL,
    sell_rate REAL,
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS cash_boxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL,
    balance REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT,
    name_ar TEXT NOT NULL,
    unit TEXT DEFAULT 'وحدة',
    purchase_price REAL DEFAULT 0,
    sale_price REAL DEFAULT 0,
    cost_account_id INTEGER REFERENCES accounts(id),
    sales_account_id INTEGER REFERENCES accounts(id),
    inventory_account_id INTEGER REFERENCES accounts(id),
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL,
    address TEXT,
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_number TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL,
    description TEXT,
    source_type TEXT,
    reference TEXT,
    currency_id INTEGER REFERENCES currencies(id),
    exchange_rate REAL DEFAULT 1,
    total_debit REAL DEFAULT 0,
    total_credit REAL DEFAULT 0,
    is_posted INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS journal_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER REFERENCES journal_entries(id),
    account_id INTEGER REFERENCES accounts(id),
    description TEXT,
    debit REAL DEFAULT 0,
    credit REAL DEFAULT 0,
    debit_local REAL DEFAULT 0,
    credit_local REAL DEFAULT 0,
    currency_id INTEGER REFERENCES currencies(id),
    exchange_rate REAL DEFAULT 1,
    foreign_amount REAL DEFAULT 0,
    foreign_currency TEXT DEFAULT NULL
  );`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS account_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    account_id INTEGER REFERENCES accounts(id)
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS system_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    account_id INTEGER REFERENCES accounts(id),
    description TEXT
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS reps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    phone TEXT,
    is_active INTEGER DEFAULT 1
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    doc_number TEXT,
    warehouse_id INTEGER REFERENCES warehouses(id),
    to_warehouse_id INTEGER,
    date TEXT NOT NULL,
    description TEXT,
    total REAL DEFAULT 0,
    debit_account_id INTEGER REFERENCES accounts(id),
    credit_account_id INTEGER REFERENCES accounts(id),
    posted INTEGER DEFAULT 0
  )`);

  await db.execAsync(`CREATE TABLE IF NOT EXISTS inventory_transaction_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER REFERENCES inventory_transactions(id),
    product_id INTEGER REFERENCES products(id),
    quantity REAL NOT NULL,
    unit TEXT,
    price REAL,
    total REAL
  )`);

  console.log('✅ جميع الجداول جاهزة');
}
