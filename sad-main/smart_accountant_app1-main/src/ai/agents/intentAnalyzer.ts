import { APP_KNOWLEDGE } from '../knowledge/appKnowledge';

export type Intent = {
  action: 'create' | 'read' | 'update' | 'delete' | 'query' | 'send' | 'help' | 'unknown';
  entity: string;
  details: Record<string, any>;
  confidence: number;
};

export const analyzeIntent = (text: string): Intent => {
  const t = text.toLowerCase().trim();

  // استعلام عن رصيد
  if (t.includes('رصيد') || t.includes('كم') && (t.includes('صندوق') || t.includes('بنك') || t.includes('محفظة'))) {
    return { action: 'query', entity: 'balance', details: { type: t.includes('صندوق') ? 'cash' : t.includes('بنك') ? 'bank' : 'ewallet' }, confidence: 0.9 };
  }

  // إنشاء فاتورة
  if ((t.includes('أنشئ') || t.includes('أضف') || t.includes('سجل')) && (t.includes('فاتورة') || t.includes('بيع'))) {
    return { action: 'create', entity: 'sales_invoice', details: { type: t.includes('آجل') ? 'credit' : 'cash' }, confidence: 0.95 };
  }

  // سند قبض
  if ((t.includes('سند') || t.includes('قبض')) && !t.includes('صرف')) {
    return { action: 'create', entity: 'receipt_voucher', details: { type: 'receipt' }, confidence: 0.9 };
  }

  // سند صرف
  if (t.includes('صرف') || t.includes('سند صرف')) {
    return { action: 'create', entity: 'payment_voucher', details: { type: 'payment' }, confidence: 0.9 };
  }

  // عرض تقرير
  if (t.includes('عرض') || t.includes('تقرير') || t.includes('كشف')) {
    if (t.includes('ميزان')) return { action: 'query', entity: 'trial_balance', details: {}, confidence: 0.9 };
    if (t.includes('أرباح') || t.includes('دخل')) return { action: 'query', entity: 'income_statement', details: {}, confidence: 0.9 };
    if (t.includes('عميل') || t.includes('حساب')) return { action: 'query', entity: 'account_statement', details: {}, confidence: 0.85 };
  }

  // إرسال
  if (t.includes('أرسل') || t.includes('ابعث') || t.includes('شارك')) {
    return { action: 'send', entity: 'document', details: { method: t.includes('واتس') ? 'whatsapp' : 'email' }, confidence: 0.85 };
  }

  // مساعدة
  if (t.includes('كيف') || t.includes('شرح') || t.includes('مساعدة') || t.includes('ماهو') || t.includes('ماهي')) {
    return { action: 'help', entity: 'faq', details: { question: text }, confidence: 0.8 };
  }

  // غير معروف - نطرح أسئلة توضيحية
  return { action: 'unknown', entity: 'clarification', details: { original: text }, confidence: 0.3 };
};

// استخراج الكيانات من النص
export const extractEntities = (text: string): Record<string, any> => {
  const entities: Record<string, any> = {};

  // استخراج المبالغ
  const amountMatch = text.match(/(\d+[\d,]*)\s*(ريال|دولار|﷼|\$|SAR|USD|YER)?/i);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    entities.currency = amountMatch[2] || 'YER';
  }

  // استخراج الكميات
  const qtyMatch = text.match(/(\d+)\s*(كيس|حبة|كرتون|قطعة|وحدة)/i);
  if (qtyMatch) {
    entities.quantity = parseInt(qtyMatch[1]);
    entities.unit = qtyMatch[2];
  }

  // استخراج أسماء الأشخاص
  const personMatch = text.match(/(?:للعميل|للمورد|العميل|المورد|لـ|إلى)\s+([^\s،]+(?:\s+[^\s،]+)?)/i);
  if (personMatch) {
    entities.personName = personMatch[1].trim();
  }

  return entities;
};
