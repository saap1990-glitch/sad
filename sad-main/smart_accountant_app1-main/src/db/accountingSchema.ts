// ================================================================
// جداول الربط المحاسبي
// ================================================================

export const accountingTables = `
  -- ============================================================
  -- جدول ربط الكيانات بالحسابات
  -- ============================================================
  CREATE TABLE IF NOT EXISTS account_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );

  -- ============================================================
  -- جدول الحسابات الافتراضية للنظام
  -- ============================================================
  CREATE TABLE IF NOT EXISTS system_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    account_id INTEGER NOT NULL,
    description TEXT,
    is_system INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );

  -- ============================================================
  -- إضافة الحسابات الافتراضية
  -- ============================================================
  INSERT OR IGNORE INTO system_accounts (key, account_id, description) VALUES
    ('cash_account', (SELECT id FROM accounts WHERE code = '1101'), 'الصندوق'),
    ('sales_account', (SELECT id FROM accounts WHERE code = '4101'), 'المبيعات'),
    ('purchase_account', (SELECT id FROM accounts WHERE code = '3101'), 'المشتريات'),
    ('inventory_account', (SELECT id FROM accounts WHERE code = '1106'), 'المخزون'),
    ('customer_parent', (SELECT id FROM accounts WHERE code = '1105'), 'حساب العملاء'),
    ('supplier_parent', (SELECT id FROM accounts WHERE code = '2101'), 'حساب الموردين'),
    ('exchange_parent', (SELECT id FROM accounts WHERE code = '1103'), 'حساب شركات الصرافة'),
    ('wallet_parent', (SELECT id FROM accounts WHERE code = '1104'), 'حساب المحافظ'),
    ('bank_parent', (SELECT id FROM accounts WHERE code = '1102'), 'حساب البنوك'),
    ('cogs_account', (SELECT id FROM accounts WHERE code = '5101'), 'تكلفة المبيعات'),
    ('tax_account', (SELECT id FROM accounts WHERE code = '2105'), 'الضرائب المستحقة'),
    ('expense_parent', (SELECT id FROM accounts WHERE code = '31'), 'حساب المصروفات'),
    ('revenue_parent', (SELECT id FROM accounts WHERE code = '41'), 'حساب الإيرادات'),
    ('fixed_assets_parent', (SELECT id FROM accounts WHERE code = '12'), 'حساب الأصول الثابتة'),
    ('exchange_difference', (SELECT id FROM accounts WHERE code = '3402'), 'فروقات العملة');
`;
