import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================
// العملات
// ============================================================
export const currencies = sqliteTable('currencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name_ar: text('name_ar').notNull(),
  name_en: text('name_en'),
  symbol: text('symbol'),
  is_base: integer('is_base').default(0),
  is_active: integer('is_active').default(1),
});

// ============================================================
// الحسابات
// ============================================================
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name_ar: text('name_ar').notNull(),
  name_en: text('name_en'),
  parent_id: integer('parent_id'),
  level: integer('level').notNull().default(1),
  type: text('type').notNull(), // asset, liability, expense, revenue
  nature: text('nature').notNull(), // debit, credit
  currency_id: integer('currency_id').references(() => currencies.id),
  opening_balance: real('opening_balance').default(0),
  current_balance: real('current_balance').default(0),
  is_postable: integer('is_postable').default(1),
  : integer('').default(1),
  is_virtual: integer('is_virtual').default(0),
  is_system: integer('is_system').default(0),
  is_leaf: integer('is_leaf').default(0),
  is_active: integer('is_active').default(1),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
  updated_at: text('updated_at').default('datetime("now")'),
});

// ============================================================
// روابط الحسابات
// ============================================================
export const accountLinks = sqliteTable('account_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  module: text('module').notNull(),
  entity_type: text('entity_type').notNull(),
  entity_id: integer('entity_id').notNull(),
  account_id: integer('account_id').references(() => accounts.id),
  created_at: text('created_at').default('datetime("now")'),
});

// ============================================================
// حسابات النظام
// ============================================================
export const systemAccounts = sqliteTable('system_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  account_id: integer('account_id').references(() => accounts.id),
  description: text('description'),
});

// ============================================================
// العملاء
// ============================================================
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  account_id: integer('account_id').references(() => accounts.id),
  code: text('code'),
  name_ar: text('name_ar').notNull(),
  name_en: text('name_en'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  tax_number: text('tax_number'),
  credit_limit: real('credit_limit').default(0),
  balance: real('balance').default(0),
  is_active: integer('is_active').default(1),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
  updated_at: text('updated_at').default('datetime("now")'),
});

// ============================================================
// الموردين
// ============================================================
export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  account_id: integer('account_id').references(() => accounts.id),
  code: text('code'),
  name_ar: text('name_ar').notNull(),
  name_en: text('name_en'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  tax_number: text('tax_number'),
  balance: real('balance').default(0),
  is_active: integer('is_active').default(1),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
  updated_at: text('updated_at').default('datetime("now")'),
});

// ============================================================
// البنوك
// ============================================================
export const banks = sqliteTable('banks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  account_id: integer('account_id').references(() => accounts.id),
  name_ar: text('name_ar').notNull(),
  account_number: text('account_number'),
  iban: text('iban'),
  swift: text('swift'),
  branch: text('branch'),
  contact: text('contact'),
  balance: real('balance').default(0),
  is_active: integer('is_active').default(1),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
  updated_at: text('updated_at').default('datetime("now")'),
});

// ============================================================
// شركات الصرافة
// ============================================================
export const exchangeCompanies = sqliteTable('exchange_companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  account_id: integer('account_id').references(() => accounts.id),
  name_ar: text('name_ar').notNull(),
  account_number: text('account_number'),
  buy_rate: real('buy_rate'),
  sell_rate: real('sell_rate'),
  balance: real('balance').default(0),
  contact: text('contact'),
  is_active: integer('is_active').default(1),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
  updated_at: text('updated_at').default('datetime("now")'),
});

// ============================================================
// المحافظ الإلكترونية
// ============================================================
export const wallets = sqliteTable('wallets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  account_id: integer('account_id').references(() => accounts.id),
  name_ar: text('name_ar').notNull(),
  wallet_number: text('wallet_number'),
  company: text('company'),
  balance: real('balance').default(0),
  is_active: integer('is_active').default(1),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
  updated_at: text('updated_at').default('datetime("now")'),
});

// ============================================================
// الأصناف
// ============================================================
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code'),
  name_ar: text('name_ar').notNull(),
  name_en: text('name_en'),
  category_id: integer('category_id'),
  unit_id: integer('unit_id'),
  purchase_price: real('purchase_price').default(0),
  sale_price: real('sale_price').default(0),
  is_active: integer('is_active').default(1),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
});

// ============================================================
// القيود اليومية
// ============================================================
export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entry_number: text('entry_number').notNull().unique(),
  date: text('date').notNull(),
  description: text('description'),
  reference: text('reference'),
  source_type: text('source_type'),
  source_id: integer('source_id'),
  total_debit: real('total_debit').default(0),
  total_credit: real('total_credit').default(0),
  status: text('status').default('draft'),
  is_posted: integer('is_posted').default(0),
  posted_at: text('posted_at'),
  created_at: text('created_at').default('datetime("now")'),
});

// ============================================================
// تفاصيل القيود
// ============================================================
export const journalLines = sqliteTable('journal_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entry_id: integer('entry_id').references(() => journalEntries.id),
  account_id: integer('account_id').references(() => accounts.id),
  description: text('description'),
  debit: real('debit').default(0),
  credit: real('credit').default(0),
  created_at: text('created_at').default('datetime("now")'),
});

// ============================================================
// فواتير المبيعات
// ============================================================
export const salesInvoices = sqliteTable('sales_invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoice_number: text('invoice_number').notNull().unique(),
  date: text('date').notNull(),
  customer_id: integer('customer_id').references(() => customers.id),
  total: real('total').default(0),
  tax: real('tax').default(0),
  discount: real('discount').default(0),
  net_total: real('net_total').default(0),
  status: text('status').default('draft'),
  journal_entry_id: integer('journal_entry_id').references(() => journalEntries.id),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
});

// ============================================================
// أصناف فاتورة المبيعات
// ============================================================
export const salesInvoiceItems = sqliteTable('sales_invoice_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoice_id: integer('invoice_id').references(() => salesInvoices.id),
  product_id: integer('product_id').references(() => products.id),
  quantity: real('quantity').default(0),
  price: real('price').default(0),
  total: real('total').default(0),
});

// ============================================================
// فواتير الشراء
// ============================================================
export const purchaseInvoices = sqliteTable('purchase_invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoice_number: text('invoice_number').notNull().unique(),
  date: text('date').notNull(),
  supplier_id: integer('supplier_id').references(() => suppliers.id),
  total: real('total').default(0),
  tax: real('tax').default(0),
  discount: real('discount').default(0),
  net_total: real('net_total').default(0),
  status: text('status').default('draft'),
  journal_entry_id: integer('journal_entry_id').references(() => journalEntries.id),
  notes: text('notes'),
  created_at: text('created_at').default('datetime("now")'),
});

// ============================================================
// التصنيفات والوحدات والمخازن
// ============================================================
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name_ar: text('name_ar').notNull(),
  name_en: text('name_en'),
  is_active: integer('is_active').default(1),
});

export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name_ar: text('name_ar').notNull(),
  name_en: text('name_en'),
  is_active: integer('is_active').default(1),
});

export const warehouses = sqliteTable('warehouses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  account_id: integer('account_id').references(() => accounts.id),
  name_ar: text('name_ar').notNull(),
  address: text('address'),
  is_active: integer('is_active').default(1),
});

// ============================================================
// الإعدادات
// ============================================================
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  group: text('group').default('general'),
});

// ============================================================
// تسلسل الترقيم
// ============================================================
export const numberSequences = sqliteTable('number_sequences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entity_type: text('entity_type').notNull(),
  prefix: text('prefix'),
  suffix: text('suffix'),
  current_number: integer('current_number').default(1),
  padding: integer('padding').default(4),
});
