import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

export default function BalanceSheetScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ assets: 0, liabilities: 0, equity: 0 });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await financialEngine.getBalanceSheet(db);
    setData(result); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📊 الميزانية العمومية</Text><TouchableOpacity onPress={loadData}><Text style={styles.refresh}>🔄</Text></TouchableOpacity></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, {borderColor:'#10B981'}]}><Text style={styles.cardT}>إجمالي الأصول</Text><Text style={[styles.cardV, {color:'#10B981'}]}>{data.assets.toLocaleString()} ﷼</Text></View>
        <View style={[styles.card, {borderColor:'#EF4444'}]}><Text style={styles.cardT}>إجمالي الخصوم</Text><Text style={[styles.cardV, {color:'#EF4444'}]}>{data.liabilities.toLocaleString()} ﷼</Text></View>
        <View style={[styles.card, {borderColor:'#8B5CF6'}]}><Text style={styles.cardT}>حقوق الملكية</Text><Text style={[styles.cardV, {color:'#8B5CF6'}]}>{data.equity.toLocaleString()} ﷼</Text></View>
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
