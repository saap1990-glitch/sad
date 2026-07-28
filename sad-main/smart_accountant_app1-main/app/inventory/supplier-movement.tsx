import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function QtyReportScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (isReady && db) loadData(); }, [isReady, db]);

  async function loadData() {
    if (!db) return;
    const result = await db.getAllAsync('SELECT name_ar, purchase_price, sale_price FROM products WHERE is_active=1');
    setProducts(result as any[]); setLoading(false);
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🚚 حركة الموردين</Text><View style={{width:40}}/></View>
      <FlatList data={products} keyExtractor={(_,i)=>i.toString()}
        renderItem={({item}) => (
          <View style={styles.row}><Text style={styles.name}>{item.name_ar}</Text><Text style={styles.price}>شراء: {item.purchase_price} | بيع: {item.sale_price}</Text></View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد أصناف</Text>}
        contentContainerStyle={{padding:10}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  row:{flexDirection:'row',justifyContent:'space-between',padding:12,borderBottomWidth:0.5,borderBottomColor:'#2a3550',marginHorizontal:8},
  name:{color:'#FFF',fontSize:13},price:{color:'#94A3B8',fontSize:11},
  empty:{color:'#64748B',textAlign:'center',marginTop:30},
});
