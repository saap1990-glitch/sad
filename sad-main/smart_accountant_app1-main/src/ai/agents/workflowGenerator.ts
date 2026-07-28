import { workflowEngine } from '../../engine/workflowEngine';

export const generateWorkflow = async (intent: any, entities: any, context: any) => {
  // تحويل النية إلى خطة تنفيذ
  const plan = {
    steps: [] as string[],
    preview: {} as any,
    requiresConfirmation: true,
  };

  switch (intent.entity) {
    case 'sales_invoice':
      plan.steps = ['التحقق من العميل', 'التحقق من الأصناف', 'حساب الإجمالي والضريبة', 'إنشاء القيد المحاسبي', 'حفظ الفاتورة'];
      plan.preview = {
        type: 'فاتورة مبيعات',
        customer: entities.personName || 'غير محدد',
        items: entities.items || 'غير محدد',
        total: entities.amount || 0,
        tax: (entities.amount || 0) * 0.05,
        grandTotal: (entities.amount || 0) * 1.05,
      };
      break;

    case 'receipt_voucher':
      plan.steps = ['التحقق من الصندوق', 'التحقق من الحساب', 'إنشاء القيد', 'حفظ السند'];
      plan.preview = { type: 'سند قبض', amount: entities.amount || 0 };
      break;

    case 'balance':
      plan.steps = ['جلب رصيد الحساب'];
      plan.requiresConfirmation = false;
      plan.preview = { type: 'استعلام عن الرصيد' };
      break;

    default:
      plan.steps = ['معالجة الطلب'];
      plan.preview = { type: intent.entity };
  }

  return plan;
};
