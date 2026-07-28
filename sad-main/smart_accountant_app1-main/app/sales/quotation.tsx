import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function QuotationScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('0');
  const [items, setItems] = useState<any[]>([]);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const [cust, prod] = await Promise.all([
      db.getAllAsync('SELECT * FROM customers WHERE is_active=1'),
      db.getAllAsync('SELECT * FROM products WHERE is_active=1')
    ]);
    setCustomers(cust as any[]); setProducts(prod as any[]);
    setQuotationNumber(`QTN-${String(Date.now()%10000).padStart(5,'0')}`);
    setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const addItem = () => {
    if (!selectedProduct) return;
    const qty = parseFloat(quantity) || 0;
    const prc = parseFloat(price) || 0;
    if (qty <= 0 || prc <= 0) { Alert.alert('خطأ', 'أدخل كمية وسعر صحيحين'); return; }
    setItems([...items, { id: Date.now(), product_id: selectedProduct.id, name: selectedProduct.name_ar, qty, price: prc, total: qty * prc }]);
    setQuantity('1'); setPrice('0'); setSelectedProduct(null);
  };

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📋 عرض أسعار</Text><Text style={styles.num}>{quotationNumber}</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>العميل</Text>
        <TouchableOpacity style={styles.picker} onPress={() => {
          Alert.alert('اختر العميل', '', customers.map(c => ({ text: c.name_ar, onPress: () => setSelectedCustomer(c) })).concat([{ text: 'إلغاء', style: 'cancel' }]));
        }}>
          <Text style={selectedCustomer ? styles.pv : styles.pp}>{selectedCustomer?.name_ar || 'اختر العميل'}</Text>
        </TouchableOpacity>
        <Text style={styles.section}>الأصناف</Text>
        {items.map(item => (
          <View key={item.id} style={styles.itemRow}><Text style={styles.itemName}>{item.name} x {item.qty}</Text><Text style={styles.itemTotal}>{item.total.toLocaleString()} ﷼</Text></View>
        ))}
        <TouchableOpacity style={styles.addItemBtn} onPress={() => {
          Alert.alert('اختر الصنف', '', products.map(p => ({ text: `${p.name_ar} (${p.sale_price})`, onPress: () => { setSelectedProduct(p); setPrice(String(p.sale_price)); } })).concat([{ text: 'إلغاء', style: 'cancel' }]));
        }}><Text style={styles.addItemBtnT}>➕ إضافة صنف</Text></TouchableOpacity>
        {selectedProduct && (
          <View style={styles.qtyRow}>
            <TextInput style={styles.qtyInput} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="الكمية" placeholderTextColor="#666"/>
            <TextInput style={styles.qtyInput} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="السعر" placeholderTextColor="#666"/>
            <TouchableOpacity style={styles.addBtn} onPress={addItem}><Text style={{color:'#FFF'}}>إضافة</Text></TouchableOpacity>
          </View>
        )}
        <View style={styles.totalRow}><Text style={styles.totalLabel}>الإجمالي</Text><Text style={styles.totalValue}>{totalAmount.toLocaleString()} ﷼</Text></View>
        <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('✅', 'تم حفظ عرض السعر')}><Text style={styles.saveBtnT}>💾 حفظ</Text></TouchableOpacity>
        <View style={{height:30}}/>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:22,color:'#D4AF37'},t:{fontSize:17,fontWeight:'bold'},num:{color:'#F59E0B',fontSize:11},
  content:{padding:14},
  section:{color:'#64748B',fontSize:12,fontWeight:'bold',marginTop:14,marginBottom:6},
  picker:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,borderWidth:1,borderColor:'#E2E8F0'},
  pv:{color:'#1E293B',fontSize:14},pp:{color:'#94A3B8',fontSize:14},
  itemRow:{flexDirection:'row',justifyContent:'space-between',padding:8,backgroundColor:'#FFF',borderRadius:6,marginTop:4},
  itemName:{color:'#1E293B',fontSize:13},itemTotal:{color:'#F59E0B',fontWeight:'bold'},
  addItemBtn:{backgroundColor:'#F59E0B',padding:10,borderRadius:8,alignItems:'center',marginTop:10},addItemBtnT:{color:'#FFF',fontWeight:'bold'},
  qtyRow:{flexDirection:'row',gap:8,marginTop:8},qtyInput:{flex:1,backgroundColor:'#FFF',borderRadius:6,padding:8,fontSize:12},addBtn:{backgroundColor:'#F59E0B',padding:8,borderRadius:6},
  totalRow:{flexDirection:'row',justifyContent:'space-between',marginTop:16,padding:12,backgroundColor:'#FFF',borderRadius:8},
  totalLabel:{color:'#64748B',fontSize:14},totalValue:{color:'#F59E0B',fontSize:18,fontWeight:'bold'},
  saveBtn:{backgroundColor:'#F59E0B',padding:14,borderRadius:10,alignItems:'center',marginTop:16},saveBtnT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
});
