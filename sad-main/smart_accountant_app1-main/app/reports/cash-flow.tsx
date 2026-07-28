import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

export default function CashFlowScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [inflow, setInflow] = useState(0);
  const [outflow, setOutflow] = useState(0);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const inflowData = await db.getFirstAsync("SELECT COALESCE(SUM(credit),0) as total FROM journal_lines WHERE account_id IN (SELECT id FROM accounts WHERE type='asset')") as any;
    const outflowData = await db.getFirstAsync("SELECT COALESCE(SUM(debit),0) as total FROM journal_lines WHERE account_id IN (SELECT id FROM accounts WHERE type='asset')") as any;
    setInflow(inflowData?.total || 0);
    setOutflow(outflowData?.total || 0);
    setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  const netCash = inflow - outflow;
  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>💵 التدفقات النقدية</Text><TouchableOpacity onPress={loadData}><Text style={styles.refresh}>🔄</Text></TouchableOpacity></View>
      <ScrollView contentContainerStyle={{padding:14}}>
        <View style={[styles.card, {borderColor:'#10B981'}]}><Text style={styles.cardT}>التدفقات الداخلة</Text><Text style={[styles.cardV, {color:'#10B981'}]}>{inflow.toLocaleString()} ﷼</Text></View>
        <View style={[styles.card, {borderColor:'#EF4444'}]}><Text style={styles.cardT}>التدفقات الخارجة</Text><Text style={[styles.cardV, {color:'#EF4444'}]}>{outflow.toLocaleString()} ﷼</Text></View>
        <View style={[styles.card, {borderColor: netCash >= 0 ? '#10B981' : '#EF4444'}]}><Text style={styles.cardT}>صافي التدفقات</Text><Text style={[styles.cardV, {color: netCash >= 0 ? '#10B981' : '#EF4444'}]}>{netCash.toLocaleString()} ﷼</Text></View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},refresh:{fontSize:22,padding:8},
  card:{backgroundColor:'#16213E',padding:20,borderRadius:14,alignItems:'center',marginBottom:12,borderWidth:2},
  cardT:{color:'#94A3B8',fontSize:14},cardV:{fontSize:28,fontWeight:'bold',marginTop:8},
});
