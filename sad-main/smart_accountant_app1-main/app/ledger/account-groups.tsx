import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { Colors, Spacing, FontSizes } from '../../src/theme/colors';

export default function AccountGroupsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name_ar: '', code: '', nature: 'debit', type: 'asset', normal_side: 'debit' });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync('SELECT * FROM account_groups ORDER BY code');
    setGroups(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveGroup = async () => {
    if (!form.name_ar.trim() || !db) return;
    setLoading(true);
    try {
      if (editingId) {
        await db.runAsync('UPDATE account_groups SET name_ar=?, code=?, nature=?, type=?, normal_side=? WHERE id=?', 
          [form.name_ar, form.code, form.nature, form.type, form.normal_side, editingId]);
      } else {
        await db.runAsync('INSERT INTO account_groups (name_ar, code, nature, type, normal_side) VALUES (?,?,?,?,?)',
          [form.name_ar, form.code, form.nature, form.type, form.normal_side]);
      }
      setShowForm(false); setForm({ name_ar: '', code: '', nature: 'debit', type: 'asset', normal_side: 'debit' }); setEditingId(null);
      loadData(); Alert.alert('✅', 'تم الحفظ');
    } catch (e: any) { Alert.alert('خطأ', e.message); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.t}>📁 مجموعات الحسابات</Text>
        <TouchableOpacity onPress={() => { setForm({ name_ar: '', code: '', nature: 'debit', type: 'asset', normal_side: 'debit' }); setEditingId(null); setShowForm(true); }} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity>
      </View>
      <FlatList data={groups} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setForm({ name_ar: item.name_ar, code: item.code, nature: item.nature, type: item.type, normal_side: item.normal_side }); setEditingId(item.id); setShowForm(true); }}>
            <Text style={styles.name}>{item.name_ar}</Text>
            <Text style={styles.details}>كود: {item.code} | طبيعة: {item.nature} | نوع: {item.type}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد مجموعات</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>{editingId ? '✏️ تعديل' : '➕ إضافة مجموعة'}</Text>
          <TextInput style={styles.inp} value={form.code} onChangeText={v => setForm({...form, code: v})} placeholder="الكود" placeholderTextColor="#666" />
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="الاسم" placeholderTextColor="#666" textAlign="right" />
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveGroup}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity></View>
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
