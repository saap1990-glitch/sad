import * as SQLite from 'expo-sqlite';
import { eventBus, Events } from '../events/eventBus';

export interface JournalLineInput {
  account_id: number;
  description?: string;
  debit?: number;
  credit?: number;
}

export interface JournalEntryInput {
  date: string;
  description: string;
  reference?: string;
  source_type: string;
  source_id?: number;
  lines: JournalLineInput[];
}

class AccountingEngineService {
  private db: SQLite.SQLiteDatabase | null = null;

  async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) this.db = await SQLite.openDatabaseAsync('smart_accountant.db');
    return this.db;
  }

  async createJournalEntry(input: JournalEntryInput): Promise<number> {
    const db = await this.getDb();
    const totalDebit = input.lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = input.lines.reduce((s, l) => s + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`القيد غير متوازن: ${totalDebit} ≠ ${totalCredit}`);
    }

    const entryNumber = `JV-${Date.now().toString(36).toUpperCase()}`;
    const result = await db.runAsync(
      'INSERT INTO journal_entries (entry_number, date, description, total_debit, total_credit, source_type, source_id, is_posted) VALUES (?,?,?,?,?,?,?,1)',
      [entryNumber, input.date, input.description, totalDebit, totalCredit, input.source_type, input.source_id || 0]
    );

    const entryId = result.lastInsertRowId;
    const affectedAccounts: number[] = [];

    for (const line of input.lines) {
      await db.runAsync(
        'INSERT INTO journal_lines (entry_id, account_id, description, debit, credit) VALUES (?,?,?,?,?)',
        [entryId, line.account_id, line.description || input.description, line.debit || 0, line.credit || 0]
      );
      const net = (line.debit || 0) - (line.credit || 0);
      await db.runAsync('UPDATE accounts SET current_balance = COALESCE(current_balance,0) + ? WHERE id = ?', [net, line.account_id]);
      affectedAccounts.push(line.account_id);
    }

    // 🔔 إصدار حدث: تم ترحيل قيد
    eventBus.emit(Events.JOURNAL_POSTED, { entryId, affectedAccounts });
    eventBus.emit(Events.ACCOUNT_BALANCE_CHANGED, { accountIds: affectedAccounts });
    eventBus.emit(Events.REFRESH_ALL);

    return entryId;
  }
}

export const accountingEngine = new AccountingEngineService();
