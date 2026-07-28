import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { accountCreationService } from '../../src/services/AccountCreationService';

export default function CustomersScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [suppliers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name_ar: '', phone: '', email: '', address: '', opening_balance: '0', currency_code: 'YER' });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync(`
      SELECT c.*, a.code as account_code, a.current_balance, cur.code as currency_code
      FROM suppliers c
      LEFT JOIN account_links al ON al.entity_id = c.id AND al.module = 'suppliers'
      LEFT JOIN accounts a ON a.id = al.account_id
      LEFT JOIN currencies cur ON cur.id = a.currency_id
      WHERE c.is_active = 1 ORDER BY c.name_ar
    `);
    setCustomers(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveCustomer = async () => {
    if (!form.name_ar.trim() || !db) { Alert.alert('خطأ', 'أدخل اسم المورد'); return; }
    setLoading(true);
    try {
      if (editingId) {
        await db.runAsync('UPDATE suppliers SET name_ar=?, phone=?, email=?, address=? WHERE id=?', [form.name_ar, form.phone, form.email, form.address, editingId]);
        Alert.alert('✅', 'تم تحديث المورد');
      } else {
        const result = await db.runAsync('INSERT INTO suppliers (name_ar, phone, email, address, is_active) VALUES (?,?,?,?,1)', [form.name_ar, form.phone, form.email, form.address]);
        await accountCreationService.createChildAccount(db, {
          parentSystemKey: 'supplier_parent',
          nameAr: form.name_ar,
          openingBalance: parseFloat(form.opening_balance) || 0,
          currencyCode: form.currency_code,
          module: 'suppliers',
          entityType: 'Customer',
          entityId: result.lastInsertRowId,
        });
        Alert.alert('✅', 'تم إضافة المورد وربطه محاسبياً');
      }
      setShowForm(false); setForm({ name_ar: '', phone: '', email: '', address: '', opening_balance: '0', currency_code: 'YER' }); setEditingId(null);
      loadData();
    } catch (e: any) { Alert.alert('خطأ', e.message || 'فشل الحفظ'); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🏪 الموردين</Text><TouchableOpacity onPress={() => { setForm({ name_ar: '', phone: '', email: '', address: '', opening_balance: '0', currency_code: 'YER' }); setEditingId(null); setShowForm(true); }} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity></View>
      <FlatList data={suppliers} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setForm({ name_ar: item.name_ar, phone: item.phone||'', email: item.email||'', address: item.address||'', opening_balance: '0', currency_code: item.currency_code||'YER' }); setEditingId(item.id); setShowForm(true); }}>
            <Text style={styles.icon}>🏪</Text>
            <View style={{flex:1}}><Text style={styles.name}>{item.name_ar}</Text><Text style={styles.phone}>{item.phone}</Text><Text style={styles.accountCode}>🏷️ {item.account_code || 'بدون'}</Text></View>
            <Text style={styles.balance}>{(item.current_balance||0).toLocaleString()} ﷼</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد عملاء</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>{editingId ? '✏️ تعديل' : '➕ إضافة مورد'}</Text>
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="اسم المورد *" placeholderTextColor="#666" textAlign="right" />
          <TextInput style={styles.inp} value={form.phone} onChangeText={v => setForm({...form, phone: v})} placeholder="الهاتف" placeholderTextColor="#666" keyboardType="phone-pad" textAlign="right" />
          <TextInput style={styles.inp} value={form.email} onChangeText={v => setForm({...form, email: v})} placeholder="البريد الإلكتروني" placeholderTextColor="#666" keyboardType="email-address" />
          <TextInput style={styles.inp} value={form.address} onChangeText={v => setForm({...form, address: v})} placeholder="العنوان" placeholderTextColor="#666" textAlign="right" />
          {!editingId && <><TextInput style={styles.inp} value={form.opening_balance} onChangeText={v => setForm({...form, opening_balance: v})} placeholder="الرصيد الافتتاحي" placeholderTextColor="#666" keyboardType="numeric" textAlign="right" /></>}
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveCustomer}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  add:{backgroundColor:'#8B5CF6',width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},addT:{color:'#FFF',fontSize:22},
  list:{padding:16},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFF',padding:14,borderRadius:12,marginBottom:8,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:4,elevation:2},
  icon:{fontSize:28,marginRight:12},name:{fontSize:16,fontWeight:'600'},phone:{color:'#64748B',fontSize:12},accountCode:{color:'#D4AF37',fontSize:11},balance:{fontSize:14,fontWeight:'bold',color:'#10B981'},
  empty:{color:'#94A3B8',textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.5)'},
  modalC:{backgroundColor:'#FFF',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalT:{fontSize:18,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  inp:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,fontSize:14,borderWidth:1,borderColor:'#E2E8F0',marginBottom:10},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center'},cancelT:{color:'#64748B'},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:'#8B5CF6',alignItems:'center'},saveT:{color:'#FFF',fontWeight:'bold'},
});
