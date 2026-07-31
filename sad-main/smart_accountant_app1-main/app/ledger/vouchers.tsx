import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import AccountPicker from '../../src/components/ui/AccountPicker';
import { Colors, Spacing, FontSizes } from '../../src/theme/colors';

export default function VouchersScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name_ar: '', debit_account_id: '', credit_account_id: '', default_amount: '' });
  const [showDebitPicker, setShowDebitPicker] = useState(false);
  const [showCreditPicker, setShowCreditPicker] = useState(false);
  const [debitAcc, setDebitAcc] = useState<any>(null);
  const [creditAcc, setCreditAcc] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    // تخزين القوالب في settings
    const result = await db.getAllAsync("SELECT * FROM settings WHERE \"group\"='voucher'");
    setVouchers(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveVoucher = async () => {
    if (!form.name_ar.trim() || !debitAcc || !creditAcc || !db) { Alert.alert('خطأ', 'أكمل البيانات'); return; }
    const key = 'voucher_' + Date.now();
    const value = JSON.stringify({ name: form.name_ar, debit: debitAcc.id, credit: creditAcc.id, amount: form.default_amount });
    await db.runAsync('INSERT INTO settings (key, value, "group") VALUES (?,?,?)', [key, value, 'voucher']);
    setShowForm(false); setForm({ name_ar: '', debit_account_id: '', credit_account_id: '', default_amount: '' }); setDebitAcc(null); setCreditAcc(null);
    loadData(); Alert.alert('✅', 'تم حفظ القالب');
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📋 قوالب القيود</Text><TouchableOpacity onPress={() => setShowForm(true)} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity></View>
      <FlatList data={vouchers} keyExtractor={i => i.key}
        renderItem={({ item }) => {
          const data = JSON.parse(item.value || '{}');
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{data.name}</Text>
              <Text style={styles.details}>مدين: {data.debit} | دائن: {data.credit} | مبلغ: {data.amount}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد قوالب</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>➕ قالب قيد سريع</Text>
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="اسم القالب" placeholderTextColor="#666" textAlign="right" />
          <TouchableOpacity style={styles.picker} onPress={() => setShowDebitPicker(true)}><Text style={debitAcc ? styles.pv : styles.pp}>{debitAcc ? debitAcc.code + ' - ' + debitAcc.name_ar : 'الحساب المدين'}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.picker} onPress={() => setShowCreditPicker(true)}><Text style={creditAcc ? styles.pv : styles.pp}>{creditAcc ? creditAcc.code + ' - ' + creditAcc.name_ar : 'الحساب الدائن'}</Text></TouchableOpacity>
          <TextInput style={styles.inp} value={form.default_amount} onChangeText={v => setForm({...form, default_amount: v})} placeholder="المبلغ الافتراضي" placeholderTextColor="#666" keyboardType="numeric" />
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveVoucher}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
      <AccountPicker visible={showDebitPicker} onSelect={(acc) => { setDebitAcc(acc); setShowDebitPicker(false); }} onClose={() => setShowDebitPicker(false)} />
      <AccountPicker visible={showCreditPicker} onSelect={(acc) => { setCreditAcc(acc); setShowCreditPicker(false); }} onClose={() => setShowCreditPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:Colors.background},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:Colors.surface,borderBottomWidth:1,borderBottomColor:Colors.border},
  back:{fontSize:24,color:Colors.primary},t:{fontSize:18,fontWeight:'bold',color:Colors.primary},
  add:{backgroundColor:Colors.primary,width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},addT:{color:'#000',fontSize:22},
  list:{padding:16},
  card:{backgroundColor:Colors.card,padding:14,borderRadius:10,marginBottom:6},
  name:{fontSize:16,color:Colors.text},details:{color:Colors.textSecondary,fontSize:12},
  empty:{color:Colors.textMuted,textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.8)'},
  modalC:{backgroundColor:Colors.surface,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalT:{color:Colors.primary,fontSize:18,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  inp:{backgroundColor:Colors.card,borderRadius:8,padding:12,fontSize:14,color:Colors.text,borderWidth:1,borderColor:Colors.border,marginBottom:10,textAlign:'right'},
  picker:{backgroundColor:Colors.card,borderRadius:8,padding:12,borderWidth:1,borderColor:Colors.border,marginBottom:10},
  pv:{color:Colors.text,fontSize:14},pp:{color:Colors.textMuted,fontSize:14},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:Colors.border,alignItems:'center'},cancelT:{color:Colors.textSecondary},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:Colors.primary,alignItems:'center'},saveT:{color:'#000',fontWeight:'bold'},
});
