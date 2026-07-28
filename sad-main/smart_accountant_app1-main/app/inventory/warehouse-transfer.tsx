import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function WarehouseTransferScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [fromWarehouse, setFromWarehouse] = useState<any>(null);
  const [toWarehouse, setToWarehouse] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && db) loadData();
  }, [isReady, db]);

  async function loadData() {
    if (!db) return;
    const [prod, wh] = await Promise.all([
      db.getAllAsync('SELECT * FROM products WHERE is_active=1'),
      db.getAllAsync('SELECT * FROM warehouses WHERE is_active=1')
    ]);
    setProducts(prod as any[]); setWarehouses(wh as any[]); setLoading(false);
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🔄 تحويل بين المخازن</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>الصنف</Text>
        <PickerModal visible={true} title="اختر الصنف" data={products} onSelect={setSelectedProduct} onClose={()=>{}} />
        <Text style={styles.label}>من مخزن</Text>
        <PickerModal visible={true} title="من مخزن" data={warehouses} onSelect={setFromWarehouse} onClose={()=>{}} />
        <Text style={styles.label}>إلى مخزن</Text>
        <PickerModal visible={true} title="إلى مخزن" data={warehouses} onSelect={setToWarehouse} onClose={()=>{}} />
        <Text style={styles.label}>الكمية</Text>
        <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" textAlign="center"/>
        <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('✅', 'تم التحويل')}><Text style={styles.saveT}>تنفيذ</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  content:{padding:16},
  label:{fontSize:14,fontWeight:'bold',marginTop:12,marginBottom:6},
  input:{backgroundColor:'#FFF',borderRadius:10,padding:14,fontSize:16,borderWidth:1,borderColor:'#E2E8F0'},
  saveBtn:{backgroundColor:'#6366F1',padding:16,borderRadius:12,alignItems:'center',marginTop:20},saveT:{color:'#FFF',fontWeight:'bold'},
});
