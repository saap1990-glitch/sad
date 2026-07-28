import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

export default function CashReceiptScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [sourceType, setSourceType] = useState<'cash'|'bank'|'exchange'|'wallet'>('cash');
  const [sourceAccounts, setSourceAccounts] = useState<any[]>([]);
  const [debitAccounts, setCreditAccounts] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [selectedDebit, setSelectedCredit] = useState<any>(null);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showDebitPicker, setShowCreditPicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<any>({ code: 'YER', current_rate: 1 });
  const [exchangeRate, setExchangeRate] = useState('1');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const sourceTypes = [
    { key: 'cash' as const, label: '💰 صندوق', parentCode: '1101', prefix: 'PAY-CSH-' },
    { key: 'bank' as const, label: '🏦 بنك', parentCode: '1102', prefix: 'PAY-BNK-' },
    { key: 'exchange' as const, label: '💱 صرافة', parentCode: '1103', prefix: 'PAY-EXC-' },
    { key: 'wallet' as const, label: '📱 محفظة', parentCode: '1104', prefix: 'PAY-WLT-' },
  ];

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const ct = sourceTypes.find(t => t.key === sourceType)!;
    const [src, crd, cur] = await Promise.all([
      db.getAllAsync("SELECT * FROM accounts WHERE code LIKE ?||'%' AND is_leaf=1 AND is_active=1", [ct.parentCode]),
      db.getAllAsync("SELECT * FROM accounts WHERE is_leaf=1 AND is_active=1 ORDER BY code LIMIT 50"),
      db.getAllAsync("SELECT c.*, COALESCE(er.rate,1) as current_rate FROM currencies c LEFT JOIN exchange_rates er ON er.currency_id=c.id AND er.date=(SELECT MAX(date) FROM exchange_rates WHERE currency_id=c.id) WHERE c.is_active=1"),
    ]);
    setSourceAccounts(src as any[]); setCreditAccounts(crd as any[]); setCurrencies(cur as any[]);
    const yer = (cur as any[]).find((c: any) => c.code === 'YER');
    setSelectedCurrency(yer || { code: 'YER', current_rate: 1 });
    setExchangeRate(yer ? String(yer.current_rate || 1) : '1');
    const last = await db.getFirstAsync("SELECT entry_number FROM journal_entries WHERE entry_number LIKE ? ORDER BY id DESC LIMIT 1", [`${ct.prefix}%`]) as any;
    let n = 1; if (last?.entry_number) n = parseInt(last.entry_number.split('-').pop()||'0') + 1;
    setReceiptNumber(`${ct.prefix}${String(n).padStart(5,'0')}`);
    setSelectedSource(null); setSelectedCredit(null); setLoading(false);
  }, [db, sourceType]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveReceipt = async () => {
    if (!amount || !selectedSource || !selectedDebit || !db) { Alert.alert('خطأ', 'أكمل البيانات'); return; }
    const rate = parseFloat(exchangeRate) || 1;
    const foreignAmount = parseFloat(amount);

    setLoading(true);
    try {
      // ✅ استخدام FinancialCoreEngine
      await financialEngine.executeTransaction(db, {
        date,
        description: description || `سند صرف ${receiptNumber}`,
        reference: receiptNumber,
        source_type: 'cash_payment',
        currency_code: selectedCurrency.code,
        exchange_rate: rate,
        lines: [
          {
            account_id: selectedSource.id,
            debit_original: 0,
            credit_original: foreignAmount,
            description: `قبض ${foreignAmount.toLocaleString()} ${selectedCurrency.code}`
          },
          {
            account_id: selectedDebit.id,
            debit_original: 0,
            credit_original: foreignAmount,
            description: `قبض ${foreignAmount.toLocaleString()} ${selectedCurrency.code}`
          }
        ]
      });

      Alert.alert('✅', `تم حفظ ${receiptNumber}\n${foreignAmount.toLocaleString()} ${selectedCurrency.code} = ${(foreignAmount * rate).toLocaleString()} ﷼`);
      setAmount(''); setDescription(''); loadData();
    } catch(e: any) { Alert.alert('خطأ', e.message || 'فشل الحفظ'); }
    setLoading(false);
  };

  if (!isReady||loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  const ct = sourceTypes.find(t=>t.key===sourceType)!;
  const previewBaseAmount = (parseFloat(amount) * parseFloat(exchangeRate)) || 0;

  return (
    <View style={[styles.c,{paddingTop:insets.top}]}>
      <View style={styles.h}><TouchableOpacity onPress={()=>router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📤 سند صرف</Text><Text style={styles.num}>{receiptNumber}</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>نوع المصدر</Text>
        <View style={styles.typeRow}>{sourceTypes.map(t=>(<TouchableOpacity key={t.key} style={[styles.typeBtn,sourceType===t.key&&styles.typeBtnActive]} onPress={()=>setSourceType(t.key)}><Text>{t.label}</Text></TouchableOpacity>))}</View>
        <Text style={styles.section}>اختر {ct.label}</Text>
        <TouchableOpacity style={styles.picker} onPress={()=>setShowSourcePicker(true)}><Text style={selectedSource?styles.pv:styles.pp}>{selectedSource?`${selectedSource.code} - ${selectedSource.name_ar}`:'اختر...'}</Text><Text>▼</Text></TouchableOpacity>
        {selectedSource&&<Text style={styles.bh}>الرصيد: {(selectedSource.current_balance||0).toLocaleString()} ﷼</Text>}
        <Text style={styles.section}>💱 العملة والمبلغ</Text>
        <View style={styles.currencyRow}>
          <TouchableOpacity style={[styles.currencyBtn, {flex:1}]} onPress={() => setShowCurrencyPicker(true)}><Text style={styles.currencyBtnText}>{selectedCurrency.code} ▼</Text></TouchableOpacity>
          <TextInput style={[styles.rateInput, {flex:2}]} value={exchangeRate} onChangeText={setExchangeRate} keyboardType="numeric" placeholder="سعر الصرف" placeholderTextColor="#666" textAlign="center"/>
        </View>
        <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" textAlign="center"/>
        <Text style={styles.convertedText}>= {previewBaseAmount.toLocaleString()} ﷼</Text>
        <Text style={styles.section}>الحساب المدين (المصدر)</Text>
        <View style={styles.auto}><Text style={styles.autoT}>{selectedSource?`${selectedSource.code} - ${selectedSource.name_ar}`:'يحدد تلقائياً'}</Text></View>
        <Text style={styles.section}>الحساب المدين</Text>
        <TouchableOpacity style={styles.picker} onPress={()=>setShowCreditPicker(true)}><Text style={selectedDebit?styles.pv:styles.pp}>{selectedDebit?`${selectedDebit.code} - ${selectedDebit.name_ar}`:'اختر...'}</Text><Text>▼</Text></TouchableOpacity>
        <Text style={styles.section}>التاريخ</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#666" textAlign="center"/>
        <Text style={styles.section}>البيان</Text>
        <TextInput style={[styles.input,{height:70}]} value={description} onChangeText={setDescription} placeholder="بيان السند" placeholderTextColor="#666" multiline textAlign="right"/>
        {selectedSource&&selectedDebit&&amount&&(
          <View style={styles.preview}><Text style={styles.previewT}>📋 معاينة القيد</Text>
            <Text style={styles.previewL}>🏦 {selectedSource.code} مدين: {previewBaseAmount.toLocaleString()} ﷼</Text>
            <Text style={styles.previewL}>💰 {selectedDebit.code} دائن: {previewBaseAmount.toLocaleString()} ﷼</Text>
          </View>
        )}
        <View style={styles.btns}><TouchableOpacity style={styles.clearBtn} onPress={()=>{setAmount('');setDescription('');}}><Text style={styles.clearBtnT}>🗑️ مسح</Text></TouchableOpacity><TouchableOpacity style={styles.saveBtn} onPress={saveReceipt}><Text style={styles.saveBtnT}>💾 حفظ</Text></TouchableOpacity></View>
        <View style={{height:30}}/>
      </ScrollView>
      <PickerModal visible={showSourcePicker} title={`اختر ${ct.label}`} data={sourceAccounts} onSelect={(item)=>{setSelectedSource(item);setShowSourcePicker(false)}} onClose={()=>setShowSourcePicker(false)} />
      <PickerModal visible={showDebitPicker} title="اختر الحساب المدين" data={debitAccounts} onSelect={(item)=>{setSelectedCredit(item);setShowCreditPicker(false)}} onClose={()=>setShowCreditPicker(false)} />
      <PickerModal visible={showCurrencyPicker} title="اختر العملة" data={currencies} displayField="code" showBalance={false} onSelect={(item)=>{setSelectedCurrency(item);setExchangeRate(String(item.current_rate||1));setShowCurrencyPicker(false)}} onClose={()=>setShowCurrencyPicker(false)} />
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},num:{color:'#EF4444',fontSize:11},
  content:{padding:14},
  section:{color:'#94A3B8',fontSize:12,fontWeight:'bold',marginTop:14,marginBottom:6},
  typeRow:{flexDirection:'row',flexWrap:'wrap',gap:6},
  typeBtn:{paddingHorizontal:14,paddingVertical:10,borderRadius:10,backgroundColor:'#16213E',borderWidth:2,borderColor:'#2a3550'},
  typeBtnActive:{borderColor:'#D4AF37',backgroundColor:'#D4AF3720'},
  picker:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#16213E',borderRadius:10,padding:14,borderWidth:1,borderColor:'#2a3550'},
  pv:{color:'#FFF',fontSize:14},pp:{color:'#64748B',fontSize:14},
  bh:{color:'#EF4444',fontSize:11,marginTop:4,textAlign:'right'},
  currencyRow:{flexDirection:'row',gap:8,alignItems:'center',marginBottom:6},
  currencyBtn:{backgroundColor:'#16213E',borderRadius:8,padding:12,borderWidth:1,borderColor:'#2a3550',alignItems:'center'},
  currencyBtnText:{color:'#D4AF37',fontSize:14,fontWeight:'bold'},
  rateInput:{backgroundColor:'#16213E',borderRadius:8,padding:12,color:'#FFF',fontSize:14,borderWidth:1,borderColor:'#2a3550'},
  amountInput:{backgroundColor:'#16213E',borderRadius:10,padding:14,color:'#FFF',fontSize:20,fontWeight:'bold',borderWidth:2,borderColor:'#2a3550'},
  convertedText:{color:'#D4AF37',fontSize:12,marginTop:4,textAlign:'right'},
  auto:{backgroundColor:'#16213E',borderRadius:10,padding:14,borderWidth:1,borderColor:'#EF444440'},
  autoT:{color:'#EF4444',fontSize:13},
  input:{backgroundColor:'#16213E',borderRadius:10,padding:12,color:'#FFF',fontSize:13,borderWidth:1,borderColor:'#2a3550'},
  preview:{backgroundColor:'#16213E',borderRadius:12,padding:14,marginTop:16,borderWidth:1,borderColor:'#D4AF3740'},
  previewT:{color:'#D4AF37',fontSize:13,fontWeight:'bold',marginBottom:10},
  previewL:{color:'#94A3B8',fontSize:11,marginBottom:3},
  btns:{flexDirection:'row',gap:10,marginTop:20},
  clearBtn:{flex:1,padding:14,borderRadius:12,backgroundColor:'#16213E',borderWidth:1,borderColor:'#2a3550',alignItems:'center'},
  clearBtnT:{color:'#94A3B8',fontSize:14,fontWeight:'600'},
  saveBtn:{flex:2,padding:14,borderRadius:12,backgroundColor:'#EF4444',alignItems:'center'},
  saveBtnT:{color:'#FFF',fontSize:15,fontWeight:'bold'},
});
