import { eventBus } from './eventBus';

// ✅ عند إتمام فاتورة مبيعات - تحديث المخزون
eventBus.on('operation.sales_invoice_cash.completed', (event, data) => {
  console.log('📦 تحديث المخزون بعد فاتورة مبيعات');
  // inventoryService.decreaseStock(data.items);
});

// ✅ عند إتمام فاتورة مشتريات - تحديث المخزون
eventBus.on('operation.purchase_invoice.completed', (event, data) => {
  console.log('📦 تحديث المخزون بعد فاتورة مشتريات');
  // inventoryService.increaseStock(data.items);
});

// ✅ عند إتمام أي عملية - تحديث التقارير
eventBus.on('operation.completed', (event, data) => {
  console.log('📊 تحديث المؤشرات والتقارير');
  // تحديث Dashboard
  // تحديث ميزان المراجعة
  // تحديث الأرصدة
});

// ✅ تنبيهات المخزون
eventBus.on('operation.stock_out.completed', (event, data) => {
  console.log('⚠️ فحص الحد الأدنى للمخزون');
  // if (item.quantity < item.minQuantity) sendAlert();
});

console.log('✅ نظام الأحداث مفعل');
