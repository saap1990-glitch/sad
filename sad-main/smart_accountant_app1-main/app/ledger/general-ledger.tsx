import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function GeneralLedgerScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [runningBalance, setRunningBalance] = useState(0);
  const [currency, setCurrency] = useState('YER');
  const [exchangeRate, setExchangeRate] = useState(1);

  const loadAccounts = useCallback(async () => {
    if (!db) return;
    const r = await db.getAllAsync("SELECT * FROM accounts WHERE is_leaf=1 AND is_active=1 ORDER BY code LIMIT 100");
    setAccounts(r as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadAccounts(); }, [loadAccounts]));

  const selectAccount = async (acc: any) => {
    if (!db) return;
    setSelected(acc); setShowPicker(false); setLoading(true);
    const cur = await db.getFirstAsync("SELECT c.code, COALESCE(er.rate,1) as rate FROM currencies c LEFT JOIN exchange_rates er ON er.currency_id=c.id AND er.date=(SELECT MAX(date) FROM exchange_rates WHERE currency_id=c.id) WHERE c.id=?", [acc.currency_id]) as any;
    setCurrency(cur?.code || 'YER'); setExchangeRate(cur?.rate || 1);

    const result = await db.getAllAsync(`SELECT je.date, je.entry_number, je.description, jl.debit, jl.credit, jl.foreign_amount, jl.foreign_currency FROM journal_lines jl JOIN journal_entries je ON je.id = jl.entry_id WHERE jl.account_id = ? AND je.is_posted = 1 ORDER BY je.date, je.id LIMIT 100`, [acc.id]);

    let bal = acc.opening_balance || 0;
    const rows = (result as any[]).map((row: any) => {
      bal += (row.debit || 0) - (row.credit || 0);
      return { ...row, balance: bal, base_balance: bal * (cur?.rate || 1) };
    });
    setEntries(rows); setRunningBalance(bal); setLoading(false);
  };

  if (!isReady) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📖 الأستاذ العام</Text><View style={{width:40}}/></View>
      <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(true)}><Text style={selected ? styles.pv : styles.pp}>{selected ? `${selected.code} - ${selected.name_ar}` : 'اختر الحساب'}</Text><Text>▼</Text></TouchableOpacity>
      {selected && (
        <>
          <View style={styles.balanceCard}><View style={styles.balanceRow}><View><Text style={styles.bl}>الرصيد التراكمي</Text><Text style={[styles.bv, {color: runningBalance >= 0 ? '#10B981' : '#EF4444'}]}>{Math.abs(runningBalance).toLocaleString()} {currency}</Text></View><View style={{alignItems:'flex-end'}}><Text style={styles.bl}>الرصيد الافتتاحي</Text><Text style={styles.bvs}>{(selected.opening_balance || 0).toLocaleString()} {currency}</Text></View></View>{currency !== 'YER' && <Text style={styles.baseBal}>≈ {Math.abs(runningBalance * exchangeRate).toLocaleString()} ﷼</Text>}</View>
          {loading ? <ActivityIndicator size="large" color="#D4AF37" style={{marginTop:20}} /> : (
            <FlatList data={entries} keyExtractor={(_, i) => i.toString()}
              ListHeaderComponent={() => (<View style={styles.thRow}><Text style={[styles.th, {flex:1.2}]}>التاريخ</Text><Text style={[styles.th, {flex:1.8}]}>البيان</Text><Text style={[styles.th, {flex:1, color:'#10B981'}]}>مدين</Text><Text style={[styles.th, {flex:1, color:'#EF4444'}]}>دائن</Text><Text style={[styles.th, {flex:1.3}]}>الرصيد</Text></View>)}
              renderItem={({ item }) => (<View style={styles.row}><Text style={[styles.cell, {flex:1.2}]}>{item.date}</Text><Text style={[styles.cell, {flex:1.8}]} numberOfLines={1}>{item.description || item.entry_number}</Text><Text style={[styles.cell, {flex:1, color:'#10B981'}]}>{item.foreign_amount ? `${item.foreign_amount} ${item.foreign_currency}` : (item.debit > 0 ? item.debit.toLocaleString() : '')}</Text><Text style={[styles.cell, {flex:1, color:'#EF4444'}]}>{item.credit > 0 ? item.credit.toLocaleString() : ''}</Text><Text style={[styles.cell, {flex:1.3, color: item.balance >= 0 ? '#10B981' : '#EF4444'}]}>{Math.abs(item.balance).toLocaleString()}</Text></View>)}
              ListFooterComponent={() => (<View style={styles.footer}><Text style={styles.footerText}>عدد الحركات: {entries.length} | آخر رصيد: {Math.abs(runningBalance).toLocaleString()} {currency}</Text></View>)}
              ListEmptyComponent={<Text style={styles.empty}>لا توجد حركات</Text>}
              contentContainerStyle={{padding:10}}
            />
          )}
        </>
      )}
      <PickerModal visible={showPicker} title="اختر الحساب" data={accounts} onSelect={(item) => { selectAccount(item); }} onClose={() => setShowPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  picker:{flexDirection:'row',justifyContent:'space-between',margin:12,backgroundColor:'#16213E',padding:14,borderRadius:10,borderWidth:1,borderColor:'#2a3550'},
  pv:{color:'#FFF',fontSize:14},pp:{color:'#64748B',fontSize:14},
  balanceCard:{marginHorizontal:12,padding:16,backgroundColor:'#16213E',borderRadius:12,borderWidth:1,borderColor:'#D4AF3740',marginBottom:8},
  balanceRow:{flexDirection:'row',justifyContent:'space-between'},
  bl:{color:'#94A3B8',fontSize:11},bv:{fontSize:24,fontWeight:'bold',marginTop:2},bvs:{fontSize:16,fontWeight:'bold',color:'#94A3B8',marginTop:2},
  baseBal:{color:'#D4AF37',fontSize:13,marginTop:6,textAlign:'center'},
  thRow:{flexDirection:'row',paddingVertical:10,paddingHorizontal:6,backgroundColor:'#16213E',marginHorizontal:4,borderRadius:8,marginTop:8},
  th:{color:'#D4AF37',fontSize:10,fontWeight:'bold',textAlign:'center'},
  row:{flexDirection:'row',paddingVertical:8,paddingHorizontal:6,borderBottomWidth:0.5,borderBottomColor:'#2a3550',marginHorizontal:4},
  cell:{color:'#FFF',fontSize:10,textAlign:'center'},
  footer:{paddingVertical:12,alignItems:'center'},
  footerText:{color:'#64748B',fontSize:11},
  empty:{color:'#64748B',textAlign:'center',marginTop:30},
});
