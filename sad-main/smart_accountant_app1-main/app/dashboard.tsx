import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../src/context/DatabaseContext';

export default function DashboardScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [stats, setStats] = useState({ accounts: 0, customers: 0, suppliers: 0, banks: 0, journals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && db) loadStats();
  }, [isReady, db]);

  async function loadStats() {
    if (!db) return;
    const [a, c, s, b, j] = await Promise.all([
      db.getFirstAsync('SELECT COUNT(*) as cnt FROM accounts'),
      db.getFirstAsync('SELECT COUNT(*) as cnt FROM customers'),
      db.getFirstAsync('SELECT COUNT(*) as cnt FROM suppliers'),
      db.getFirstAsync('SELECT COUNT(*) as cnt FROM banks'),
      db.getFirstAsync('SELECT COUNT(*) as cnt FROM journal_entries'),
    ]);
    setStats({
      accounts: (a as any)?.cnt || 0,
      customers: (c as any)?.cnt || 0,
      suppliers: (s as any)?.cnt || 0,
      banks: (b as any)?.cnt || 0,
      journals: (j as any)?.cnt || 0,
    });
    setLoading(false);
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📊 لوحة التحكم</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {[
            { label: 'الحسابات', value: stats.accounts, color: '#10B981', route: '/ledger/accounts' },
            { label: 'العملاء', value: stats.customers, color: '#3B82F6', route: '/sales/customers' },
            { label: 'الموردين', value: stats.suppliers, color: '#8B5CF6', route: '/inventory/suppliers' },
            { label: 'البنوك', value: stats.banks, color: '#F59E0B', route: '/ledger/banks' },
            { label: 'القيود', value: stats.journals, color: '#F97316', route: '/ledger/journal-entry' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.card, { borderColor: item.color }]} onPress={() => router.push(item.route as any)}>
              <Text style={[styles.cardV, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.cardL}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  card:{width:'47%',backgroundColor:'#16213E',padding:20,borderRadius:14,alignItems:'center',borderWidth:2},
  cardV:{fontSize:32,fontWeight:'bold'},
  cardL:{color:'#94A3B8',fontSize:13,marginTop:4},
});
