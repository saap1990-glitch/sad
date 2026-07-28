import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';

// ================================================================
// الشركة
// ================================================================
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  taxId: text('tax_id'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  logo: text('logo'),
  fiscalYearStart: text('fiscal_year_start'),
  fiscalYearEnd: text('fiscal_year_end'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// العملات
// ================================================================
export const currencies = sqliteTable('currencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  symbol: text('symbol').notNull(),
  isBase: integer('is_base', { mode: 'boolean' }).default(false),
  decimalPlaces: integer('decimal_places').default(2),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// أسعار الصرف
// ================================================================
export const exchangeRates = sqliteTable('exchange_rates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  currencyId: integer('currency_id').notNull().references(() => currencies.id),
  rate: real('rate').notNull(),
  date: text('date').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// دليل الحسابات (5 مستويات)
// ================================================================
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  type: text('type', { enum: ['asset', 'liability', 'expense', 'revenue'] }).notNull(),
  nature: text('nature', { enum: ['debit', 'credit'] }).notNull().default('debit'),
  level: integer('level').notNull().default(1),
  parentId: integer('parent_id').references(() => accounts.id),
  currencyId: integer('currency_id').notNull().references(() => currencies.id),
  isPostable: integer('is_postable', { mode: 'boolean' }).default(true),
  allowMovements: integer('', { mode: 'boolean' }).default(true),
  isVirtual: integer('is_virtual', { mode: 'boolean' }).default(false),
  openingBalance: real('opening_balance').default(0),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// القيود اليومية
// ================================================================
export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: text('number').notNull().unique(),
  date: text('date').notNull(),
  description: text('description'),
  currencyId: integer('currency_id').references(() => currencies.id),
  exchangeRate: real('exchange_rate').default(1),
  totalDebit: real('total_debit').default(0),
  totalCredit: real('total_credit').default(0),
  isPosted: integer('is_posted', { mode: 'boolean' }).default(false),
  postedAt: text('posted_at'),
  reference: text('reference'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// سطور القيد
// ================================================================
export const journalLines = sqliteTable('journal_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: integer('account_id').notNull().references(() => accounts.id),
  debit: real('debit').default(0),
  credit: real('credit').default(0),
  description: text('description'),
  currencyId: integer('currency_id').references(() => currencies.id),
  exchangeRate: real('exchange_rate').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الأرصدة
// ================================================================
export const balances = sqliteTable('balances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').notNull().references(() => accounts.id),
  currencyId: integer('currency_id').notNull().references(() => currencies.id),
  balance: real('balance').default(0),
  date: text('date').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
}, (table) => ({
  unique: unique().on(table.accountId, table.currencyId, table.date),
}));

// ================================================================
// الأطراف (عملاء / موردون)
// ================================================================
export const partners = sqliteTable('partners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  type: text('type', { enum: ['customer', 'supplier', 'both'] }).notNull(),
  phone: text('phone'),
  address: text('address'),
  email: text('email'),
  taxId: text('tax_id'),
  accountId: integer('account_id').references(() => accounts.id),
  currencyId: integer('currency_id').references(() => currencies.id),
  balance: real('balance').default(0),
  creditLimit: real('credit_limit').default(0),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الأصناف
// ================================================================
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  categoryId: integer('category_id').references(() => categories.id),
  unitId: integer('unit_id').references(() => units.id),
  brandId: integer('brand_id').references(() => brands.id),
  costPrice: real('cost_price').default(0),
  salePrice: real('sale_price').default(0),
  quantity: real('quantity').default(0),
  minQuantity: real('min_quantity').default(0),
  barcode: text('barcode'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// التصنيفات
// ================================================================
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  parentId: integer('parent_id').references(() => categories.id),
  description: text('description'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الوحدات
// ================================================================
export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  code: text('code'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الماركات
// ================================================================
export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// المخازن
// ================================================================
export const warehouses = sqliteTable('warehouses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  address: text('address'),
  phone: text('phone'),
  manager: text('manager'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// حركات المخزون
// ================================================================
export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  productId: integer('product_id').notNull().references(() => products.id),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
  type: text('type', { enum: ['in', 'out', 'transfer', 'adjustment'] }).notNull(),
  quantity: real('quantity').notNull(),
  unitCost: real('unit_cost').default(0),
  reference: text('reference'),
  notes: text('notes'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// فواتير المبيعات
// ================================================================
export const salesInvoices = sqliteTable('sales_invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: text('number').notNull().unique(),
  date: text('date').notNull(),
  customerId: integer('customer_id').references(() => partners.id),
  currencyId: integer('currency_id').references(() => currencies.id),
  exchangeRate: real('exchange_rate').default(1),
  subtotal: real('subtotal').default(0),
  discount: real('discount').default(0),
  tax: real('tax').default(0),
  total: real('total').default(0),
  paid: real('paid').default(0),
  notes: text('notes'),
  journalEntryId: integer('journal_entry_id').references(() => journalEntries.id),
  isPosted: integer('is_posted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// سطور فواتير المبيعات
// ================================================================
export const salesInvoiceItems = sqliteTable('sales_invoice_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => salesInvoices.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: real('quantity').notNull(),
  price: real('price').notNull(),
  discount: real('discount').default(0),
  total: real('total').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// فواتير المشتريات
// ================================================================
export const purchaseInvoices = sqliteTable('purchase_invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: text('number').notNull().unique(),
  date: text('date').notNull(),
  supplierId: integer('supplier_id').references(() => partners.id),
  currencyId: integer('currency_id').references(() => currencies.id),
  exchangeRate: real('exchange_rate').default(1),
  subtotal: real('subtotal').default(0),
  discount: real('discount').default(0),
  tax: real('tax').default(0),
  total: real('total').default(0),
  paid: real('paid').default(0),
  notes: text('notes'),
  journalEntryId: integer('journal_entry_id').references(() => journalEntries.id),
  isPosted: integer('is_posted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// سطور فواتير المشتريات
// ================================================================
export const purchaseInvoiceItems = sqliteTable('purchase_invoice_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => purchaseInvoices.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: real('quantity').notNull(),
  price: real('price').notNull(),
  discount: real('discount').default(0),
  total: real('total').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الصناديق
// ================================================================
export const cashBoxes = sqliteTable('cash_boxes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  code: text('code').notNull().unique(),
  currencyId: integer('currency_id').references(() => currencies.id),
  balance: real('balance').default(0),
  accountId: integer('account_id').references(() => accounts.id),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// البنوك
// ================================================================
export const banks = sqliteTable('banks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  accountNumber: text('account_number').notNull(),
  iban: text('iban'),
  swift: text('swift'),
  currencyId: integer('currency_id').references(() => currencies.id),
  balance: real('balance').default(0),
  accountId: integer('account_id').references(() => accounts.id),
  branch: text('branch'),
  address: text('address'),
  contact: text('contact'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// شركات الصرافة
// ================================================================
export const exchangeCompanies = sqliteTable('exchange_companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  accountNumber: text('account_number'),
  currencyId: integer('currency_id').references(() => currencies.id),
  balance: real('balance').default(0),
  buyRate: real('buy_rate').default(0),
  sellRate: real('sell_rate').default(0),
  accountId: integer('account_id').references(() => accounts.id),
  address: text('address'),
  phone: text('phone'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// المحافظ الإلكترونية
// ================================================================
export const wallets = sqliteTable('wallets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  provider: text('provider').notNull(),
  accountNumber: text('account_number'),
  phone: text('phone'),
  currencyId: integer('currency_id').references(() => currencies.id),
  balance: real('balance').default(0),
  accountId: integer('account_id').references(() => accounts.id),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// معاملات الصرافة
// ================================================================
export const exchangeTransactions = sqliteTable('exchange_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  exchangeCompanyId: integer('exchange_company_id').references(() => exchangeCompanies.id),
  type: text('type', { enum: ['buy', 'sell'] }).notNull(),
  fromCurrencyId: integer('from_currency_id').references(() => currencies.id),
  toCurrencyId: integer('to_currency_id').references(() => currencies.id),
  amount: real('amount').notNull(),
  rate: real('rate').notNull(),
  total: real('total').notNull(),
  notes: text('notes'),
  journalEntryId: integer('journal_entry_id').references(() => journalEntries.id),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// سندات القبض والصرف
// ================================================================
export const vouchers = sqliteTable('vouchers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: text('number').notNull().unique(),
  type: text('type', { enum: ['receipt', 'payment'] }).notNull(),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  currencyId: integer('currency_id').references(() => currencies.id),
  exchangeRate: real('exchange_rate').default(1),
  accountId: integer('account_id').references(() => accounts.id),
  cashBoxId: integer('cash_box_id').references(() => cashBoxes.id),
  bankId: integer('bank_id').references(() => banks.id),
  walletId: integer('wallet_id').references(() => wallets.id),
  partnerId: integer('partner_id').references(() => partners.id),
  description: text('description'),
  reference: text('reference'),
  journalEntryId: integer('journal_entry_id').references(() => journalEntries.id),
  isPosted: integer('is_posted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الأصول الثابتة
// ================================================================
export const assets = sqliteTable('assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en'),
  category: text('category'),
  purchaseDate: text('purchase_date'),
  purchasePrice: real('purchase_price').default(0),
  usefulLife: integer('useful_life'), // بالسنوات
  salvageValue: real('salvage_value').default(0),
  depreciationMethod: text('depreciation_method', { enum: ['straight_line', 'declining_balance'] }).default('straight_line'),
  currentValue: real('current_value').default(0),
  accountId: integer('account_id').references(() => accounts.id),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الإهلاك
// ================================================================
export const depreciations = sqliteTable('depreciations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assetId: integer('asset_id').notNull().references(() => assets.id),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  accumulatedDepreciation: real('accumulated_depreciation').default(0),
  journalEntryId: integer('journal_entry_id').references(() => journalEntries.id),
  notes: text('notes'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الذكاء الاصطناعي
// ================================================================
export const aiHistory = sqliteTable('ai_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id'),
  userMessage: text('user_message').notNull(),
  aiResponse: text('ai_response').notNull(),
  context: text('context'),
  command: text('command'),
  executed: integer('executed', { mode: 'boolean' }).default(false),
  executedAt: text('executed_at'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// سجل التدقيق
// ================================================================
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// سجل النسخ الاحتياطي
// ================================================================
export const backupLogs = sqliteTable('backup_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  size: integer('size'),
  type: text('type', { enum: ['manual', 'auto', 'restore'] }).notNull(),
  status: text('status', { enum: ['success', 'failed'] }).notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// ================================================================
// الإعدادات
// ================================================================
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  group: text('group').default('general'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});
