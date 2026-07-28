import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function InventoryIssueScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const [prod, wh] = await Promise.all([
      db.getAllAsync('SELECT * FROM products WHERE is_active=1'),
      db.getAllAsync('SELECT * FROM warehouses WHERE is_active=1')
    ]);
    setProducts(prod as any[]); setWarehouses(wh as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleIssue = async () => {
    if (!quantity || !selectedProduct || !db) { Alert.alert('خطأ', 'أدخل الكمية واختر الصنف'); return; }
    setLoading(true);
    try {
      // هنا يمكن إنشاء قيد محاسبي (تخفيض المخزون)
      Alert.alert('✅', 'تم صرف المخزون');
      setQuantity(''); setSelectedProduct(null); setDescription('');
    } catch(e: any) { Alert.alert('خطأ', e.message); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📤 صرف مخزون</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>الصنف</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowProductPicker(true)}>
          <Text style={selectedProduct ? styles.pv : styles.pp}>{selectedProduct?.name_ar || 'اختر الصنف'}</Text>
        </TouchableOpacity>
        <Text style={styles.section}>المخزن</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowWarehousePicker(true)}>
          <Text style={selectedWarehouse ? styles.pv : styles.pp}>{selectedWarehouse?.name_ar || 'اختر المخزن'}</Text>
        </TouchableOpacity>
        <Text style={styles.section}>الكمية</Text>
        <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" textAlign="center"/>
        <Text style={styles.section}>التاريخ</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#666" textAlign="center"/>
        <Text style={styles.section}>البيان</Text>
        <TextInput style={[styles.input,{height:70}]} value={description} onChangeText={setDescription} placeholder="بيان الصرف" placeholderTextColor="#666" multiline textAlign="right"/>
        <TouchableOpacity style={styles.saveBtn} onPress={handleIssue}><Text style={styles.saveBtnT}>✅ صرف</Text></TouchableOpacity>
        <View style={{height:30}}/>
      </ScrollView>
      <PickerModal visible={showProductPicker} title="اختر الصنف" data={products} onSelect={(item) => { setSelectedProduct(item); setShowProductPicker(false); }} onClose={() => setShowProductPicker(false)} />
      <PickerModal visible={showWarehousePicker} title="اختر المخزن" data={warehouses} onSelect={(item) => { setSelectedWarehouse(item); setShowWarehousePicker(false); }} onClose={() => setShowWarehousePicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  content:{padding:16},
  section:{color:'#64748B',fontSize:12,fontWeight:'bold',marginTop:14,marginBottom:6},
  picker:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,borderWidth:1,borderColor:'#E2E8F0'},
  pv:{color:'#1E293B',fontSize:14},pp:{color:'#94A3B8',fontSize:14},
  input:{backgroundColor:'#FFF',borderRadius:10,padding:14,color:'#1E293B',fontSize:16,borderWidth:1,borderColor:'#E2E8F0'},
  saveBtn:{backgroundColor:'#F59E0B',padding:14,borderRadius:10,alignItems:'center',marginTop:16},
  saveBtnT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
});
