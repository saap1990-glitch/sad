import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function CategoriesScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name_ar: '' });

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync('SELECT * FROM categories ORDER BY name_ar');
    setCategories(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveCategory = async () => {
    if (!form.name_ar.trim() || !db) return;
    setLoading(true);
    try {
      if (editingId) {
        await db.runAsync('UPDATE categories SET name_ar=? WHERE id=?', [form.name_ar, editingId]);
      } else {
        await db.runAsync('INSERT INTO categories (name_ar) VALUES (?)', [form.name_ar]);
      }
      setShowForm(false); setForm({ name_ar: '' }); setEditingId(null);
      loadData();
      Alert.alert('✅', 'تم الحفظ');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📁 الماركات</Text><TouchableOpacity onPress={() => { setForm({ name_ar: '' }); setEditingId(null); setShowForm(true); }} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity></View>
      <FlatList data={categories} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setForm({ name_ar: item.name_ar }); setEditingId(item.id); setShowForm(true); }}>
            <Text style={styles.name}>{item.name_ar}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد ماركةات</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>{editingId ? '✏️ تعديل' : '➕ إضافة ماركة'}</Text>
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="اسم الماركة" placeholderTextColor="#666" textAlign="right" />
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveCategory}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  add:{backgroundColor:'#D4AF37',width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},addT:{color:'#FFF',fontSize:22},
  list:{padding:16},
  card:{backgroundColor:'#FFF',padding:14,borderRadius:10,marginBottom:6},
  name:{fontSize:16,color:'#1E293B'},
  empty:{color:'#94A3B8',textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.5)'},
  modalC:{backgroundColor:'#FFF',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalT:{fontSize:18,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  inp:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,fontSize:14,borderWidth:1,borderColor:'#E2E8F0',marginBottom:10},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center'},cancelT:{color:'#64748B'},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:'#D4AF37',alignItems:'center'},saveT:{color:'#FFF',fontWeight:'bold'},
});
