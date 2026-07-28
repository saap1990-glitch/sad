import * as SQLite from 'expo-sqlite';

class BalanceService {
  async updateAccountBalance(db: SQLite.SQLiteDatabase, accountId: number, amountInBase: number, foreignCurrency?: string, foreignAmount?: number): Promise<void> {
    await db.runAsync('UPDATE accounts SET current_balance = COALESCE(current_balance, 0) + ? WHERE id = ?', [amountInBase, accountId]);
    if (foreignCurrency && foreignCurrency !== 'YER' && foreignAmount) {
      await db.runAsync(
        'INSERT INTO account_balances (account_id, currency_code, balance) VALUES (?,?,?) ON CONFLICT(account_id, currency_code) DO UPDATE SET balance = balance + ?',
        [accountId, foreignCurrency, foreignAmount, foreignAmount]
      );
    }
  }

  async updateAggregateBalances(db: SQLite.SQLiteDatabase | null): Promise<void> {
    if (!db) return;
    // الأرصدة الحالية بالفعل بالريال، نجمعها مباشرة
    await db.execAsync(`
      UPDATE accounts SET current_balance = (
        SELECT COALESCE(SUM(sub.current_balance), 0)
        FROM accounts sub
        WHERE sub.parent_id = accounts.id
      )
      WHERE is_virtual = 1
    `);
  }
}

export const balanceService = new BalanceService();
