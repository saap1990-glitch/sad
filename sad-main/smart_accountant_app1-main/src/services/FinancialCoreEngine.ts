import * as SQLite from 'expo-sqlite';

export interface FinancialTransaction {
  date: string;
  description: string;
  reference: string;
  source_type: string;
  currency_code: string;
  exchange_rate: number;
  lines: FinancialLine[];
}

export interface FinancialLine {
  account_id: number;
  debit_original: number;
  credit_original: number;
  description?: string;
}

class FinancialCoreEngineClass {
  private db: SQLite.SQLiteDatabase | null = null;

  async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('smart_accountant.db');
    }
    return this.db;
  }

  async validateTransaction(db: SQLite.SQLiteDatabase, transaction: FinancialTransaction): Promise<string | null> {
    if (transaction.lines.length === 0) return 'القيد فارغ';
    const totalDebit = transaction.lines.reduce((s, l) => s + (l.debit_original || 0), 0);
    const totalCredit = transaction.lines.reduce((s, l) => s + (l.credit_original || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) return `غير متوازن: ${totalDebit} ≠ ${totalCredit}`;
    for (const line of transaction.lines) {
      const account = await db.getFirstAsync('SELECT id, name_ar, is_active, is_postable, is_leaf FROM accounts WHERE id = ?', [line.account_id]) as any;
      if (!account) return `الحساب ${line.account_id} غير موجود`;
      if (!account.is_active) return `الحساب ${account.name_ar} موقوف`;
      if (!account.is_postable) return `لا يمكن الترحيل إلى ${account.name_ar}`;
      if (!account.is_leaf) return `${account.name_ar} حساب رئيسي`;
    }
    return null;
  }

  async getExchangeRate(db: SQLite.SQLiteDatabase, currencyCode: string): Promise<number> {
    if (currencyCode === 'YER') return 1;
    const result = await db.getFirstAsync("SELECT rate FROM exchange_rates WHERE currency_id = (SELECT id FROM currencies WHERE code = ?) ORDER BY date DESC LIMIT 1", [currencyCode]) as any;
    return result?.rate || 1;
  }

  async executeTransaction(db: SQLite.SQLiteDatabase, transaction: FinancialTransaction): Promise<number> {
    const validationError = await this.validateTransaction(db, transaction);
    if (validationError) throw new Error(validationError);

    const rate = transaction.exchange_rate;
    const baseDebit = transaction.lines.reduce((s, l) => s + (l.debit_original * rate), 0);
    const baseCredit = transaction.lines.reduce((s, l) => s + (l.credit_original * rate), 0);

    const result = await db.runAsync(
      `INSERT INTO journal_entries (entry_number, date, description, reference, source_type, total_debit, total_credit, is_posted) VALUES (?,?,?,?,?,?,?,1)`,
      [transaction.reference, transaction.date, transaction.description, transaction.reference, transaction.source_type, baseDebit, baseCredit]
    );

    const entryId = result.lastInsertRowId;
    const affectedAccounts: number[] = [];

    for (const line of transaction.lines) {
      const debitBase = (line.debit_original || 0) * rate;
      const creditBase = (line.credit_original || 0) * rate;
      await db.runAsync(
        `INSERT INTO journal_lines (entry_id, account_id, description, debit, credit, foreign_amount, foreign_currency, exchange_rate) VALUES (?,?,?,?,?,?,?,?)`,
        [entryId, line.account_id, line.description || transaction.description, debitBase, creditBase, line.debit_original || line.credit_original, transaction.currency_code, rate]
      );
      const netChange = debitBase - creditBase;
      await db.runAsync('UPDATE accounts SET current_balance = COALESCE(current_balance, 0) + ? WHERE id = ?', [netChange, line.account_id]);
      if (transaction.currency_code !== 'YER') {
        const foreignAmount = line.debit_original || -line.credit_original;
        await db.runAsync(`INSERT INTO account_balances (account_id, currency_code, balance) VALUES (?,?,?) ON CONFLICT(account_id, currency_code) DO UPDATE SET balance = balance + ?`, [line.account_id, transaction.currency_code, foreignAmount, foreignAmount]);
      }
      affectedAccounts.push(line.account_id);
    }

    await this.updateAllParentBalances(db, affectedAccounts);
    return entryId;
  }

  async updateAllParentBalances(db: SQLite.SQLiteDatabase, affectedAccounts: number[]): Promise<void> {
    const allParents = new Set<number>();
    for (const accountId of affectedAccounts) {
      let currentId = accountId;
      while (currentId) {
        const parent = await db.getFirstAsync('SELECT parent_id FROM accounts WHERE id = ?', [currentId]) as any;
        if (parent?.parent_id) {
          allParents.add(parent.parent_id);
          currentId = parent.parent_id;
        } else break;
      }
    }
    for (const parentId of allParents) {
      await db.execAsync(`UPDATE accounts SET current_balance = (SELECT COALESCE(SUM(sub.current_balance), 0) FROM accounts sub WHERE sub.parent_id = accounts.id AND sub.is_active = 1) WHERE id = ${parentId}`);
    }
  }

  async getAccountStatement(db: SQLite.SQLiteDatabase, accountId: number, fromDate?: string, toDate?: string): Promise<any[]> {
    let query = `SELECT je.date, je.entry_number, je.description, je.source_type, jl.debit, jl.credit, jl.foreign_amount, jl.foreign_currency, jl.exchange_rate FROM journal_lines jl JOIN journal_entries je ON je.id = jl.entry_id WHERE jl.account_id = ? AND je.is_posted = 1`;
    const params: any[] = [accountId];
    if (fromDate) { query += ' AND je.date >= ?'; params.push(fromDate); }
    if (toDate) { query += ' AND je.date <= ?'; params.push(toDate); }
    query += ' ORDER BY je.date, je.id LIMIT 200';
    const transactions = await db.getAllAsync(query, params);
    let balance = 0;
    const openingBalance = await db.getFirstAsync('SELECT opening_balance FROM accounts WHERE id = ?', [accountId]) as any;
    balance = openingBalance?.opening_balance || 0;
    return (transactions as any[]).map((row: any) => {
      balance += (row.debit || 0) - (row.credit || 0);
      return { ...row, running_balance: balance };
    });
  }

  async getTrialBalance(db: SQLite.SQLiteDatabase): Promise<any[]> {
    return db.getAllAsync(`SELECT a.code, a.name_ar, a.type, COALESCE(SUM(jl.debit), 0) as total_debit, COALESCE(SUM(jl.credit), 0) as total_credit, a.current_balance FROM accounts a LEFT JOIN journal_lines jl ON jl.account_id = a.id LEFT JOIN journal_entries je ON je.id = jl.entry_id AND je.is_posted = 1 WHERE a.is_leaf = 1 AND a.is_active = 1 GROUP BY a.id HAVING total_debit > 0 OR total_credit > 0 ORDER BY a.code LIMIT 50`);
  }

  async getBalanceSheet(db: SQLite.SQLiteDatabase): Promise<{ assets: number; liabilities: number; equity: number }> {
    const assets = await db.getFirstAsync("SELECT COALESCE(SUM(current_balance), 0) as total FROM accounts WHERE type = 'asset' AND is_active = 1") as any;
    const liabilities = await db.getFirstAsync("SELECT COALESCE(SUM(current_balance), 0) as total FROM accounts WHERE type IN ('liability', 'revenue') AND is_active = 1") as any;
    const totalAssets = assets?.total || 0;
    const totalLiabilities = liabilities?.total || 0;
    return { assets: totalAssets, liabilities: totalLiabilities, equity: totalAssets - totalLiabilities };
  }

  async getIncomeStatement(db: SQLite.SQLiteDatabase): Promise<{ revenue: number; expenses: number; netIncome: number }> {
    const revenue = await db.getFirstAsync("SELECT COALESCE(SUM(current_balance), 0) as total FROM accounts WHERE type = 'revenue' AND is_active = 1") as any;
    const expenses = await db.getFirstAsync("SELECT COALESCE(SUM(current_balance), 0) as total FROM accounts WHERE type = 'expense' AND is_active = 1") as any;
    const totalRevenue = revenue?.total || 0;
    const totalExpenses = expenses?.total || 0;
    return { revenue: totalRevenue, expenses: totalExpenses, netIncome: totalRevenue - totalExpenses };
  }
}

export const financialEngine = new FinancialCoreEngineClass();
