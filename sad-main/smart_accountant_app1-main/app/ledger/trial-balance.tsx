import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function TrialBalanceScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync(`
      SELECT a.code, a.name_ar, a.type,
        COALESCE((SELECT SUM(jl.debit) FROM journal_lines jl WHERE jl.account_id = a.id), 0) as total_debit,
        COALESCE((SELECT SUM(jl.credit) FROM journal_lines jl WHERE jl.account_id = a.id), 0) as total_credit,
        a.current_balance, COALESCE(c.code, 'YER') as currency_code
      FROM accounts a LEFT JOIN currencies c ON c.id = a.currency_id
      WHERE a.is_leaf = 1 AND a.is_active = 1
        AND (EXISTS (SELECT 1 FROM journal_lines jl WHERE jl.account_id = a.id))
      ORDER BY a.code LIMIT 50
    `);
    const rows = result as any[];
    setData(rows);
    setTotals({ debit: rows.reduce((s: number, r: any) => s + (r.total_debit || 0), 0), credit: rows.reduce((s: number, r: any) => s + (r.total_credit || 0), 0) });
    setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;
  const difference = Math.abs(totals.debit - totals.credit);

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>⚖️ ميزان المراجعة</Text><TouchableOpacity onPress={loadData}><Text style={styles.refresh}>🔄</Text></TouchableOpacity></View>
      <View style={[styles.status, {backgroundColor: isBalanced ? '#10B98120' : '#EF444420'}]}><Text style={[styles.statusText, {color: isBalanced ? '#10B981' : '#EF4444'}]}>{isBalanced ? '✅ الميزان متوازن' : '❌ الميزان غير متوازن'}</Text>{!isBalanced && <Text style={styles.diffText}>الفرق: {difference.toLocaleString()} ﷼</Text>}</View>
      <FlatList data={data} keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={() => (<View style={styles.thRow}><Text style={[styles.th, {flex:1}]}>الكود</Text><Text style={[styles.th, {flex:2.5}]}>الاسم</Text><Text style={[styles.th, {flex:1.5, color:'#10B981'}]}>مدين</Text><Text style={[styles.th, {flex:1.5, color:'#EF4444'}]}>دائن</Text><Text style={[styles.th, {flex:1.5}]}>الرصيد</Text></View>)}
        renderItem={({ item }) => { const balance = item.current_balance || 0; return (<View style={styles.row}><Text style={[styles.td, {flex:1}]}>{item.code}</Text><Text style={[styles.td, {flex:2.5}]} numberOfLines={1}>{item.name_ar}</Text><Text style={[styles.td, {flex:1.5, color:'#10B981'}]}>{item.total_debit > 0 ? item.total_debit.toLocaleString() : '-'}</Text><Text style={[styles.td, {flex:1.5, color:'#EF4444'}]}>{item.total_credit > 0 ? item.total_credit.toLocaleString() : '-'}</Text><Text style={[styles.td, {flex:1.5, color: balance >= 0 ? '#10B981' : '#EF4444'}]}>{Math.abs(balance).toLocaleString()}</Text></View>); }}
        ListFooterComponent={() => (<View style={styles.footer}><Text style={[styles.fc, {flex:3.5}]}>الإجمالي</Text><Text style={[styles.fc, {flex:1.5, color:'#10B981'}]}>{totals.debit.toLocaleString()}</Text><Text style={[styles.fc, {flex:1.5, color:'#EF4444'}]}>{totals.credit.toLocaleString()}</Text><Text style={[styles.fc, {flex:1.5, color:'#D4AF37'}]}>{difference.toLocaleString()}</Text></View>)}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد حركات</Text>}
        contentContainerStyle={{padding:10}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},refresh:{fontSize:22,padding:8},
  status:{marginHorizontal:12,marginTop:10,padding:12,borderRadius:10,alignItems:'center'},
  statusText:{fontSize:15,fontWeight:'bold'},diffText:{color:'#EF4444',fontSize:12,marginTop:4},
  thRow:{flexDirection:'row',paddingVertical:10,paddingHorizontal:8,backgroundColor:'#16213E',borderRadius:8,marginBottom:4},
  th:{color:'#D4AF37',fontSize:10,fontWeight:'bold',textAlign:'center'},
  row:{flexDirection:'row',paddingVertical:10,paddingHorizontal:8,borderBottomWidth:0.5,borderBottomColor:'#2a3550'},
  td:{color:'#FFF',fontSize:10,textAlign:'center'},
  footer:{flexDirection:'row',paddingVertical:12,paddingHorizontal:8,backgroundColor:'#D4AF3710',borderRadius:8,marginTop:8},
  fc:{fontSize:12,fontWeight:'bold',textAlign:'center',color:'#D4AF37'},
  empty:{color:'#64748B',textAlign:'center',marginTop:30},
});
