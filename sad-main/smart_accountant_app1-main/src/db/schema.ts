// ============================================================
// المخطط الكامل لقاعدة البيانات - جميع الجداول
// ============================================================

export const SCHEMA = {
  companies: `CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT,
    logo TEXT, activity TEXT, address TEXT, phone TEXT, email TEXT,
    tax_number TEXT, commercial_register TEXT,
    fiscal_year_start TEXT DEFAULT '01-01', fiscal_year_end TEXT DEFAULT '12-31',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  settings: `CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE,
    value TEXT, "group" TEXT DEFAULT 'general', type TEXT DEFAULT 'string',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  currencies: `CREATE TABLE IF NOT EXISTS currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL, name_en TEXT, symbol TEXT,
    decimal_places INTEGER DEFAULT 2, is_base INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  exchange_rates: `CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_id INTEGER REFERENCES currencies(id),
    rate REAL NOT NULL, date TEXT NOT NULL, source TEXT DEFAULT 'manual',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  account_groups: `CREATE TABLE IF NOT EXISTS account_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL, name_en TEXT,
    nature TEXT NOT NULL, type TEXT NOT NULL, normal_side TEXT NOT NULL,
    is_system INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  accounts: `CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL, name_en TEXT, parent_id INTEGER,
    level INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL, nature TEXT NOT NULL,
    group_id INTEGER REFERENCES account_groups(id),
    currency_id INTEGER REFERENCES currencies(id),
    opening_balance REAL DEFAULT 0, current_balance REAL DEFAULT 0,
    is_postable INTEGER DEFAULT 1,  INTEGER DEFAULT 1,
    is_virtual INTEGER DEFAULT 0, is_system INTEGER DEFAULT 0,
    is_leaf INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  account_links: `CREATE TABLE IF NOT EXISTS account_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL, entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    account_id INTEGER REFERENCES accounts(id),
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  system_accounts: `CREATE TABLE IF NOT EXISTS system_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE,
    account_id INTEGER REFERENCES accounts(id), description TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  customers: `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    code TEXT, name_ar TEXT NOT NULL, name_en TEXT,
    phone TEXT, email TEXT, address TEXT, tax_number TEXT,
    credit_limit REAL DEFAULT 0, balance REAL DEFAULT 0,
    group_id INTEGER, is_active INTEGER DEFAULT 1, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  suppliers: `CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    code TEXT, name_ar TEXT NOT NULL, name_en TEXT,
    phone TEXT, email TEXT, address TEXT, tax_number TEXT,
    balance REAL DEFAULT 0, is_active INTEGER DEFAULT 1, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  banks: `CREATE TABLE IF NOT EXISTS banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL, account_number TEXT,
    iban TEXT, swift TEXT,
    currency_id INTEGER REFERENCES currencies(id),
    balance REAL DEFAULT 0, branch TEXT, address TEXT, contact TEXT,
    is_active INTEGER DEFAULT 1, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  exchange_companies: `CREATE TABLE IF NOT EXISTS exchange_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL, account_number TEXT,
    currency_id INTEGER REFERENCES currencies(id),
    balance REAL DEFAULT 0, buy_rate REAL, sell_rate REAL,
    contact TEXT, is_active INTEGER DEFAULT 1, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  wallets: `CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL, wallet_number TEXT, company TEXT,
    currency_id INTEGER REFERENCES currencies(id),
    balance REAL DEFAULT 0, is_active INTEGER DEFAULT 1, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  products: `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT,
    name_ar TEXT NOT NULL, name_en TEXT,
    category_id INTEGER, unit_id INTEGER,
    purchase_price REAL DEFAULT 0, sale_price REAL DEFAULT 0,
    cost_account_id INTEGER REFERENCES accounts(id),
    sales_account_id INTEGER REFERENCES accounts(id),
    inventory_account_id INTEGER REFERENCES accounts(id),
    is_active INTEGER DEFAULT 1, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  journal_entries: `CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_number TEXT NOT NULL UNIQUE, date TEXT NOT NULL,
    description TEXT, reference TEXT,
    source_type TEXT, source_id INTEGER,
    total_debit REAL DEFAULT 0, total_credit REAL DEFAULT 0,
    currency_id INTEGER REFERENCES currencies(id),
    exchange_rate REAL DEFAULT 1,
    status TEXT DEFAULT 'draft', is_posted INTEGER DEFAULT 0,
    posted_at TEXT, created_by TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  journal_lines: `CREATE TABLE IF NOT EXISTS journal_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER REFERENCES journal_entries(id),
    account_id INTEGER REFERENCES accounts(id),
    description TEXT,
    debit REAL DEFAULT 0, credit REAL DEFAULT 0,
    currency_id INTEGER REFERENCES currencies(id),
    exchange_rate REAL DEFAULT 1,
    debit_local REAL DEFAULT 0, credit_local REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  ledger: `CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    entry_id INTEGER REFERENCES journal_entries(id),
    line_id INTEGER REFERENCES journal_lines(id),
    date TEXT NOT NULL, description TEXT,
    debit REAL DEFAULT 0, credit REAL DEFAULT 0, balance REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  audit_logs: `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, entity_id INTEGER,
    action TEXT NOT NULL, old_values TEXT, new_values TEXT,
    user TEXT DEFAULT 'user',
    timestamp TEXT DEFAULT (datetime('now')), ip_address TEXT
  )`,

  backup_logs: `CREATE TABLE IF NOT EXISTS backup_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL, size INTEGER,
    type TEXT DEFAULT 'manual', status TEXT DEFAULT 'success',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  ai_history: `CREATE TABLE IF NOT EXISTS ai_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT, role TEXT NOT NULL, content TEXT NOT NULL,
    command_type TEXT, status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  number_sequences: `CREATE TABLE IF NOT EXISTS number_sequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, prefix TEXT, suffix TEXT,
    current_number INTEGER DEFAULT 1, padding INTEGER DEFAULT 4,
    format TEXT, is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  sales_invoices: `CREATE TABLE IF NOT EXISTS sales_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL, customer_id INTEGER REFERENCES customers(id),
    total REAL DEFAULT 0, tax REAL DEFAULT 0, discount REAL DEFAULT 0,
    net_total REAL DEFAULT 0, status TEXT DEFAULT 'draft',
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  sales_invoice_items: `CREATE TABLE IF NOT EXISTS sales_invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER REFERENCES sales_invoices(id),
    product_id INTEGER REFERENCES products(id),
    quantity REAL DEFAULT 0, price REAL DEFAULT 0, total REAL DEFAULT 0,
    account_id INTEGER REFERENCES accounts(id)
  )`,

  purchase_invoices: `CREATE TABLE IF NOT EXISTS purchase_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    date TEXT NOT NULL, supplier_id INTEGER REFERENCES suppliers(id),
    total REAL DEFAULT 0, tax REAL DEFAULT 0, discount REAL DEFAULT 0,
    net_total REAL DEFAULT 0, status TEXT DEFAULT 'draft',
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`,

  purchase_invoice_items: `CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER REFERENCES purchase_invoices(id),
    product_id INTEGER REFERENCES products(id),
    quantity REAL DEFAULT 0, price REAL DEFAULT 0, total REAL DEFAULT 0,
    account_id INTEGER REFERENCES accounts(id)
  )`,

  cash_transactions: `CREATE TABLE IF NOT EXISTS cash_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cash_box_id INTEGER, date TEXT NOT NULL,
    type TEXT NOT NULL, amount REAL DEFAULT 0,
    description TEXT, journal_entry_id INTEGER REFERENCES journal_entries(id),
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  categories: `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL, name_en TEXT, type TEXT DEFAULT 'product',
    is_active INTEGER DEFAULT 1
  )`,

  units: `CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL, name_en TEXT, is_active INTEGER DEFAULT 1
  )`,

  warehouses: `CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER REFERENCES accounts(id),
    name_ar TEXT NOT NULL, address TEXT, is_active INTEGER DEFAULT 1
  )`,
};

export const ALL_TABLES = Object.values(SCHEMA);
