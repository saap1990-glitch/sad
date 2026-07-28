import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function SalesSummaryScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0, customers: 0 });

  useEffect(() => {
    if (isReady && db) loadStats();
  }, [isReady, db]);

  async function loadStats() {
    if (!db) return;
    const [total, count, customers] = await Promise.all([
      db.getFirstAsync('SELECT COALESCE(SUM(total),0) as t FROM sales_invoices'),
      db.getFirstAsync('SELECT COUNT(*) as c FROM sales_invoices'),
      db.getFirstAsync('SELECT COUNT(DISTINCT customer_id) as c FROM sales_invoices')
    ]);
    setStats({
      total: (total as any)?.t || 0,
      count: (count as any)?.c || 0,
      customers: (customers as any)?.c || 0,
    });
    setLoading(false);
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📊 ملخص المبيعات</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={{padding:16}}>
        <View style={styles.card}><Text style={styles.cardT}>إجمالي المبيعات</Text><Text style={styles.cardV}>{stats.total.toLocaleString()} ﷼</Text></View>
        <View style={styles.card}><Text style={styles.cardT}>عدد الفواتير</Text><Text style={styles.cardV}>{stats.count}</Text></View>
        <View style={styles.card}><Text style={styles.cardT}>العملاء</Text><Text style={styles.cardV}>{stats.customers}</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  card:{backgroundColor:'#16213E',padding:20,borderRadius:14,alignItems:'center',marginBottom:12},
  cardT:{color:'#94A3B8',fontSize:14},cardV:{fontSize:28,fontWeight:'bold',color:'#D4AF37',marginTop:8},
});
