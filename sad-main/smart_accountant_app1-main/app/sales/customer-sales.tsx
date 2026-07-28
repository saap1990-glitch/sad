import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function CustomerSalesScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!db) return;
    const result = await db.getAllAsync(`
      SELECT c.name_ar, COUNT(si.id) as invoice_count, COALESCE(SUM(si.total),0) as total_sales
      FROM customers c LEFT JOIN sales_invoices si ON si.customer_id = c.id
      WHERE c.is_active = 1 GROUP BY c.id ORDER BY total_sales DESC
    `);
    setCustomers(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📊 مبيعات العملاء</Text><View style={{width:40}}/></View>
      <FlatList data={customers} keyExtractor={(_,i)=>i.toString()}
        renderItem={({item}) => (
          <View style={styles.row}><Text style={styles.name}>{item.name_ar}</Text><Text style={styles.count}>{item.invoice_count} فاتورة</Text><Text style={styles.sales}>{item.total_sales?.toLocaleString()} ﷼</Text></View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد بيانات</Text>}
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
  name:{color:'#FFF',fontSize:13},count:{color:'#94A3B8',fontSize:11},sales:{color:'#10B981',fontSize:13,fontWeight:'bold'},
  empty:{color:'#64748B',textAlign:'center',marginTop:30},
});
