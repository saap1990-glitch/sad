import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

export default function SalesInvoiceScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();

  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [suppliers, setCustomers] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedCashAccount, setSelectedCashAccount] = useState<any>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('0');

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const [cust, cash, bank, wh, prod] = await Promise.all([
      db.getAllAsync('SELECT * FROM suppliers WHERE is_active=1'),
      db.getAllAsync("SELECT * FROM accounts WHERE code LIKE '1101%' AND is_leaf=1 AND is_active=1"),
      db.getAllAsync("SELECT * FROM accounts WHERE code LIKE '1102%' AND is_leaf=1 AND is_active=1"),
      db.getAllAsync('SELECT * FROM warehouses WHERE is_active=1'),
      db.getAllAsync('SELECT * FROM products WHERE is_active=1')
    ]);
    setCustomers(cust as any[]); setCashAccounts(cash as any[]); setBankAccounts(bank as any[]);
    setWarehouses(wh as any[]); setProducts(prod as any[]);
    const last = await db.getFirstAsync("SELECT invoice_number FROM purchase_invoices ORDER BY id DESC LIMIT 1") as any;
    let n = 1; if (last?.invoice_number) n = parseInt(last.invoice_number.split('-').pop()) + 1;
    setInvoiceNumber(`INV-P-${String(n).padStart(5,'0')}`);
    setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const addItem = () => {
    if (!selectedProduct) return;
    const qty = parseFloat(quantity) || 0;
    const prc = parseFloat(price) || 0;
    if (qty <= 0 || prc <= 0) { Alert.alert('خطأ', 'أدخل كمية وسعر صحيحين'); return; }
    setItems([...items, { id: Date.now(), product_id: selectedProduct.id, name: selectedProduct.name_ar, qty, price: prc, total: qty * prc }]);
    setQuantity('1'); setPrice('0'); setSelectedProduct(null); setShowProductPicker(false);
  };

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  const saveInvoice = async () => {
    if (items.length === 0 || !db) { Alert.alert('خطأ', 'أضف أصنافاً'); return; }
    if (paymentType === 'credit' && !selectedCustomer) { Alert.alert('خطأ', 'اختر المورد'); return; }
    if (paymentType === 'cash' && !selectedCashAccount && !selectedBankAccount) { Alert.alert('خطأ', 'اختر الصندوق أو البنك'); return; }

    setLoading(true);
    try {
      await db.runAsync('INSERT INTO purchase_invoices (invoice_number, date, customer_id, total, net_total, status) VALUES (?,?,?,?,?,"posted")',
        [invoiceNumber, invoiceDate, selectedCustomer?.id || 0, totalAmount, totalAmount]);

      const salesAccount = await db.getFirstAsync("SELECT a.id FROM system_accounts sa JOIN accounts a ON a.id = sa.account_id WHERE sa.key = 'purchase_account'") as any;
      if (!salesAccount) { Alert.alert('خطأ', 'حساب المشتريات غير موجود'); setLoading(false); return; }

      const lines: any[] = [];
      if (paymentType === 'cash') {
        if (selectedCashAccount) lines.push({ account_id: selectedCashAccount.id, debit_original: totalAmount, credit_original: 0, description: 'مشتريات نقدية' });
        if (selectedBankAccount) lines.push({ account_id: selectedBankAccount.id, debit_original: totalAmount, credit_original: 0, description: 'مشتريات بنكية' });
      } else {
        const custLink = await db.getFirstAsync("SELECT account_id FROM account_links WHERE module='suppliers' AND entity_id=?", [selectedCustomer.id]) as any;
        if (custLink) lines.push({ account_id: custLink.account_id, debit_original: totalAmount, credit_original: 0, description: `مدين ${selectedCustomer.name_ar}` });
      }
      lines.push({ account_id: salesAccount.id, debit_original: 0, credit_original: totalAmount, description: 'إيراد مشتريات' });

      await financialEngine.executeTransaction(db, {
        date: invoiceDate,
        description: description || `فاتورة شراء ${invoiceNumber}`,
        reference: invoiceNumber,
        source_type: 'purchase_invoice',
        currency_code: 'YER',
        exchange_rate: 1,
        lines
      });

      Alert.alert('✅', `تم حفظ الفاتورة ${invoiceNumber}`);
      setItems([]); setSelectedCustomer(null); setSelectedCashAccount(null); setSelectedBankAccount(null); setSelectedWarehouse(null);
      loadData();
    } catch(e: any) { Alert.alert('خطأ', e.message || 'فشل الحفظ'); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🧾 فاتورة شراء</Text><Text style={styles.num}>{invoiceNumber}</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* نوع الدفع */}
        <Text style={styles.section}>نوع الدفع</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity style={[styles.typeBtn, paymentType==='cash' && styles.typeBtnActive]} onPress={() => setPaymentType('cash')}><Text>💰 نقدي</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, paymentType==='credit' && styles.typeBtnActive]} onPress={() => setPaymentType('credit')}><Text>📋 آجل</Text></TouchableOpacity>
        </View>

        {/* اختيار المورد أو الصندوق/البنك */}
        {paymentType === 'credit' ? (
          <>
            <Text style={styles.section}>المورد</Text>
            <TouchableOpacity style={styles.picker} onPress={() => {
              Alert.alert('اختر المورد', '', suppliers.map(c => ({ text: c.name_ar, onPress: () => setSelectedCustomer(c) })).concat([{ text: 'إلغاء', style: 'cancel' }]));
            }}>
              <Text style={selectedCustomer ? styles.pv : styles.pp}>{selectedCustomer?.name_ar || 'اختر المورد'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.section}>الصندوق / البنك</Text>
            <TouchableOpacity style={styles.picker} onPress={() => {
              Alert.alert('اختر الصندوق', '', cashAccounts.map(c => ({ text: `${c.code} - ${c.name_ar}`, onPress: () => setSelectedCashAccount(c) })).concat(bankAccounts.map(b => ({ text: `${b.code} - ${b.name_ar}`, onPress: () => setSelectedBankAccount(b) }))).concat([{ text: 'إلغاء', style: 'cancel' }]));
            }}>
              <Text style={(selectedCashAccount || selectedBankAccount) ? styles.pv : styles.pp}>
                {selectedCashAccount ? `💰 ${selectedCashAccount.name_ar}` : selectedBankAccount ? `🏦 ${selectedBankAccount.name_ar}` : 'اختر الصندوق أو البنك'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* المخزن */}
        <Text style={styles.section}>المخزن</Text>
        <TouchableOpacity style={styles.picker} onPress={() => {
          Alert.alert('اختر المخزن', '', warehouses.map(w => ({ text: w.name_ar, onPress: () => setSelectedWarehouse(w) })).concat([{ text: 'إلغاء', style: 'cancel' }]));
        }}>
          <Text style={selectedWarehouse ? styles.pv : styles.pp}>{selectedWarehouse?.name_ar || 'اختر المخزن'}</Text>
        </TouchableOpacity>

        {/* التاريخ */}
        <Text style={styles.section}>التاريخ</Text>
        <TextInput style={styles.input} value={invoiceDate} onChangeText={setInvoiceDate} placeholder="YYYY-MM-DD" placeholderTextColor="#666" textAlign="center"/>

        {/* الأصناف */}
        <Text style={styles.section}>الأصناف</Text>
        {items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name} x {item.qty}</Text>
            <Text style={styles.itemTotal}>{item.total.toLocaleString()} ﷼</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.addItemBtn} onPress={() => setShowProductPicker(true)}><Text style={styles.addItemBtnT}>➕ إضافة صنف</Text></TouchableOpacity>

        {selectedProduct && (
          <View style={styles.qtyRow}>
            <TextInput style={styles.qtyInput} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="الكمية" placeholderTextColor="#666"/>
            <TextInput style={styles.qtyInput} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="السعر" placeholderTextColor="#666"/>
            <TouchableOpacity style={styles.addBtn} onPress={addItem}><Text style={{color:'#FFF'}}>إضافة</Text></TouchableOpacity>
          </View>
        )}

        <View style={styles.totalRow}><Text style={styles.totalLabel}>الإجمالي</Text><Text style={styles.totalValue}>{totalAmount.toLocaleString()} ﷼</Text></View>

        <Text style={styles.section}>البيان</Text>
        <TextInput style={[styles.input,{height:70}]} value={description} onChangeText={setDescription} placeholder="بيان الفاتورة" placeholderTextColor="#666" multiline textAlign="right"/>

        <TouchableOpacity style={styles.saveBtn} onPress={saveInvoice}><Text style={styles.saveBtnT}>💾 حفظ الفاتورة</Text></TouchableOpacity>
        <View style={{height:30}}/>
      </ScrollView>

      <PickerModal visible={showProductPicker} title="اختر الصنف" data={products} onSelect={(item) => { setSelectedProduct(item); setPrice(String(item.sale_price || 0)); }} onClose={() => setShowProductPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:22,color:'#D4AF37'},t:{fontSize:17,fontWeight:'bold'},num:{color:'#10B981',fontSize:11},
  content:{padding:14},
  section:{color:'#64748B',fontSize:12,fontWeight:'bold',marginTop:14,marginBottom:6},
  typeRow:{flexDirection:'row',gap:10}, typeBtn:{flex:1,padding:12,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center',borderWidth:1}, typeBtnActive:{borderColor:'#D4AF37',backgroundColor:'#D4AF3710'},
  picker:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,borderWidth:1,borderColor:'#E2E8F0'},
  pv:{color:'#1E293B',fontSize:14},pp:{color:'#94A3B8',fontSize:14},
  input:{backgroundColor:'#FFF',borderRadius:8,padding:10,color:'#1E293B',fontSize:13,borderWidth:1,borderColor:'#E2E8F0'},
  itemRow:{flexDirection:'row',justifyContent:'space-between',padding:8,backgroundColor:'#FFF',borderRadius:6,marginTop:4},
  itemName:{color:'#1E293B',fontSize:13},itemTotal:{color:'#10B981',fontWeight:'bold'},
  addItemBtn:{backgroundColor:'#D4AF37',padding:10,borderRadius:8,alignItems:'center',marginTop:10},
  addItemBtnT:{color:'#FFF',fontWeight:'bold'},
  qtyRow:{flexDirection:'row',gap:8,marginTop:8}, qtyInput:{flex:1,backgroundColor:'#FFF',borderRadius:6,padding:8,fontSize:12}, addBtn:{backgroundColor:'#10B981',padding:8,borderRadius:6},
  totalRow:{flexDirection:'row',justifyContent:'space-between',marginTop:16,padding:12,backgroundColor:'#FFF',borderRadius:8},
  totalLabel:{color:'#64748B',fontSize:14},totalValue:{color:'#10B981',fontSize:18,fontWeight:'bold'},
  saveBtn:{backgroundColor:'#10B981',padding:14,borderRadius:10,alignItems:'center',marginTop:16},
  saveBtnT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
});
