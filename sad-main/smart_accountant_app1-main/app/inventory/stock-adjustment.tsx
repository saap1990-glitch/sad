import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function StockCountScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (isReady && db) loadProducts(); }, [isReady, db]);

  async function loadProducts() {
    if (!db) return;
    const result = await db.getAllAsync('SELECT * FROM products WHERE is_active=1 ORDER BY name_ar');
    setProducts(result as any[]); setLoading(false);
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>⚙️ تسوية المخزون</Text><View style={{width:40}}/></View>
      <FlatList data={products} keyExtractor={i=>i.id.toString()}
        renderItem={({item}) => (
          <View style={styles.row}><Text style={styles.name}>{item.name_ar}</Text><TextInput style={styles.qty} placeholder="الفرق" placeholderTextColor="#666" keyboardType="numeric" textAlign="center" /></View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد أصناف</Text>}
        contentContainerStyle={{padding:10}}
      />
      <TouchableOpacity style={styles.saveBtn}><Text style={styles.saveT}>💾 حفظ الجرد</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:12,backgroundColor:'#FFF',marginBottom:4,borderRadius:8},
  name:{color:'#1E293B',fontSize:14,flex:1},qty:{backgroundColor:'#F1F5F9',padding:8,borderRadius:6,width:80},
  empty:{color:'#94A3B8',textAlign:'center',marginTop:40},
  saveBtn:{backgroundColor:'#D4AF37',padding:14,margin:16,borderRadius:10,alignItems:'center'},saveT:{color:'#FFF',fontWeight:'bold'},
});
