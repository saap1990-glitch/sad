import * as SQLite from 'expo-sqlite';

export class AuditService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('smart_accountant_v2.db');
    }
  }

  /**
   * تسجيل حدث تدقيق
   */
  async log(action: string, entityType: string, entityId?: number, details?: string) {
    await this.init();
    await this.db!.runAsync(
      'INSERT INTO audit_logs (entity_type, entity_id, action, new_values) VALUES (?,?,?,?)',
      [entityType, entityId || 0, action, details || '']
    );
  }

  /**
   * الحصول على سجل التدقيق
   */
  async getLogs(limit: number = 50): Promise<any[]> {
    await this.init();
    return this.db!.getAllAsync(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
  }
}

export const auditService = new AuditService();
