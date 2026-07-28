import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { accountCreationService } from '../../src/services/AccountCreationService';

export default function WarehousesScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name_ar: '', address: '' });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync('SELECT w.*, a.code as account_code FROM warehouses w LEFT JOIN account_links al ON al.entity_id=w.id AND al.module="warehouses" LEFT JOIN accounts a ON a.id=al.account_id WHERE w.is_active=1 ORDER BY w.name_ar');
    setWarehouses(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveWarehouse = async () => {
    if (!form.name_ar.trim() || !db) { Alert.alert('خطأ', 'أدخل اسم المخزن'); return; }
    setLoading(true);
    try {
      if (editingId) {
        await db.runAsync('UPDATE warehouses SET name_ar=?, address=? WHERE id=?', [form.name_ar, form.address, editingId]);
        Alert.alert('✅', 'تم تحديث المخزن');
      } else {
        const result = await db.runAsync('INSERT INTO warehouses (name_ar, address, is_active) VALUES (?,?,1)', [form.name_ar, form.address]);
        // ربط محاسبي (اختياري - يمكن إنشاء حساب مخزون)
        Alert.alert('✅', 'تم إضافة المخزن');
      }
      setShowForm(false); setForm({ name_ar: '', address: '' }); setEditingId(null);
      loadData();
    } catch (e: any) { Alert.alert('خطأ', e.message || 'فشل الحفظ'); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🏭 المخازن</Text><TouchableOpacity onPress={() => { setForm({ name_ar: '', address: '' }); setEditingId(null); setShowForm(true); }} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity></View>
      <FlatList data={warehouses} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}><Text style={styles.icon}>🏭</Text><View style={{flex:1}}><Text style={styles.name}>{item.name_ar}</Text><Text style={styles.address}>{item.address}</Text></View></View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد مخازن</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>{editingId ? '✏️ تعديل' : '➕ إضافة مخزن'}</Text>
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="اسم المخزن *" placeholderTextColor="#666" textAlign="right" />
          <TextInput style={styles.inp} value={form.address} onChangeText={v => setForm({...form, address: v})} placeholder="العنوان" placeholderTextColor="#666" textAlign="right" />
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveWarehouse}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  add:{backgroundColor:'#F59E0B',width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},addT:{color:'#FFF',fontSize:22},
  list:{padding:16},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFF',padding:14,borderRadius:12,marginBottom:8},
  icon:{fontSize:28,marginRight:12},name:{fontSize:16,fontWeight:'600'},address:{color:'#94A3B8',fontSize:12},
  empty:{color:'#94A3B8',textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.5)'},
  modalC:{backgroundColor:'#FFF',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalT:{fontSize:18,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  inp:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,fontSize:14,borderWidth:1,borderColor:'#E2E8F0',marginBottom:10},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center'},cancelT:{color:'#64748B'},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:'#F59E0B',alignItems:'center'},saveT:{color:'#FFF',fontWeight:'bold'},
});
