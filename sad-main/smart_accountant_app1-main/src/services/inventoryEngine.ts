import * as SQLite from 'expo-sqlite';

let db: any = null;
const getDB = async () => { if (!db) db = await SQLite.openDatabaseAsync('smart_accountant.db'); return db; };

// ✅ دالة موحدة لحركات المخزون
export const moveInventory = async (params: {
  type: 'in' | 'out' | 'transfer';
  itemId: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  qty: number;
  price: number;
  date: string;
  reference: string;
  notes?: string;
}) => {
  const d = await getDB();
  const total = params.qty * params.price;
  const id = 'inv-' + Date.now();

  await d.runAsync(
    'INSERT INTO inventory_movements (id, item_id, warehouse_id, type, qty, price, total, date, reference, notes) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, params.itemId, params.warehouseId, params.type, params.qty, params.price, total, params.date, params.reference, params.notes || '']
  );

  // ✅ تحديث كمية الصنف
  const sign = params.type === 'in' ? '+' : '-';
  await d.runAsync(`UPDATE items SET quantity = COALESCE(quantity,0) ${sign} ? WHERE id = ?`, [params.qty, params.itemId]);

  // ✅ تأثير على الحسابات
  if (params.type === 'in') {
    // توريد: مدين المخزون / دائن الصندوق أو المورد
    await d.runAsync('UPDATE accounts SET balance = COALESCE(balance,0) + ? WHERE id = ?', [total, '115']); // المخزون
  } else if (params.type === 'out') {
    // صرف: مدين المصروفات / دائن المخزون
    await d.runAsync('UPDATE accounts SET balance = COALESCE(balance,0) - ? WHERE id = ?', [total, '115']); // المخزون
    await d.runAsync('UPDATE accounts SET balance = COALESCE(balance,0) + ? WHERE id = ?', [total, '511']); // تكلفة المبيعات
  }

  return { success: true, id };
};

// ✅ تأثير فاتورة المبيعات على المخزون
export const salesEffect = async (items: Array<{ itemId: string; qty: number; price: number }>, warehouseId: string, warehouseName: string, date: string, reference: string) => {
  for (const item of items) {
    await moveInventory({
      type: 'out',
      itemId: item.itemId,
      itemName: '',
      warehouseId,
      warehouseName,
      qty: item.qty,
      price: item.price,
      date,
      reference,
      notes: `فاتورة مبيعات ${reference}`
    });
  }
};

// ✅ تأثير فاتورة المشتريات على المخزون
export const purchaseEffect = async (items: Array<{ itemId: string; qty: number; price: number }>, warehouseId: string, warehouseName: string, date: string, reference: string) => {
  for (const item of items) {
    await moveInventory({
      type: 'in',
      itemId: item.itemId,
      itemName: '',
      warehouseId,
      warehouseName,
      qty: item.qty,
      price: item.price,
      date,
      reference,
      notes: `فاتورة مشتريات ${reference}`
    });
  }
};

// ✅ تأثير مردود المبيعات
export const salesReturnEffect = async (items: Array<{ itemId: string; qty: number }>, warehouseId: string, warehouseName: string, date: string, reference: string) => {
  for (const item of items) {
    await moveInventory({
      type: 'in',
      itemId: item.itemId,
      itemName: '',
      warehouseId,
      warehouseName,
      qty: item.qty,
      price: 0,
      date,
      reference,
      notes: `مردود مبيعات ${reference}`
    });
  }
};

// ✅ تأثير مردود المشتريات
export const purchaseReturnEffect = async (items: Array<{ itemId: string; qty: number }>, warehouseId: string, warehouseName: string, date: string, reference: string) => {
  for (const item of items) {
    await moveInventory({
      type: 'out',
      itemId: item.itemId,
      itemName: '',
      warehouseId,
      warehouseName,
      qty: item.qty,
      price: 0,
      date,
      reference,
      notes: `مردود مشتريات ${reference}`
    });
  }
};
