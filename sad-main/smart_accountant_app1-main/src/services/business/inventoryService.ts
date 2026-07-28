import accountingEngine from '../../engine/accountingEngine';

export const inventoryService = {
  async increaseStock(data: any) {
    return { success: true, message: `تمت زيادة المخزون: ${data.itemName}` };
  },

  async decreaseStock(data: any) {
    return { success: true, message: `تم إنقاص المخزون: ${data.itemName}` };
  },

  async stockIn(data: any) {
    const total = (data.qty || 1) * (data.price || 0);
    return accountingEngine.postEntry({
      date: data.date,
      description: `توريد مخزون - ${data.itemName}`,
      lines: [
        { accountId: '115', accountName: 'المخزون', debit: total, credit: 0 },
        { accountId: '511', accountName: 'المشتريات', debit: 0, credit: total },
      ]
    });
  },

  async stockOut(data: any) {
    const total = (data.qty || 1) * (data.price || 0);
    return accountingEngine.postEntry({
      date: data.date,
      description: `صرف مخزون - ${data.itemName}`,
      lines: [
        { accountId: '511', accountName: 'تكلفة المبيعات', debit: total, credit: 0 },
        { accountId: '115', accountName: 'المخزون', debit: 0, credit: total },
      ]
    });
  },
};
