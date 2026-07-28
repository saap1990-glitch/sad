export const APP_KNOWLEDGE = {
  screens: {
    accounts: { name: 'دليل الحسابات', route: '/ledger/accounts', fields: ['name','code','type','parentId','balance','currency','isDebit'] },
    cash_boxes: { name: 'الصناديق', route: '/ledger/cash-boxes', fields: ['name','currency','balance'] },
    banks: { name: 'البنوك', route: '/ledger/banks', fields: ['name','accountNumber','currency','balance'] },
    customers: { name: 'العملاء', route: '/sales/customers', fields: ['name','phone','address','currency','balance','creditLimit'] },
    suppliers: { name: 'الموردين', route: '/inventory/suppliers', fields: ['name','phone','address','currency','balance'] },
    items: { name: 'الأصناف', route: '/inventory/items', fields: ['name','code','unit','cost','price','quantity'] },
    sales_invoice: { name: 'فاتورة مبيعات', route: '/sales/sales-invoice', fields: ['date','customerId','items','total'] },
    purchase_invoice: { name: 'فاتورة مشتريات', route: '/inventory/purchase-invoice', fields: ['date','supplierId','items','total'] },
    vouchers: { name: 'السندات', route: '/ledger/vouchers', fields: ['date','type','voucherType','sourceId','accountId','amount'] },
    journal: { name: 'قيود اليومية', route: '/ledger/journal-entry', fields: ['date','description','lines'] },
  },
  
  operations: {
    sales_cash: { description: 'فاتورة مبيعات نقدية', debit: '111', credit: '411' },
    sales_credit: { description: 'فاتورة مبيعات آجلة', debit: '114', credit: '411' },
    purchase_cash: { description: 'فاتورة مشتريات نقدية', debit: '511', credit: '111' },
    purchase_credit: { description: 'فاتورة مشتريات آجلة', debit: '511', credit: '211' },
    receipt: { description: 'سند قبض', debit: '111', credit: 'dynamic' },
    payment: { description: 'سند صرف', debit: 'dynamic', credit: '111' },
  },

  faq: [
    { q: 'كيف أضيف فاتورة؟', a: 'اذهب إلى فواتير المبيعات من القائمة الرئيسية، ثم اضغط زر + لإضافة فاتورة جديدة، اختر العميل والأصناف ثم احفظ.' },
    { q: 'كيف أعمل نسخة احتياطية؟', a: 'اذهب إلى الإعدادات > النسخ الاحتياطي > إنشاء نسخة احتياطية.' },
    { q: 'كيف أغير العملة؟', a: 'اذهب إلى العملات من قائمة دفتر الأستاذ، ثم اضغط على العملة المطلوبة وعدل سعر الصرف.' },
    { q: 'كيف أطبع كشف الحساب؟', a: 'اذهب إلى كشف حساب، اختر الحساب المطلوب، ثم اضغط زر الطباعة.' },
    { q: 'لماذا رفض النظام هذا القيد؟', a: 'القيد يجب أن يكون متوازناً (المدين = الدائن). تأكد من صحة المبالغ والحسابات.' },
  ],

  rules: {
    balanced_entry: 'يجب أن يتوازن القيد (مجموع المدين = مجموع الدائن)',
    no_delete_with_children: 'لا يمكن حذف حساب له حسابات فرعية',
    unique_code: 'كود الحساب يجب أن يكون فريداً',
    cash_nature: 'الصندوق والبنوك والمحافظ حسابات مدينة بطبيعتها',
    supplier_nature: 'الموردين حسابات دائنة بطبيعتها',
  }
};

export const getFAQAnswer = (question: string): string | null => {
  const match = APP_KNOWLEDGE.faq.find(f => 
    question.includes(f.q.replace('كيف','').replace('؟','').trim())
  );
  return match?.a || null;
};

export const getScreenInfo = (screenName: string): any => {
  for (const [key, screen] of Object.entries(APP_KNOWLEDGE.screens)) {
    if (screen.name.includes(screenName) || screenName.includes(screen.name)) {
      return screen;
    }
  }
  return null;
};
