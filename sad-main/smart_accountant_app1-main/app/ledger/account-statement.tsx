import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function AccountStatementScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('YER');
  const [rate, setRate] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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
    setCurrency(cur?.code || 'YER');
    setRate(cur?.rate || 1);

    let query = `SELECT je.date, je.entry_number, je.description, je.source_type, jl.debit, jl.credit, jl.foreign_amount, jl.foreign_currency
      FROM journal_lines jl JOIN journal_entries je ON je.id = jl.entry_id
      WHERE jl.account_id = ? AND je.is_posted = 1`;
    const params: any[] = [acc.id];
    if (fromDate) { query += ' AND je.date >= ?'; params.push(fromDate); }
    if (toDate) { query += ' AND je.date <= ?'; params.push(toDate); }
    query += ' ORDER BY je.date, je.id';

    const txns = await db.getAllAsync(query, params);
    let runningBal = acc.opening_balance || 0;
    const rows = (txns as any[]).map((row: any) => {
      runningBal += (row.debit || 0) - (row.credit || 0);
      return { ...row, balance: runningBal };
    });
    setTransactions(rows);
    setBalance(runningBal);
    setLoading(false);
  };

  if (!isReady) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>📋 كشف حساب</Text>
        <View style={{width:40}}/>
      </View>
      <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(true)}>
        <Text style={selected ? styles.pickerValue : styles.pickerPlaceholder}>
          {selected ? `${selected.code} - ${selected.name_ar}` : 'اختر الحساب'}
        </Text>
      </TouchableOpacity>

      {selected && (
        <>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>الرصيد النهائي</Text>
            <Text style={[styles.balanceValue, { color: balance >= 0 ? '#10B981' : '#EF4444' }]}>{Math.abs(balance).toLocaleString()} {currency}</Text>
            {currency !== 'YER' && <Text style={styles.baseBalance}>≈ {(balance * rate).toLocaleString()} ﷼</Text>}
          </View>

          <View style={styles.dateRow}>
            <TextInput style={styles.dateInput} placeholder="من تاريخ" value={fromDate} onChangeText={setFromDate} placeholderTextColor="#666" />
            <TextInput style={styles.dateInput} placeholder="إلى تاريخ" value={toDate} onChangeText={setToDate} placeholderTextColor="#666" />
            <TouchableOpacity style={styles.filterBtn} onPress={() => selectAccount(selected)}><Text style={{color:'#FFF'}}>تصفية</Text></TouchableOpacity>
          </View>

          {loading ? <ActivityIndicator/> : (
            <FlatList
              data={transactions}
              keyExtractor={(_, i) => i.toString()}
              ListHeaderComponent={() => (
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, {flex:1}]}>التاريخ</Text>
                  <Text style={[styles.th, {flex:1.5}]}>النوع</Text>
                  <Text style={[styles.th, {flex:1}]}>مدين</Text>
                  <Text style={[styles.th, {flex:1}]}>دائن</Text>
                  <Text style={[styles.th, {flex:1}]}>الرصيد</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.td, {flex:1}]}>{item.date}</Text>
                  <Text style={[styles.td, {flex:1.5}]}>{item.source_type}</Text>
                  <Text style={[styles.td, {flex:1}]}>{item.foreign_amount ? `${item.foreign_amount} ${item.foreign_currency}` : item.debit.toLocaleString()}</Text>
                  <Text style={[styles.td, {flex:1}]}>{item.credit > 0 ? item.credit.toLocaleString() : ''}</Text>
                  <Text style={[styles.td, {flex:1}]}>{Math.abs(item.balance).toLocaleString()}</Text>
                </View>
              )}
            />
          )}
        </>
      )}
      <PickerModal visible={showPicker} title="اختر الحساب" data={accounts} onSelect={selectAccount} onClose={() => setShowPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A1128'},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  backBtn:{fontSize:22,color:'#D4AF37'},
  headerTitle:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  picker:{flexDirection:'row',justifyContent:'space-between',margin:12,backgroundColor:'#16213E',padding:14,borderRadius:10,borderWidth:1,borderColor:'#2a3550'},
  pickerValue:{color:'#FFF',fontSize:14},
  pickerPlaceholder:{color:'#64748B',fontSize:14},
  balanceCard:{marginHorizontal:12,padding:16,backgroundColor:'#16213E',borderRadius:12,alignItems:'center',borderWidth:1,borderColor:'#D4AF3740',marginBottom:8},
  balanceLabel:{color:'#94A3B8',fontSize:12},
  balanceValue:{fontSize:24,fontWeight:'bold',marginTop:4},
  baseBalance:{color:'#D4AF37',fontSize:12,marginTop:4},
  dateRow:{flexDirection:'row',gap:8,paddingHorizontal:12,marginBottom:8},
  dateInput:{flex:1,backgroundColor:'#16213E',borderRadius:8,padding:8,color:'#FFF',fontSize:12,textAlign:'center'},
  filterBtn:{backgroundColor:'#D4AF37',borderRadius:8,paddingHorizontal:16,justifyContent:'center'},
  tableHeader:{flexDirection:'row',paddingVertical:10,paddingHorizontal:6,backgroundColor:'#16213E',marginHorizontal:4,borderRadius:8,marginTop:8},
  th:{color:'#D4AF37',fontSize:10,fontWeight:'bold',textAlign:'center'},
  tableRow:{flexDirection:'row',paddingVertical:8,paddingHorizontal:6,borderBottomWidth:0.5,borderBottomColor:'#2a3550',marginHorizontal:4},
  td:{color:'#FFF',fontSize:10,textAlign:'center'},
});
