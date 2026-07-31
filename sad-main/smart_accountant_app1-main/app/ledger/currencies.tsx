import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { Colors, Spacing, FontSizes } from '../../src/theme/colors';

export default function CurrenciesScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ code: '', name_ar: '', symbol: '', exchange_rate: '1', is_base: '0' });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync('SELECT * FROM currencies WHERE is_active=1 ORDER BY code');
    setCurrencies(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveCurrency = async () => {
    if (!form.code.trim() || !form.name_ar.trim() || !db) return;
    setLoading(true);
    try {
      if (editingId) {
        await db.runAsync('UPDATE currencies SET code=?, name_ar=?, symbol=?, exchange_rate=?, is_base=? WHERE id=?',
          [form.code, form.name_ar, form.symbol, form.exchange_rate, form.is_base, editingId]);
      } else {
        await db.runAsync('INSERT INTO currencies (code, name_ar, symbol, exchange_rate, is_base, is_active) VALUES (?,?,?,?,?,1)',
          [form.code, form.name_ar, form.symbol, form.exchange_rate, form.is_base]);
      }
      setShowForm(false); setForm({ code: '', name_ar: '', symbol: '', exchange_rate: '1', is_base: '0' }); setEditingId(null);
      loadData(); Alert.alert('✅', 'تم الحفظ');
    } catch (e: any) { Alert.alert('خطأ', e.message); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>💱 العملات</Text><TouchableOpacity onPress={() => { setForm({ code: '', name_ar: '', symbol: '', exchange_rate: '1', is_base: '0' }); setEditingId(null); setShowForm(true); }} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity></View>
      <FlatList data={currencies} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setForm({ code: item.code, name_ar: item.name_ar, symbol: item.symbol, exchange_rate: String(item.exchange_rate), is_base: String(item.is_base) }); setEditingId(item.id); setShowForm(true); }}>
            <Text style={styles.name}>{item.symbol} {item.name_ar}</Text>
            <Text style={styles.details}>كود: {item.code} | سعر: {item.exchange_rate}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد عملات</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>{editingId ? '✏️ تعديل' : '➕ إضافة عملة'}</Text>
          <TextInput style={styles.inp} value={form.code} onChangeText={v => setForm({...form, code: v.toUpperCase()})} placeholder="الكود (YER, USD...)" placeholderTextColor="#666" />
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="الاسم" placeholderTextColor="#666" textAlign="right" />
          <TextInput style={styles.inp} value={form.symbol} onChangeText={v => setForm({...form, symbol: v})} placeholder="الرمز (﷼, $...)" placeholderTextColor="#666" />
          <TextInput style={styles.inp} value={form.exchange_rate} onChangeText={v => setForm({...form, exchange_rate: v})} placeholder="سعر الصرف" placeholderTextColor="#666" keyboardType="numeric" />
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveCurrency}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
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
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:Colors.border,alignItems:'center'},cancelT:{color:Colors.textSecondary},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:Colors.primary,alignItems:'center'},saveT:{color:'#000',fontWeight:'bold'},
});
