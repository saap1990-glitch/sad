import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { Colors, Spacing, FontSizes } from '../../src/theme/colors';

export default function TrialBalanceScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync(`
      SELECT code, name_ar,
        COALESCE(SUM(jl.debit),0) as total_debit,
        COALESCE(SUM(jl.credit),0) as total_credit,
        current_balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON jl.account_id = a.id
      WHERE a.is_active=1 AND a.is_leaf=1
      GROUP BY a.id
      ORDER BY a.code
    `);
    setAccounts(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const totalDebit = accounts.reduce((s, a) => s + (a.total_debit || 0), 0);
  const totalCredit = accounts.reduce((s, a) => s + (a.total_credit || 0), 0);

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>⚖️ ميزان المراجعة</Text><View style={{width:40}}/></View>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, {width:60}]}>الكود</Text>
            <Text style={[styles.th, {width:150}]}>الاسم</Text>
            <Text style={[styles.th, {width:90}]}>مدين</Text>
            <Text style={[styles.th, {width:90}]}>دائن</Text>
            <Text style={[styles.th, {width:90}]}>الرصيد</Text>
          </View>
          <FlatList
            data={accounts}
            keyExtractor={(_,i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.td, {width:60}]}>{item.code}</Text>
                <Text style={[styles.td, {width:150}]}>{item.name_ar}</Text>
                <Text style={[styles.td, {width:90, color: Colors.success}]}>{(item.total_debit||0).toLocaleString()}</Text>
                <Text style={[styles.td, {width:90, color: Colors.credit}]}>{(item.total_credit||0).toLocaleString()}</Text>
                <Text style={[styles.td, {width:90}]}>{(item.current_balance||0).toLocaleString()}</Text>
              </View>
            )}
          />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, {width:210}]}>الإجمالي</Text>
            <Text style={[styles.totalLabel, {width:90, color: Colors.success}]}>{totalDebit.toLocaleString()}</Text>
            <Text style={[styles.totalLabel, {width:90, color: Colors.credit}]}>{totalCredit.toLocaleString()}</Text>
            <Text style={[styles.totalLabel, {width:90}]}>{(totalDebit - totalCredit).toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:Colors.background},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:Colors.surface,borderBottomWidth:1,borderBottomColor:Colors.border},
  back:{fontSize:24,color:Colors.primary},t:{fontSize:18,fontWeight:'bold',color:Colors.primary},
  tableHeader:{flexDirection:'row',backgroundColor:Colors.surface,paddingVertical:10,marginTop:8},
  th:{color:Colors.primary,fontSize:12,fontWeight:'bold',textAlign:'center'},
  tableRow:{flexDirection:'row',paddingVertical:6,borderBottomWidth:0.5,borderBottomColor:Colors.border},
  td:{color:Colors.text,fontSize:11,textAlign:'center'},
  totalRow:{flexDirection:'row',paddingVertical:10,backgroundColor:Colors.surface,marginTop:4},
  totalLabel:{color:Colors.primary,fontSize:12,fontWeight:'bold',textAlign:'center'},
});
