import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

export default function IncomeStatementScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ revenue: 0, expenses: 0, netIncome: 0 });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await financialEngine.getIncomeStatement(db);
    setData(result); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📈 قائمة الدخل</Text><TouchableOpacity onPress={loadData}><Text style={styles.refresh}>🔄</Text></TouchableOpacity></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, {borderColor:'#3B82F6'}]}><Text style={styles.cardT}>الإيرادات</Text><Text style={[styles.cardV, {color:'#3B82F6'}]}>{data.revenue.toLocaleString()} ﷼</Text></View>
        <View style={[styles.card, {borderColor:'#F59E0B'}]}><Text style={styles.cardT}>المصروفات</Text><Text style={[styles.cardV, {color:'#F59E0B'}]}>{data.expenses.toLocaleString()} ﷼</Text></View>
        <View style={[styles.card, {borderColor: data.netIncome >= 0 ? '#10B981' : '#EF4444'}]}>
          <Text style={styles.cardT}>صافي {data.netIncome >= 0 ? 'الربح' : 'الخسارة'}</Text>
          <Text style={[styles.cardV, {color: data.netIncome >= 0 ? '#10B981' : '#EF4444'}]}>{Math.abs(data.netIncome).toLocaleString()} ﷼</Text>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},refresh:{fontSize:22,padding:8},
  content:{padding:16},
  card:{backgroundColor:'#16213E',padding:20,borderRadius:14,alignItems:'center',marginBottom:12,borderWidth:2},
  cardT:{color:'#94A3B8',fontSize:14},cardV:{fontSize:28,fontWeight:'bold',marginTop:8},
});
