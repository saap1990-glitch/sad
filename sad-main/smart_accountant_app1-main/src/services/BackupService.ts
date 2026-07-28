import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export class BackupService {
  static async createBackup(): Promise<string | null> {
    try {
      const db = await SQLite.openDatabaseAsync('smart_accountant_v2.db');
      
      const tables = [
        'accounts', 'customers', 'suppliers', 'banks', 'wallets',
        'exchange_companies', 'products', 'journal_entries', 'journal_lines',
        'sales_invoices', 'purchase_invoices', 'settings', 'currencies',
        'system_accounts', 'account_links', 'number_sequences'
      ];

      const backup: any = { version: '1.0.0', date: new Date().toISOString(), data: {} };

      for (const table of tables) {
        try {
          const result = await db.getAllAsync(`SELECT * FROM ${table}`);
          backup.data[table] = result;
        } catch (e) {}
      }

      const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // استخدام writeAsStringAsync بدون encoding (يتعامل تلقائياً مع UTF-8)
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backup, null, 2));

      if (Platform.OS !== 'web') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/json',
            dialogTitle: 'حفظ النسخة الاحتياطية',
          });
        }
      }

      await db.runAsync("INSERT INTO backup_logs (filename, size, type, status) VALUES (?,?,?,?)", [fileName, JSON.stringify(backup).length, 'manual', 'success']);

      Alert.alert('✅', `تم إنشاء النسخة الاحتياطية:\n${fileName}`);
      return filePath;
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('❌', 'فشل إنشاء النسخة الاحتياطية');
      return null;
    }
  }

  static async restoreBackup(fileUri: string): Promise<boolean> {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri);
      const backup = JSON.parse(content);
      
      if (!backup.data) throw new Error('ملف غير صالح');

      Alert.alert('تأكيد', `استعادة البيانات من ${backup.date}؟`, [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'استعادة', style: 'destructive', onPress: async () => {
          await this.performRestore(backup.data);
          Alert.alert('✅', 'تمت الاستعادة بنجاح');
        }},
      ]);
      return true;
    } catch (error) {
      Alert.alert('❌', 'فشل استعادة النسخة الاحتياطية');
      return false;
    }
  }

  private static async performRestore(data: any) {
    const db = await SQLite.openDatabaseAsync('smart_accountant_v2.db');
    for (const [table, rows] of Object.entries(data)) {
      if (!Array.isArray(rows) || rows.length === 0) continue;
      await db.runAsync(`DELETE FROM ${table}`);
      for (const row of rows as any[]) {
        const columns = Object.keys(row).join(', ');
        const placeholders = Object.keys(row).map(() => '?').join(', ');
        try { await db.runAsync(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, Object.values(row) as any[]); } catch (e) {}
      }
    }
  }

  static async exportToCSV(tableName: string): Promise<string | null> {
    try {
      const db = await SQLite.openDatabaseAsync('smart_accountant_v2.db');
      const rows = await db.getAllAsync(`SELECT * FROM ${tableName}`) as any[];
      if (rows.length === 0) { Alert.alert('تنبيه', 'لا توجد بيانات'); return null; }
      
      const headers = Object.keys(rows[0]).join(',');
      const csvRows = rows.map((row: any) => Object.values(row).join(','));
      const csv = [headers, ...csvRows].join('\n');

      const fileName = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csv);

      if (Platform.OS !== 'web') {
        await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'تصدير' });
      }
      return filePath;
    } catch (error) {
      Alert.alert('❌', 'فشل التصدير');
      return null;
    }
  }
}
