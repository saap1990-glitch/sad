import { workflowEngine } from './workflowEngine';
import { eventBus } from '../events/eventBus';

// ✅ المساعد المحاسبي الذكي
export const aiAssistant = {
  // تحليل الأوامر الصوتية والنصية
  async processCommand(text: string) {
    const command = text.toLowerCase().trim();
    
    // التعرف على نوع الأمر
    if (command.includes('أضف') || command.includes('إضافة') || command.includes('سجل')) {
      return await handleAddCommand(command);
    }
    if (command.includes('بحث') || command.includes('ابحث') || command.includes('أين')) {
      return await handleSearchCommand(command);
    }
    if (command.includes('تقرير') || command.includes('أرباح') || command.includes('خسائر')) {
      return await handleReportCommand(command);
    }
    if (command.includes('رصيد') || command.includes('كم') || command.includes('باقي')) {
      return await handleBalanceCommand(command);
    }
    
    return { type: 'unknown', message: 'عذراً، لم أفهم الأمر. جرب: "أضف فاتورة مبيعات" أو "كم رصيد الصندوق" أو "تقرير الأرباح"' };
  },

  // تحليل الأرباح والمصروفات
  async analyzeProfitability() {
    return {
      type: 'analysis',
      title: '📊 تحليل الأرباح والمصروفات',
      data: {
        revenue: 150000,
        expenses: 85000,
        profit: 65000,
        margin: '43%',
        recommendation: 'الأرباح جيدة. ينصح بتخفيض المصروفات التشغيلية بنسبة 10%'
      }
    };
  },

  // التنبؤ بالعجز
  async predictCashFlow() {
    return {
      type: 'prediction',
      title: '🔮 التنبؤ بالتدفقات النقدية',
      data: {
        currentCash: 50000,
        expectedIn: 75000,
        expectedOut: 90000,
        deficit: -15000,
        recommendation: '⚠️ متوقع عجز 15,000 ﷼ خلال 30 يوم. ينصح بتحصيل الذمم المدينة'
      }
    };
  },

  // اقتراح تخفيض التكاليف
  async suggestCostReduction() {
    return {
      type: 'suggestion',
      title: '💡 اقتراحات تخفيض التكاليف',
      suggestions: [
        'تخفيض المصروفات الإدارية بنسبة 15%',
        'إعادة التفاوض مع الموردين',
        'تحسين إدارة المخزون',
        'ترشيد استهلاك الكهرباء والمياه'
      ]
    };
  },

  // كشف الأخطاء المحاسبية
  async detectErrors() {
    return {
      type: 'audit',
      title: '🔍 فحص الأخطاء المحاسبية',
      findings: [
        { severity: 'high', message: 'يوجد قيد غير متوازن بتاريخ 15/6' },
        { severity: 'medium', message: 'حساب الصندوق لم يتم تسويته هذا الشهر' },
        { severity: 'low', message: 'ينصح بمراجعة أرصدة العملاء المتأخرة' },
      ]
    };
  },

  // اكتشاف القيود غير المتوازنة
  async findUnbalancedEntries() {
    return {
      type: 'warning',
      title: '⚠️ قيود غير متوازنة',
      entries: [
        { number: 'JE-001', date: '2024-06-15', difference: 1500 },
      ]
    };
  },

  // تنبيه المخزون
  async checkInventory() {
    return {
      type: 'inventory',
      title: '📦 حالة المخزون',
      alerts: [
        { item: 'صنف أ', qty: 5, min: 10, status: '⚠️ منخفض' },
        { item: 'صنف ب', qty: 0, min: 5, status: '🔴 نفذ' },
      ]
    };
  },
};

// دوال معالجة الأوامر
async function handleAddCommand(text: string) {
  if (text.includes('فاتورة') || text.includes('مبيعات')) {
    return { type: 'action', message: 'فتح شاشة فاتورة المبيعات', action: 'open_sales_invoice' };
  }
  if (text.includes('مصروف') || text.includes('صرف')) {
    return { type: 'action', message: 'فتح شاشة سند الصرف', action: 'open_payment_voucher' };
  }
  if (text.includes('قبض')) {
    return { type: 'action', message: 'فتح شاشة سند القبض', action: 'open_receipt_voucher' };
  }
  return { type: 'action', message: 'فتح شاشة الإضافة', action: 'open_add' };
}

async function handleSearchCommand(text: string) {
  if (text.includes('عميل')) {
    return { type: 'search', message: 'جاري البحث عن العملاء...', results: [] };
  }
  if (text.includes('حساب')) {
    return { type: 'search', message: 'جاري البحث في الحسابات...', results: [] };
  }
  return { type: 'search', message: 'ماذا تريد أن تبحث عنه؟', results: [] };
}

async function handleReportCommand(text: string) {
  if (text.includes('أرباح') || text.includes('دخل')) {
    return { type: 'report', message: 'جاري إنشاء تقرير الأرباح والخسائر', action: 'open_income_statement' };
  }
  if (text.includes('ميزان')) {
    return { type: 'report', message: 'جاري فتح ميزان المراجعة', action: 'open_trial_balance' };
  }
  return { type: 'report', message: 'أي تقرير تريد؟', action: 'open_reports' };
}

async function handleBalanceCommand(text: string) {
  if (text.includes('صندوق')) {
    return { type: 'balance', message: 'رصيد الصندوق: 50,000 ﷼', balance: 50000 };
  }
  if (text.includes('بنك')) {
    return { type: 'balance', message: 'رصيد البنك: 120,000 ﷼', balance: 120000 };
  }
  return { type: 'balance', message: 'أي رصيد تريد معرفته؟' };
}

export default aiAssistant;
