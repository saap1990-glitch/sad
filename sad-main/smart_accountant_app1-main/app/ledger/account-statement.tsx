import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import AccountPicker from '../../src/components/ui/AccountPicker';
import { Colors, Spacing, FontSizes } from '../../src/theme/colors';

export default function AccountStatementScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadStatement = useCallback(async () => {
    if (!db || !selectedAccount) return;
    setLoading(true);
    let query = `
      SELECT jl.*, je.date, je.description as entry_desc, je.entry_number
      FROM journal_lines jl
      JOIN journal_entries je ON je.id = jl.entry_id
      WHERE jl.account_id = ?
    `;
    const params: any[] = [selectedAccount.id];
    if (dateFrom) { query += ' AND je.date >= ?'; params.push(dateFrom); }
    if (dateTo) { query += ' AND je.date <= ?'; params.push(dateTo); }
    query += ' ORDER BY je.date DESC, je.id DESC LIMIT 100';
    const result = await db.getAllAsync(query, params);
    setTransactions(result as any[]);
    setLoading(false);
  }, [db, selectedAccount, dateFrom, dateTo]);

  useFocusEffect(useCallback(() => { if (selectedAccount) loadStatement(); }, [selectedAccount, dateFrom, dateTo]));

  let runningBalance = 0;

  if (!isReady) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📋 كشف حساب</Text><View style={{width:40}}/></View>
      <TouchableOpacity style={styles.picker} onPress={() => setShowAccountPicker(true)}>
        <Text style={selectedAccount ? styles.pv : styles.pp}>{selectedAccount ? `${selectedAccount.code} - ${selectedAccount.name_ar}` : 'اختر الحساب'}</Text>
      </TouchableOpacity>
      {selectedAccount && (
        <>
          <View style={styles.dateRow}>
            <TextInput style={styles.dateInp} value={dateFrom} onChangeText={setDateFrom} placeholder="من تاريخ" placeholderTextColor="#666" />
            <TextInput style={styles.dateInp} value={dateTo} onChangeText={setDateTo} placeholder="إلى تاريخ" placeholderTextColor="#666" />
          </View>
          <ScrollView horizontal>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, {width:80}]}>التاريخ</Text>
                <Text style={[styles.th, {width:100}]}>الرقم</Text>
                <Text style={[styles.th, {width:150}]}>البيان</Text>
                <Text style={[styles.th, {width:80}]}>مدين</Text>
                <Text style={[styles.th, {width:80}]}>دائن</Text>
                <Text style={[styles.th, {width:80}]}>الرصيد</Text>
              </View>
              <FlatList
                data={transactions}
                keyExtractor={(_,i) => i.toString()}
                renderItem={({ item }) => {
                  runningBalance += (item.debit || 0) - (item.credit || 0);
                  return (
                    <View style={styles.tableRow}>
                      <Text style={[styles.td, {width:80}]}>{item.date}</Text>
                      <Text style={[styles.td, {width:100}]}>{item.entry_number}</Text>
                      <Text style={[styles.td, {width:150}]}>{item.description || item.entry_desc}</Text>
                      <Text style={[styles.td, {width:80, color: Colors.success}]}>{(item.debit||0).toLocaleString()}</Text>
                      <Text style={[styles.td, {width:80, color: Colors.credit}]}>{(item.credit||0).toLocaleString()}</Text>
                      <Text style={[styles.td, {width:80}]}>{runningBalance.toLocaleString()}</Text>
                    </View>
                  );
                }}
                ListEmptyComponent={<Text style={styles.empty}>لا توجد حركات</Text>}
              />
            </View>
          </ScrollView>
        </>
      )}
      <AccountPicker visible={showAccountPicker} onSelect={(acc) => { setSelectedAccount(acc); setShowAccountPicker(false); }} onClose={() => setShowAccountPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:Colors.background},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:Colors.surface,borderBottomWidth:1,borderBottomColor:Colors.border},
  back:{fontSize:24,color:Colors.primary},t:{fontSize:18,fontWeight:'bold',color:Colors.primary},
  picker:{backgroundColor:Colors.card,margin:12,padding:14,borderRadius:10,borderWidth:1,borderColor:Colors.border},
  pv:{color:Colors.text,fontSize:14},pp:{color:Colors.textMuted,fontSize:14},
  dateRow:{flexDirection:'row',gap:8,paddingHorizontal:12},
  dateInp:{flex:1,backgroundColor:Colors.card,borderRadius:8,padding:10,color:Colors.text,borderWidth:1,borderColor:Colors.border,textAlign:'center',fontSize:12},
  tableHeader:{flexDirection:'row',backgroundColor:Colors.surface,paddingVertical:8,marginTop:8},
  th:{color:Colors.primary,fontSize:11,fontWeight:'bold',textAlign:'center'},
  tableRow:{flexDirection:'row',paddingVertical:6,borderBottomWidth:0.5,borderBottomColor:Colors.border},
  td:{color:Colors.text,fontSize:10,textAlign:'center'},
  empty:{color:Colors.textMuted,textAlign:'center',marginTop:30},
});
