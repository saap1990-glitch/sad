import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function CustomerGroupsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name_ar: '' });

  useEffect(() => { if (isReady && db) loadGroups(); }, [isReady, db]);

  async function loadGroups() {
    if (!db) return;
    await db.execAsync('CREATE TABLE IF NOT EXISTS customer_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT)');
    const result = await db.getAllAsync('SELECT * FROM customer_groups ORDER BY name_ar');
    setGroups(result as any[]); setLoading(false);
  }

  async function saveGroup() {
    if (!form.name_ar.trim() || !db) return;
    await db.runAsync('INSERT INTO customer_groups (name_ar) VALUES (?)', [form.name_ar]);
    setShowForm(false); setForm({ name_ar: '' });
    loadGroups(); Alert.alert('✅', 'تمت الإضافة');
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.t}>📁 مجموعات العملاء</Text>
        <TouchableOpacity onPress={() => setShowForm(true)} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity>
      </View>
      <FlatList data={groups} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (<View style={styles.card}><Text>{item.name_ar}</Text></View>)}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد مجموعات</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>➕ مجموعة جديدة</Text>
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="اسم المجموعة" placeholderTextColor="#666" textAlign="right" />
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveGroup}><Text style={styles.saveT}>حفظ</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  back:{fontSize:24,color:'#D4AF37'},t:{fontSize:18,fontWeight:'bold'},
  add:{backgroundColor:'#3B82F6',width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},addT:{color:'#FFF',fontSize:22},
  list:{padding:16},card:{backgroundColor:'#FFF',padding:14,borderRadius:10,marginBottom:6},
  empty:{color:'#94A3B8',textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.5)'},
  modalC:{backgroundColor:'#FFF',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalT:{fontSize:18,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  inp:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,fontSize:14,borderWidth:1,borderColor:'#E2E8F0',marginBottom:10},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center'},cancelT:{color:'#64748B'},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:'#3B82F6',alignItems:'center'},saveT:{color:'#FFF',fontWeight:'bold'},
});
