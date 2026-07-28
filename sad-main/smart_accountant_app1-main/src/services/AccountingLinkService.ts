import * as SQLite from 'expo-sqlite';
import { eventBus, Events } from '../events/eventBus';

export class AccountingLinkService {
  private db: SQLite.SQLiteDatabase | null = null;
  private static instance: AccountingLinkService;

  static getInstance(): AccountingLinkService {
    if (!AccountingLinkService.instance) {
      AccountingLinkService.instance = new AccountingLinkService();
    }
    return AccountingLinkService.instance;
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) this.db = await SQLite.openDatabaseAsync('smart_accountant.db');
    return this.db;
  }

  async createAccountForEntity(params: {
    module: string;
    entityType: string;
    entityId: number;
    nameAr: string;
    systemKey: string;
  }): Promise<{ accountId: number; accountCode: string } | null> {
    const db = await this.getDb();

    // الحصول على الحساب الأب من SystemAccounts
    const sysAcc = await db.getFirstAsync(
      'SELECT a.* FROM system_accounts sa JOIN accounts a ON a.id = sa.account_id WHERE sa.key = ?',
      [params.systemKey]
    ) as any;

    if (!sysAcc) {
      console.warn(`Parent account not found for key: ${params.systemKey}`);
      return null;
    }

    // توليد كود جديد
    const lastChild = await db.getFirstAsync(
      "SELECT code FROM accounts WHERE code LIKE ?||'%' ORDER BY code DESC LIMIT 1",
      [sysAcc.code]
    ) as any;

    let newCode = `${sysAcc.code}01`;
    if (lastChild) {
      const num = parseInt(lastChild.code.substring(sysAcc.code.length)) || 0;
      newCode = sysAcc.code + String(num + 1).padStart(2, '0');
    }

    // إنشاء الحساب
    const result = await db.runAsync(
      `INSERT INTO accounts (code, name_ar, name_en, parent_id, level, type, nature, 
       is_postable, is_virtual, is_system, is_leaf, is_active, notes)
       VALUES (?,?,?,?,?,?,?,1,0,0,1,1,?)`,
      [newCode, params.nameAr, params.nameAr, sysAcc.id, sysAcc.level + 1,
       sysAcc.type, sysAcc.nature, `${params.entityType}: ${params.nameAr}`]
    );

    const accountId = result.lastInsertRowId;

    // تسجيل الرابط
    await db.runAsync(
      'INSERT INTO account_links (module, entity_type, entity_id, account_id) VALUES (?,?,?,?)',
      [params.module, params.entityType, params.entityId, accountId]
    );

    // 🔔 إصدار أحداث
    eventBus.emit(Events.ACCOUNT_CREATED, { accountId, code: newCode, name: params.nameAr });
    eventBus.emit(Events.REFRESH_ACCOUNTS);
    eventBus.emit(Events.REFRESH_ALL);

    return { accountId, accountCode: newCode };
  }
}

export const accountingLinkService = AccountingLinkService.getInstance();
