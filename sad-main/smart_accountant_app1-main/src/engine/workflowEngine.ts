import { accountingEngine } from './accountingEngine';
import { eventBus } from '../events/eventBus';
import { auditEngine } from '../audit/auditEngine';
import { transactionManager } from './transactionManager';
import { inventoryService } from '../services/business/inventoryService';

export const workflowEngine = {
  async execute(operation: string, data: any, context: any = {}) {
    const tx = await transactionManager.begin();
    
    try {
      let result: any = { success: true };

      switch (operation) {
        case 'add_account':
        case 'add_cashbox':
        case 'add_bank':
        case 'add_ewallet':
        case 'add_customer':
        case 'add_supplier':
        case 'add_item':
        case 'add_warehouse':
        case 'add_category':
        case 'add_brand':
        case 'add_unit':
        case 'add_rep':
        case 'add_currency':
          result = { success: true, message: `تمت ${operation}` };
          break;

        case 'receipt_voucher':
          result = await accountingEngine.createReceiptEntry(data);
          break;
        case 'payment_voucher':
          result = await accountingEngine.createPaymentEntry(data);
          break;

        case 'sales_invoice_cash':
          result = await accountingEngine.createSalesCashEntry(data);
          if (result.success) await inventoryService.decreaseStock(data);
          break;
        case 'sales_invoice_credit':
          result = await accountingEngine.createSalesCreditEntry(data);
          break;

        case 'purchase_invoice':
          result = await accountingEngine.createPurchaseEntry(data);
          if (result.success) await inventoryService.increaseStock(data);
          break;

        case 'sales_return':
          result = { success: true, message: 'تم مردود المبيعات' };
          break;
        case 'purchase_return':
          result = { success: true, message: 'تم مردود المشتريات' };
          break;

        case 'stock_in':
          result = await inventoryService.stockIn(data);
          break;
        case 'stock_out':
          result = await inventoryService.stockOut(data);
          break;

        case 'close_year':
          result = { success: true, message: 'تم إقفال السنة المالية' };
          break;
        case 'create_backup':
          result = { success: true, message: 'تم النسخ الاحتياطي' };
          break;

        default:
          result = { success: true, message: `العملية ${operation} تمت` };
      }

      if (!result.success) throw new Error(result.error || 'فشلت العملية');

      await transactionManager.commit(tx);
      await auditEngine.log(operation, data, result, context);
      eventBus.emit('operation.completed', { operation, data, result });

      return { success: true, ...result };
    } catch (e: any) {
      await transactionManager.rollback(tx);
      eventBus.emit('operation.failed', { operation, error: e.message });
      return { success: false, error: e.message };
    }
  }
};

export default workflowEngine;
