import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { PickerModal } from '../../src/components/ui/PickerModal';
import { accountCreationService } from '../../src/services/AccountCreationService';

export default function CashBoxesScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [banksBoxes, setCashBoxes] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name_ar: '', opening_balance: '0', currency_code: 'YER' });
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const [boxes, curs] = await Promise.all([
      db.getAllAsync(`SELECT cb.*, a.code as account_code, a.current_balance, cur.code as currency_code, cur.symbol, ROUND(a.current_balance * COALESCE(er.rate,1),2) as base_balance FROM banks cb LEFT JOIN account_links al ON al.entity_id=cb.id AND al.module='banks' LEFT JOIN accounts a ON a.id=al.account_id LEFT JOIN currencies cur ON cur.id=a.currency_id LEFT JOIN exchange_rates er ON er.currency_id=cur.id AND er.date=(SELECT MAX(date) FROM exchange_rates WHERE currency_id=cur.id) WHERE cb.is_active=1 ORDER BY cb.name_ar`),
      db.getAllAsync('SELECT * FROM currencies WHERE is_active=1'),
    ]);
    setCashBoxes(boxes as any[]); setCurrencies(curs as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveCashBox = async () => {
    if (!form.name_ar.trim() || !db) { Alert.alert('خطأ', 'أدخل اسم البنك'); return; }
    setLoading(true);
    try {
      if (editingId) {
        await db.runAsync('UPDATE banks SET name_ar=? WHERE id=?', [form.name_ar, editingId]);
        Alert.alert('✅', 'تم تحديث البنك');
      } else {
        // 1. إنشاء البنك (الكيان)
        const result = await db.runAsync('INSERT INTO banks (name_ar, is_active) VALUES (?,1)', [form.name_ar]);
        const boxId = result.lastInsertRowId;

        // 2. إنشاء الحساب المحاسبي وربطه عبر الخدمة المركزية
        await accountCreationService.createChildAccount(db, {
          parentSystemKey: 'banks_account',
          nameAr: form.name_ar,
          openingBalance: parseFloat(form.opening_balance) || 0,
          currencyCode: form.currency_code,
          module: 'banks',
          entityType: 'CashBox',
          entityId: boxId,
        });

        Alert.alert('✅', `تم إضافة البنك: ${form.name_ar}`);
      }
      setShowForm(false); setForm({ name_ar: '', opening_balance: '0', currency_code: 'YER' }); setEditingId(null);
      loadData();
    } catch (e: any) { Alert.alert('خطأ', e.message || 'فشل الحفظ'); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🏦 البنوك</Text><TouchableOpacity onPress={() => { setForm({ name_ar: '', opening_balance: '0', currency_code: 'YER' }); setEditingId(null); setShowForm(true); }} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity></View>
      <FlatList data={banksBoxes} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setForm({ name_ar: item.name_ar, opening_balance: '0', currency_code: item.currency_code || 'YER' }); setEditingId(item.id); setShowForm(true); }}>
            <Text style={styles.icon}>🏦</Text>
            <View style={{flex:1}}><Text style={styles.name}>{item.name_ar}</Text><Text style={styles.accountCode}>🏷️ {item.account_code || 'بدون'}</Text></View>
            <View style={{alignItems:'flex-end'}}><Text style={styles.balance}>{(item.current_balance||0).toLocaleString()} {item.currency_code||'YER'}</Text>{item.currency_code!=='YER'&&<Text style={styles.baseBalance}>≈ {(item.base_balance||0).toLocaleString()} ﷼</Text>}</View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد صناديق</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>{editingId ? '✏️ تعديل' : '➕ إضافة بنك'}</Text>
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="اسم البنك *" placeholderTextColor="#666" textAlign="right" />
          {!editingId && <><TextInput style={styles.inp} value={form.opening_balance} onChangeText={v => setForm({...form, opening_balance: v})} placeholder="الرصيد الافتتاحي" placeholderTextColor="#666" keyboardType="numeric" textAlign="right" /><TouchableOpacity style={styles.picker} onPress={() => setShowCurrencyPicker(true)}><Text>{form.currency_code} ▼</Text></TouchableOpacity></>}
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveCashBox}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
      <PickerModal visible={showCurrencyPicker} title="اختر العملة" data={currencies} displayField="code" showBalance={false} onSelect={(item: any) => { setForm({...form, currency_code: item.code}); setShowCurrencyPicker(false); }} onClose={() => setShowCurrencyPicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  add:{backgroundColor:'#F59E0B',width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},addT:{color:'#FFF',fontSize:22},
  list:{padding:16},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFF',padding:14,borderRadius:12,marginBottom:8,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:4,elevation:2},
  icon:{fontSize:28,marginRight:12},name:{fontSize:16,fontWeight:'600'},accountCode:{color:'#D4AF37',fontSize:11},balance:{fontSize:14,fontWeight:'bold',color:'#F59E0B'},baseBalance:{fontSize:9,color:'#D4AF37'},
  empty:{color:'#94A3B8',textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.5)'},
  modalC:{backgroundColor:'#FFF',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalT:{fontSize:18,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  inp:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,fontSize:14,borderWidth:1,borderColor:'#E2E8F0',marginBottom:10},
  picker:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,borderWidth:1,borderColor:'#E2E8F0',marginBottom:10},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center'},cancelT:{color:'#64748B'},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:'#F59E0B',alignItems:'center'},saveT:{color:'#FFF',fontWeight:'bold'},
});
