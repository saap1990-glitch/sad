type EventCallback = (...args: any[]) => void;

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    const cbs = this.listeners.get(event);
    if (cbs) this.listeners.set(event, cbs.filter(cb => cb !== callback));
  }

  emit(event: string, ...args: any[]): void {
    const cbs = this.listeners.get(event);
    if (cbs) cbs.forEach(cb => { try { cb(...args); } catch (e) { console.error(e); } });
  }
}

export const eventBus = new EventBus();

export const Events = {
  // حسابات
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_BALANCE_CHANGED: 'account.balanceChanged',
  
  // معاملات
  JOURNAL_POSTED: 'journal.posted',
  CASH_RECEIPT_CREATED: 'cashReceipt.created',
  CASH_PAYMENT_CREATED: 'cashPayment.created',
  INVOICE_CREATED: 'invoice.created',
  
  // كيانات
  CUSTOMER_CREATED: 'customer.created',
  SUPPLIER_CREATED: 'supplier.created',
  BANK_CREATED: 'bank.created',
  WALLET_CREATED: 'wallet.created',
  EXCHANGE_COMPANY_CREATED: 'exchangeCompany.created',
  CASH_BOX_CREATED: 'cashBox.created',
  
  // عام
  SETTINGS_CHANGED: 'settings.changed',
  LANGUAGE_CHANGED: 'language.changed',
  CURRENCY_RATE_UPDATED: 'currencyRate.updated',
  DATABASE_READY: 'database.ready',
  
  // تحديث شامل
  REFRESH_ALL: 'refresh.all',
  REFRESH_ACCOUNTS: 'refresh.accounts',
  REFRESH_DASHBOARD: 'refresh.dashboard',
} as const;
