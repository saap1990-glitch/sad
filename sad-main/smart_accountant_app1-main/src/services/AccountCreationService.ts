import * as SQLite from 'expo-sqlite';
import { financialEngine } from './FinancialCoreEngine';

/**
 * الخدمة المركزية الوحيدة المسؤولة عن إنشاء الحسابات المحاسبية وربطها بالكيانات.
 * لا يسمح لأي شاشة بإنشاء حسابات أو أربطة مباشرة.
 */
class AccountCreationServiceClass {
  /**
   * إنشاء حساب فرعي وربطه بكيان (صندوق، بنك، محفظة...)
   */
  async createChildAccount(
    db: SQLite.SQLiteDatabase,
    params: {
      parentSystemKey: string; // مثل 'cash_account', 'bank_parent'
      nameAr: string;
      openingBalance: number;
      currencyCode: string;
      module: string; // 'cash', 'banks', 'wallets', 'exchange'
      entityType: string;
      entityId: number;
    }
  ): Promise<{ accountId: number; accountCode: string }> {
    // 1. جلب الحساب الأب من SystemAccounts
    const sysAcc = await db.getFirstAsync(
      "SELECT a.* FROM system_accounts sa JOIN accounts a ON a.id = sa.account_id WHERE sa.key = ?",
      [params.parentSystemKey]
    ) as any;

    if (!sysAcc) {
      throw new Error(`الحساب الأب غير موجود: ${params.parentSystemKey}`);
    }

    // 2. توليد كود جديد
    const lastChild = await db.getFirstAsync(
      "SELECT code FROM accounts WHERE code LIKE ?||'%' ORDER BY code DESC LIMIT 1",
      [sysAcc.code]
    ) as any;

    let newCode = `${sysAcc.code}01`;
    if (lastChild) {
      const num = parseInt(lastChild.code.substring(sysAcc.code.length)) || 0;
      newCode = sysAcc.code + String(num + 1).padStart(2, '0');
    }

    // 3. تحويل الرصيد الافتتاحي للريال
    const rate = await financialEngine.getExchangeRate(db, params.currencyCode);
    const baseAmount = params.openingBalance * rate;
    const curId = (await db.getFirstAsync("SELECT id FROM currencies WHERE code = ?", [params.currencyCode]) as any)?.id || 1;

    // 4. إنشاء الحساب الفرعي (الرصيد بالريال)
    const result = await db.runAsync(
      `INSERT INTO accounts (code, name_ar, name_en, parent_id, level, type, nature, currency_id, opening_balance, current_balance, is_postable, is_virtual, is_system, is_leaf, is_active, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,1,0,0,1,1,?)`,
      [newCode, params.nameAr, params.nameAr, sysAcc.id, sysAcc.level + 1, sysAcc.type, sysAcc.nature, curId, baseAmount, baseAmount, `${params.entityType}: ${params.nameAr}`]
    );

    const accountId = result.lastInsertRowId;

    // 5. إنشاء رصيد بالعملة الأجنبية في account_balances
    if (params.currencyCode !== 'YER' && params.openingBalance > 0) {
      await db.runAsync(
        "INSERT INTO account_balances (account_id, currency_code, balance) VALUES (?,?,?)",
        [accountId, params.currencyCode, params.openingBalance]
      );
    }

    // 6. إنشاء رابط في account_links
    await db.runAsync(
      "INSERT INTO account_links (module, entity_type, entity_id, account_id) VALUES (?,?,?,?)",
      [params.module, params.entityType, params.entityId, accountId]
    );

    // 7. تحديث الحسابات الأب
    await financialEngine.updateAllParentBalances(db, [accountId]);

    return { accountId, accountCode: newCode };
  }
}

export const accountCreationService = new AccountCreationServiceClass();
