import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';

export default function AccountCurrenciesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accountId, accountName } = useLocalSearchParams();
  const { db, isReady } = useDatabase();
  const [balances, setBalances] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [form, setForm] = useState({ currency_code: 'YER', amount: '', rate: '1' });
  const [convertForm, setConvertForm] = useState({ from: '', to: '', amount: '' });

  useEffect(() => {
    if (isReady && db) loadData();
  }, [isReady, db]);

  const loadData = async () => {
    if (!db) return;
    const b = await db.getAllAsync("SELECT ab.*, c.symbol FROM account_balances ab JOIN currencies c ON c.code = ab.currency_code WHERE ab.account_id = ?", [accountId]);
    const c = await db.getAllAsync("SELECT code, name_ar, symbol, COALESCE((SELECT rate FROM exchange_rates WHERE currency_id = currencies.id ORDER BY date DESC LIMIT 1),1) as rate FROM currencies WHERE is_active=1");
    setBalances(b as any[]);
    setCurrencies(c as any[]);
    setLoading(false);
  };

  const addBalance = async () => {
    if (!form.amount || !db) return;
    const rate = parseFloat(form.rate) || 1;
    const baseAmount = parseFloat(form.amount) * rate;
    await db.runAsync('INSERT INTO account_balances (account_id, currency_code, balance) VALUES (?,?,?) ON CONFLICT(account_id, currency_code) DO UPDATE SET balance = balance + ?', [accountId, form.currency_code, parseFloat(form.amount), parseFloat(form.amount)]);
    // تحديث رصيد الحساب الرئيسي بالريال
    await db.runAsync('UPDATE accounts SET current_balance = COALESCE(current_balance,0) + ? WHERE id = ?', [baseAmount, accountId]);
    setShowAdd(false);
    setForm({ currency_code: 'YER', amount: '', rate: '1' });
    loadData();
  };

  const convertBalance = async () => {
    if (!convertForm.amount || !convertForm.from || !convertForm.to || !db) return;
    const fromRate = currencies.find(c => c.code === convertForm.from)?.rate || 1;
    const toRate = currencies.find(c => c.code === convertForm.to)?.rate || 1;
    const amount = parseFloat(convertForm.amount);
    const convertedAmount = amount * (fromRate / toRate);
    
    await db.runAsync('UPDATE account_balances SET balance = balance - ? WHERE account_id = ? AND currency_code = ?', [amount, accountId, convertForm.from]);
    await db.runAsync('INSERT INTO account_balances (account_id, currency_code, balance) VALUES (?,?,?) ON CONFLICT(account_id, currency_code) DO UPDATE SET balance = balance + ?', [accountId, convertForm.to, convertedAmount, convertedAmount]);
    setShowConvert(false);
    setConvertForm({ from: '', to: '', amount: '' });
    loadData();
    Alert.alert('✅', `تم تحويل ${amount} ${convertForm.from} إلى ${convertedAmount.toFixed(2)} ${convertForm.to}`);
  };

  const deleteBalance = (id: number, currency: string, amount: number) => {
    Alert.alert('حذف', `حذف رصيد ${currency}؟`, [
      { text: 'إلغاء' },
      { text: 'حذف', onPress: async () => {
        const rate = currencies.find(c => c.code === currency)?.rate || 1;
        await db.runAsync('DELETE FROM account_balances WHERE id = ?', [id]);
        await db.runAsync('UPDATE accounts SET current_balance = COALESCE(current_balance,0) - ? WHERE id = ?', [amount * rate, accountId]);
        loadData();
      }}
    ]);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.t}>💱 أرصدة {accountName}</Text>
        <View style={{width:40}} />
      </View>

      <FlatList
        data={balances}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.currency}>{item.currency_code} {item.symbol}</Text>
            <Text style={styles.balance}>{item.balance?.toLocaleString()}</Text>
            <TouchableOpacity onPress={() => deleteBalance(item.id, item.currency_code, item.balance)}>
              <Text style={styles.delete}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد أرصدة</Text>}
        contentContainerStyle={{padding:14}}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={() => setShowAdd(true)}><Text style={styles.btnT}>➕ إضافة رصيد</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, {backgroundColor:'#8B5CF6'}]} onPress={() => setShowConvert(true)}><Text style={styles.btnT}>🔄 عكس عملات</Text></TouchableOpacity>
      </View>

      {/* Modal إضافة رصيد */}
      {showAdd && (
        <View style={styles.modal}>
          <View style={styles.modalC}>
            <Text style={styles.modalT}>➕ إضافة رصيد بعملة</Text>
            <PickerModal visible={true} title="اختر العملة" data={currencies} displayField="code" showBalance={false} onSelect={(item:any) => setForm({...form, currency_code: item.code})} onClose={()=>{}} />
            <TextInput style={styles.inp} value={form.amount} onChangeText={v => setForm({...form, amount: v})} placeholder="المبلغ" placeholderTextColor="#666" keyboardType="numeric" textAlign="center" />
            <TextInput style={styles.inp} value={form.rate} onChangeText={v => setForm({...form, rate: v})} placeholder="سعر الصرف" placeholderTextColor="#666" keyboardType="numeric" textAlign="center" />
            <View style={styles.btns}>
              <TouchableOpacity style={styles.cancel} onPress={() => setShowAdd(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity>
              <TouchableOpacity style={styles.save} onPress={addBalance}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal عكس عملات */}
      {showConvert && (
        <View style={styles.modal}>
          <View style={styles.modalC}>
            <Text style={styles.modalT}>🔄 عكس عملات</Text>
            <PickerModal visible={true} title="من عملة" data={currencies} displayField="code" showBalance={false} onSelect={(item:any) => setConvertForm({...convertForm, from: item.code})} onClose={()=>{}} />
            <PickerModal visible={true} title="إلى عملة" data={currencies} displayField="code" showBalance={false} onSelect={(item:any) => setConvertForm({...convertForm, to: item.code})} onClose={()=>{}} />
            <TextInput style={styles.inp} value={convertForm.amount} onChangeText={v => setConvertForm({...convertForm, amount: v})} placeholder="المبلغ" placeholderTextColor="#666" keyboardType="numeric" textAlign="center" />
            <View style={styles.btns}>
              <TouchableOpacity style={styles.cancel} onPress={() => setShowConvert(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity>
              <TouchableOpacity style={styles.save} onPress={convertBalance}><Text style={styles.saveT}>🔄 تحويل</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213E',padding:14,borderRadius:10,marginBottom:8},
  currency:{color:'#D4AF37',fontSize:16,fontWeight:'bold',flex:1},balance:{color:'#FFF',fontSize:16,marginRight:12},delete:{fontSize:18},
  empty:{color:'#64748B',textAlign:'center',marginTop:40},
  actions:{flexDirection:'row',gap:10,padding:14},
  btn:{flex:1,padding:14,borderRadius:10,backgroundColor:'#10B981',alignItems:'center'},
  btnT:{color:'#FFF',fontWeight:'bold'},
  modal:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.8)',justifyContent:'center',padding:20},
  modalC:{backgroundColor:'#0E1630',borderRadius:16,padding:20},
  modalT:{color:'#D4AF37',fontSize:18,fontWeight:'bold',textAlign:'center',marginBottom:16},
  inp:{backgroundColor:'#16213E',borderRadius:8,padding:12,color:'#FFF',fontSize:16,marginBottom:10,textAlign:'center'},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:'#2a3550',alignItems:'center'},cancelT:{color:'#94A3B8'},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:'#D4AF37',alignItems:'center'},saveT:{color:'#0A1128',fontWeight:'bold'},
});
