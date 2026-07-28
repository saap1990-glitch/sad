export const ruleEngine = {
  getRules(operation: string): any {
    const rules: Record<string, any> = {
      'sales_cash': { debitAccount: '111', creditAccount: '411', creditName: 'المبيعات' },
      'sales_credit': { debitAccount: '114', creditAccount: '411', creditName: 'المبيعات' },
      'purchase_cash': { debitAccount: '511', creditAccount: '111', debitName: 'المشتريات' },
      'purchase_credit': { debitAccount: '511', creditAccount: '211', debitName: 'المشتريات' },
      'receipt': { debitAccount: '111', creditAccount: 'dynamic' },
      'payment': { debitAccount: 'dynamic', creditAccount: '111' },
      'stock_in': { debitAccount: '115', creditAccount: '511', debitName: 'المخزون' },
      'stock_out': { debitAccount: '511', creditAccount: '115', debitName: 'تكلفة المبيعات' },
    };
    
    return rules[operation] || {};
  },

  getAccountNature(type: string): 'debit' | 'credit' {
    return ['أصل', 'مصروف'].includes(type) ? 'debit' : 'credit';
  },

  calculateTax(amount: number, rate: number = 0.05): number {
    return Math.round(amount * rate * 100) / 100;
  },

  calculateDepreciation(cost: number, usefulLife: number): number {
    return Math.round((cost / usefulLife) * 100) / 100;
  },
};

export default ruleEngine;
