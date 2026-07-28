import * as SQLite from 'expo-sqlite';
import { ruleEngine } from './ruleEngine';

let db: any = null;
const getDB = async () => { if (!db) db = await SQLite.openDatabaseAsync('smart_accountant.db'); return db; };

export const accountingEngine = {
  validateBalance(debit: number, credit: number): boolean {
    return Math.abs(debit - credit) < 0.001;
  },

  async postEntry(params: { date: string; description: string; lines: Array<{ accountId: string; accountName: string; debit: number; credit: number; }> }) {
    const d = await getDB();
    const totalDebit = params.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = params.lines.reduce((s, l) => s + l.credit, 0);
    
    if (!this.validateBalance(totalDebit, totalCredit)) {
      return { success: false, error: 'القيد غير متوازن' };
    }

    const number = 'JE-' + Date.now().toString(36).toUpperCase();
    
    await d.runAsync('INSERT INTO journal_entries (number, date, description, type) VALUES (?,?,?,?)', [number, params.date, params.description, 'manual']);
    const jr = await d.getFirstAsync('SELECT last_insert_rowid() as id') as any;
    
    for (const line of params.lines) {
      await d.runAsync('INSERT INTO journal_details (journal_id, account_id, account_name, debit, credit) VALUES (?,?,?,?,?)', [jr.id, line.accountId, line.accountName, line.debit, line.credit]);
      await d.runAsync('UPDATE accounts SET balance = COALESCE(balance,0) + ? - ? WHERE id = ?', [line.debit, line.credit, line.accountId]);
    }

    return { success: true, number, entryId: jr.id };
  },

  // دوال جاهزة لكل العمليات
  async createSalesCashEntry(data: any) {
    const rules = ruleEngine.getRules('sales_cash');
    return this.postEntry({
      date: data.date,
      description: `فاتورة مبيعات نقدي - ${data.customerName || data.cashName}`,
      lines: [
        { accountId: data.cashId || '111', accountName: data.cashName || 'الصندوق', debit: data.total, credit: 0 },
        { accountId: rules.creditAccount, accountName: 'المبيعات', debit: 0, credit: data.total },
      ]
    });
  },

  async createSalesCreditEntry(data: any) {
    return this.postEntry({
      date: data.date,
      description: `فاتورة مبيعات آجل - ${data.customerName}`,
      lines: [
        { accountId: data.customerId, accountName: data.customerName, debit: data.total, credit: 0 },
        { accountId: '411', accountName: 'المبيعات', debit: 0, credit: data.total },
      ]
    });
  },

  async createPurchaseEntry(data: any) {
    return this.postEntry({
      date: data.date,
      description: `فاتورة مشتريات - ${data.supplierName}`,
      lines: [
        { accountId: '511', accountName: 'المشتريات', debit: data.total, credit: 0 },
        { accountId: data.cashId || data.supplierId, accountName: data.cashName || data.supplierName, debit: 0, credit: data.total },
      ]
    });
  },

  async createReceiptEntry(data: any) {
    return this.postEntry({
      date: data.date,
      description: `سند قبض - ${data.sourceName}`,
      lines: [
        { accountId: data.sourceId || '111', accountName: data.sourceName, debit: data.amount, credit: 0 },
        { accountId: data.accountId, accountName: data.accountName, debit: 0, credit: data.amount },
      ]
    });
  },

  async createPaymentEntry(data: any) {
    return this.postEntry({
      date: data.date,
      description: `سند صرف - ${data.sourceName}`,
      lines: [
        { accountId: data.accountId, accountName: data.accountName, debit: data.amount, credit: 0 },
        { accountId: data.sourceId || '111', accountName: data.sourceName, debit: 0, credit: data.amount },
      ]
    });
  },

  async createManualEntry(data: any) {
    return this.postEntry(data);
  },
};

export default accountingEngine;
