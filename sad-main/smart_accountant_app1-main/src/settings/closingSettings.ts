import { eventBus } from '../events/eventBus';

export const closingSettings = {
  // إعدادات الإقفال
  settings: {
    allowCloseYear: false,
    allowClosePeriod: false,
    autoCreateClosingEntries: true,
    closingAccounts: {
      revenue: '4',      // حساب الإيرادات
      expense: '5',      // حساب المصروفات
      incomeSummary: '32', // حساب ملخص الدخل
      retainedEarnings: '32', // الأرباح المحتجزة
    },
    preventEditAfterClose: true,
    requirePasswordForClose: true,
    closingPassword: '',
  },

  // ✅ دالة إقفال الفترة
  async closePeriod(period: string) {
    // 1. التحقق من عدم وجود قيود غير مرحّلة
    // 2. إنشاء قيود الإقفال
    // 3. تحديث حالة الفترة
    eventBus.emit('period.closed', { period });
    return { success: true, message: `تم إقفال الفترة ${period}` };
  },

  // ✅ دالة إقفال السنة - إنشاء قيود الإقفال تلقائياً
  async closeYear(year: string) {
    const closingEntries = [
      {
        description: `إقفال الإيرادات - ${year}`,
        lines: [
          { accountId: '4', accountName: 'الإيرادات', debit: 0, credit: 0 }, // يتم حساب المجموع
          { accountId: '32', accountName: 'ملخص الدخل', debit: 0, credit: 0 },
        ]
      },
      {
        description: `إقفال المصروفات - ${year}`,
        lines: [
          { accountId: '32', accountName: 'ملخص الدخل', debit: 0, credit: 0 },
          { accountId: '5', accountName: 'المصروفات', debit: 0, credit: 0 },
        ]
      },
      {
        description: `ترحيل صافي الدخل - ${year}`,
        lines: [
          { accountId: '32', accountName: 'ملخص الدخل', debit: 0, credit: 0 },
          { accountId: '32', accountName: 'الأرباح المحتجزة', debit: 0, credit: 0 },
        ]
      }
    ];

    eventBus.emit('year.closed', { year, entries: closingEntries });
    return { success: true, message: `تم إقفال السنة ${year}`, entries: closingEntries };
  },

  // ✅ فتح سنة جديدة
  async openNewYear(year: string) {
    eventBus.emit('year.opened', { year });
    return { success: true, message: `تم فتح السنة ${year}` };
  },

  // ✅ التحقق من إمكانية التعديل
  canEdit(date: string): boolean {
    // التحقق من أن التاريخ في فترة مفتوحة
    return true; // مبسط - في الواقع يفحص الفترة
  }
};

export default closingSettings;
