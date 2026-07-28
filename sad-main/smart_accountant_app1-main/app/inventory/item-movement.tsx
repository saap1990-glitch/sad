import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function ItemMovementScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const prod = await db.getAllAsync('SELECT * FROM products WHERE is_active=1');
    setProducts(prod as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const selectProduct = async (prod: any) => {
    setSelectedProduct(prod); setShowPicker(false); setLoading(true);
    // هنا يتم جلب حركات الصنف من جدول مخصص (إذا وجد)
    setMovements([]); setLoading(false);
  };

  if (!isReady) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📋 حركة الصنف</Text><View style={{width:40}}/></View>
      <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(true)}>
        <Text style={selectedProduct ? styles.pv : styles.pp}>{selectedProduct?.name_ar || 'اختر الصنف'}</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator/> : (
        <FlatList data={movements} keyExtractor={(_,i)=>i.toString()}
          ListEmptyComponent={<Text style={styles.empty}>لا توجد حركات</Text>}
          renderItem={({item}) => (<View style={styles.row}><Text>{item.date}</Text></View>)}
        />
      )}
      <PickerModal visible={showPicker} title="اختر الصنف" data={products} onSelect={selectProduct} onClose={() => setShowPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  picker:{flexDirection:'row',justifyContent:'space-between',margin:12,backgroundColor:'#16213E',padding:14,borderRadius:10,borderWidth:1,borderColor:'#2a3550'},
  pv:{color:'#FFF',fontSize:14},pp:{color:'#64748B',fontSize:14},
  row:{padding:10},empty:{color:'#64748B',textAlign:'center',marginTop:30},
});
