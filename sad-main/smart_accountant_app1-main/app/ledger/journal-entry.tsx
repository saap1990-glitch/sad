import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

export default function JournalEntryScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'debit'|'credit'>('debit');
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<any>({ code: 'YER', current_rate: 1 });
  const [exchangeRate, setExchangeRate] = useState('1');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!db) return;
    const [acc, cur] = await Promise.all([
      db.getAllAsync('SELECT * FROM accounts WHERE is_leaf=1 AND is_active=1 ORDER BY code LIMIT 100'),
      db.getAllAsync("SELECT c.*, COALESCE(er.rate,1) as current_rate FROM currencies c LEFT JOIN exchange_rates er ON er.currency_id=c.id AND er.date=(SELECT MAX(date) FROM exchange_rates WHERE currency_id=c.id) WHERE c.is_active=1"),
    ]);
    setAccounts(acc as any[]); setCurrencies(cur as any[]);
    const yer = (cur as any[]).find((c: any) => c.code === 'YER');
    setSelectedCurrency(yer || { code: 'YER', current_rate: 1 });
    setExchangeRate(yer ? String(yer.current_rate || 1) : '1');
    setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadAccounts(); }, [loadAccounts]));

  const addLine = (account: any) => {
    setLines([...lines, { id: Date.now(), account_id: account.id, code: account.code, name: account.name_ar, side: selectedSide, amount: 0 }]);
    setShowPicker(false);
  };
  const updateLine = (id: number, amount: string) => {
    setLines(lines.map(l => l.id === id ? { ...l, amount: parseFloat(amount) || 0 } : l));
  };
  const removeLine = (id: number) => setLines(lines.filter(l => l.id !== id));

  const totalDebit = lines.filter(l => l.side === 'debit').reduce((s, l) => s + l.amount, 0);
  const totalCredit = lines.filter(l => l.side === 'credit').reduce((s, l) => s + l.amount, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const rate = parseFloat(exchangeRate) || 1;

  const saveEntry = async () => {
    if (!description.trim()) { Alert.alert('خطأ', 'أدخل البيان'); return; }
    if (lines.length === 0) { Alert.alert('خطأ', 'أضف سطراً'); return; }
    if (!isBalanced) { Alert.alert('خطأ', `غير متوازن`); return; }
    if (!db) return;
    setLoading(true);
    try {
      const entryNum = `JV-${date.replace(/-/g,'')}-${String(Date.now()%10000).padStart(4,'0')}`;
      // تحويل الأسطر إلى FinancialLines
      const transactionLines = lines.map(l => ({
        account_id: l.account_id,
        debit_original: l.side === 'debit' ? l.amount : 0,
        credit_original: l.side === 'credit' ? l.amount : 0,
        description: `${l.amount.toLocaleString()} ${selectedCurrency.code}`
      }));

      await financialEngine.executeTransaction(db, {
        date,
        description,
        reference: entryNum,
        source_type: 'journal_entry',
        currency_code: selectedCurrency.code,
        exchange_rate: rate,
        lines: transactionLines
      });

      Alert.alert('✅', `تم حفظ القيد ${entryNum}`);
      setLines([]); setDescription(''); loadAccounts();
    } catch(e: any) { Alert.alert('خطأ', e.message || 'فشل الحفظ'); }
    setLoading(false);
  };

  if (!isReady||loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c,{paddingTop:insets.top}]}>
      <View style={styles.h}><TouchableOpacity onPress={()=>router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📝 قيد يومية</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>التاريخ</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#666" textAlign="center"/>
        <Text style={styles.label}>البيان</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="بيان القيد" placeholderTextColor="#666" textAlign="right"/>
        <Text style={styles.label}>💱 العملة وسعر الصرف</Text>
        <View style={styles.currencyRow}>
          <TouchableOpacity style={[styles.curBtn, {flex:1}]} onPress={()=>setShowCurrencyPicker(true)}><Text style={styles.curBtnT}>{selectedCurrency.code} ▼</Text></TouchableOpacity>
          <TextInput style={[styles.rateInput, {flex:2}]} value={exchangeRate} onChangeText={setExchangeRate} keyboardType="numeric" placeholder="سعر الصرف" placeholderTextColor="#666" textAlign="center"/>
        </View>
        <View style={styles.addRow}>
          <TouchableOpacity style={[styles.addBtn,{borderColor:'#10B981'}]} onPress={()=>{setSelectedSide('debit');setShowPicker(true);}}><Text style={[styles.addBtnT,{color:'#10B981'}]}>➕ مدين</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn,{borderColor:'#EF4444'}]} onPress={()=>{setSelectedSide('credit');setShowPicker(true);}}><Text style={[styles.addBtnT,{color:'#EF4444'}]}>➕ دائن</Text></TouchableOpacity>
        </View>
        {lines.map(line=>(
          <View key={line.id} style={styles.lineCard}>
            <View style={styles.lineH}><Text style={[styles.lineS,{color:line.side==='debit'?'#10B981':'#EF4444'}]}>{line.side==='debit'?'مدين':'دائن'}</Text><Text style={styles.lineC}>{line.code}</Text><Text style={styles.lineN}>{line.name}</Text><TouchableOpacity onPress={()=>removeLine(line.id)}><Text style={{fontSize:18}}>🗑️</Text></TouchableOpacity></View>
            <TextInput style={styles.amountInp} value={line.amount>0?line.amount.toString():''} onChangeText={v=>updateLine(line.id,v)} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" textAlign="center"/>
            {line.amount>0 && <Text style={styles.baseAmount}>= {(line.amount*rate).toLocaleString()} ﷼</Text>}
          </View>
        ))}
        <View style={styles.totals}>
          <View style={styles.totalRow}><Text style={{color:'#10B981'}}>مدين</Text><Text style={{color:'#10B981',fontWeight:'bold'}}>{totalDebit.toLocaleString()} {selectedCurrency.code} = {(totalDebit*rate).toLocaleString()} ﷼</Text></View>
          <View style={styles.totalRow}><Text style={{color:'#EF4444'}}>دائن</Text><Text style={{color:'#EF4444',fontWeight:'bold'}}>{totalCredit.toLocaleString()} {selectedCurrency.code} = {(totalCredit*rate).toLocaleString()} ﷼</Text></View>
          <View style={[styles.totalRow,{borderTopWidth:1,borderTopColor:'#2a3550',paddingTop:8}]}><Text>الفرق</Text><Text style={{color:isBalanced?'#10B981':'#EF4444',fontWeight:'bold'}}>{Math.abs(totalDebit-totalCredit).toLocaleString()} {selectedCurrency.code}</Text></View>
        </View>
        <TouchableOpacity style={[styles.saveBtn,!isBalanced&&{opacity:0.5}]} onPress={saveEntry} disabled={!isBalanced}><Text style={styles.saveBtnT}>💾 حفظ القيد</Text></TouchableOpacity>
        <View style={{height:30}}/>
      </ScrollView>
      <PickerModal visible={showPicker} title={`اختر حساب ${selectedSide==='debit'?'مدين':'دائن'}`} data={accounts} onSelect={addLine} onClose={()=>setShowPicker(false)}/>
      <PickerModal visible={showCurrencyPicker} title="اختر العملة" data={currencies} displayField="code" showBalance={false} onSelect={(item)=>{setSelectedCurrency(item);setExchangeRate(String(item.current_rate||1));setShowCurrencyPicker(false)}} onClose={()=>setShowCurrencyPicker(false)}/>
    </View>
  );
}
// الأنماط كما هي...
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:14},
  label:{color:'#94A3B8',fontSize:11,marginBottom:4,marginTop:10},
  input:{backgroundColor:'#16213E',borderRadius:8,padding:10,color:'#FFF',fontSize:13,borderWidth:1,borderColor:'#2a3550'},
  currencyRow:{flexDirection:'row',gap:8,alignItems:'center',marginBottom:8},
  curBtn:{backgroundColor:'#16213E',borderRadius:8,padding:10,borderWidth:1,borderColor:'#2a3550',alignItems:'center'},
  curBtnT:{color:'#D4AF37',fontSize:13,fontWeight:'bold'},
  rateInput:{backgroundColor:'#16213E',borderRadius:8,padding:10,color:'#FFF',fontSize:13,borderWidth:1,borderColor:'#2a3550'},
  addRow:{flexDirection:'row',gap:10,marginTop:8,marginBottom:10},
  addBtn:{flex:1,padding:12,borderRadius:8,alignItems:'center',backgroundColor:'#16213E',borderWidth:1},
  addBtnT:{fontSize:13,fontWeight:'bold'},
  lineCard:{backgroundColor:'#16213E',borderRadius:10,padding:12,marginBottom:8},
  lineH:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:6},
  lineS:{fontSize:11,fontWeight:'bold'},lineC:{color:'#D4AF37',fontSize:11},lineN:{color:'#FFF',fontSize:12,flex:1},
  amountInp:{backgroundColor:'#0A1128',borderRadius:6,padding:8,color:'#FFF',fontSize:14,fontWeight:'bold'},
  baseAmount:{color:'#D4AF37',fontSize:10,marginTop:4,textAlign:'right'},
  totals:{backgroundColor:'#16213E',borderRadius:10,padding:12,marginTop:12},
  totalRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:4},
  saveBtn:{backgroundColor:'#D4AF37',padding:14,borderRadius:10,alignItems:'center',marginTop:16},
  saveBtnT:{color:'#0A1128',fontSize:15,fontWeight:'bold'},
});
