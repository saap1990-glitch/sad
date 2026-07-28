import * as SQLite from 'expo-sqlite';

export class NumberingService {
  static async getNextNumber(db: SQLite.SQLiteDatabase, prefix: string): Promise<string> {
    const result = await db.getFirstAsync('SELECT lastNumber FROM numbering WHERE prefix = ?', [prefix]);
    let nextNumber = result ? result.lastNumber + 1 : 1;
    await db.runAsync('INSERT OR REPLACE INTO numbering (prefix, lastNumber) VALUES (?, ?)', [prefix, nextNumber]);
    return `${prefix}${String(nextNumber).padStart(6, '0')}`;
  }

  static async getNextInvoiceNumber(db: SQLite.SQLiteDatabase, kind: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = kind === 'sale' ? 'S' : 'P';
    const result = await db.getFirstAsync(
      `SELECT COALESCE(MAX(CAST(SUBSTR(number, INSTR(number,'-')+1) AS INTEGER)),0) AS n
       FROM invoices WHERE number LIKE ?`,
      [`${prefix}${year}-%`]
    );
    const nextNumber = (result?.n || 0) + 1;
    return `${prefix}${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  static async getNextJENumber(db: SQLite.SQLiteDatabase): Promise<string> {
    const year = new Date().getFullYear();
    const result = await db.getFirstAsync(
      `SELECT COALESCE(MAX(CAST(SUBSTR(number, INSTR(number,'-')+1) AS INTEGER)),0) AS n
       FROM journal_entries WHERE number LIKE ?`,
      [`JE${year}-%`]
    );
    const nextNumber = (result?.n || 0) + 1;
    return `JE${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  static async getNextAccountCode(db: SQLite.SQLiteDatabase, parentId: number | null): Promise<string> {
    if (!parentId) {
      const result = await db.getFirstAsync('SELECT code FROM accounts WHERE level = 1 ORDER BY code DESC LIMIT 1');
      const lastNumber = result ? parseInt(result.code) || 0 : 0;
      return String(lastNumber + 1).padStart(4, '0');
    }
    const parent = await db.getFirstAsync('SELECT code, level FROM accounts WHERE id = ?', [parentId]);
    if (!parent) throw new Error('الحساب الأب غير موجود');
    const childLevel = parent.level + 1;
    const result = await db.getFirstAsync(
      `SELECT code FROM accounts WHERE code LIKE ? AND level = ? ORDER BY code DESC LIMIT 1`,
      [`${parent.code}%`, childLevel]
    );
    const lastNumber = result ? parseInt(result.code.slice(-4)) || 0 : 0;
    return `${parent.code}${String(lastNumber + 1).padStart(4, '0')}`;
  }
}
