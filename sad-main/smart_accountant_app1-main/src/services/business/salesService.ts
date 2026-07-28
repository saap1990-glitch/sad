import { executeTransaction } from '../../engine/accountingEngine';
import { useAccountStore } from '../../store/useAccountStore';

export const salesService = {
  // فاتورة مبيعات نقدي
  async cashInvoice(data: any, cashId: string, cashName: string, total: number) {
    const result = await executeTransaction({
      type: 'sales',
      date: data.date,
      description: `فاتورة مبيعات - ${data.customerName || cashName}`,
      lines: [
        { accountId: cashId, accountName: cashName, debit: total, credit: 0 },
        { accountId: '411', accountName: 'المبيعات', debit: 0, credit: total },
      ]
    });
    if (result.success) useAccountStore.getState().loadAccounts();
    return result;
  },

  // فاتورة مبيعات آجل
  async creditInvoice(data: any, custId: string, custName: string, total: number) {
    const result = await executeTransaction({
      type: 'sales',
      date: data.date,
      description: `فاتورة مبيعات آجل - ${custName}`,
      lines: [
        { accountId: custId, accountName: custName, debit: total, credit: 0 },
        { accountId: '411', accountName: 'المبيعات', debit: 0, credit: total },
      ]
    });
    if (result.success) useAccountStore.getState().loadAccounts();
    return result;
  },
};
