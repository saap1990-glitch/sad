import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function RepsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [reps, setReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name_ar: '', phone: '', commission: '0' });

  useEffect(() => {
    if (isReady && db) loadReps();
  }, [isReady, db]);

  async function loadReps() {
    if (!db) return;
    await db.execAsync('CREATE TABLE IF NOT EXISTS reps (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT, phone TEXT, commission REAL DEFAULT 0)');
    const result = await db.getAllAsync('SELECT * FROM reps ORDER BY name_ar');
    setReps(result as any[]); setLoading(false);
  }

  async function saveRep() {
    if (!form.name_ar.trim() || !db) return;
    await db.runAsync('INSERT INTO reps (name_ar, phone, commission) VALUES (?,?,?)', [form.name_ar, form.phone, parseFloat(form.commission)||0]);
    setShowForm(false); setForm({ name_ar: '', phone: '', commission: '0' });
    loadReps(); Alert.alert('✅', 'تمت الإضافة');
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.t}>👨‍💼 المندوبين</Text>
        <TouchableOpacity onPress={() => setShowForm(true)} style={styles.add}><Text style={styles.addT}>+</Text></TouchableOpacity>
      </View>
      <FlatList data={reps} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (<View style={styles.card}><Text style={styles.name}>{item.name_ar}</Text><Text style={styles.phone}>{item.phone}</Text></View>)}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد مندوبين</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}><Text style={styles.modalT}>➕ مندوب جديد</Text>
          <TextInput style={styles.inp} value={form.name_ar} onChangeText={v => setForm({...form, name_ar: v})} placeholder="الاسم" placeholderTextColor="#666" textAlign="right" />
          <TextInput style={styles.inp} value={form.phone} onChangeText={v => setForm({...form, phone: v})} placeholder="الهاتف" placeholderTextColor="#666" keyboardType="phone-pad" textAlign="right" />
          <TextInput style={styles.inp} value={form.commission} onChangeText={v => setForm({...form, commission: v})} placeholder="العمولة %" placeholderTextColor="#666" keyboardType="numeric" textAlign="right" />
          <View style={styles.btns}><TouchableOpacity style={styles.cancel} onPress={() => setShowForm(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveRep}><Text style={styles.saveT}>حفظ</Text></TouchableOpacity></View>
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
  list:{padding:16},card:{backgroundColor:'#FFF',padding:14,borderRadius:10,marginBottom:6},name:{fontSize:16,fontWeight:'600'},phone:{color:'#64748B',fontSize:12},
  empty:{color:'#94A3B8',textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.5)'},
  modalC:{backgroundColor:'#FFF',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalT:{fontSize:18,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  inp:{backgroundColor:'#F8FAFC',borderRadius:8,padding:12,fontSize:14,borderWidth:1,borderColor:'#E2E8F0',marginBottom:10},
  btns:{flexDirection:'row',gap:10,marginTop:10},
  cancel:{flex:1,padding:14,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center'},cancelT:{color:'#64748B'},
  save:{flex:2,padding:14,borderRadius:8,backgroundColor:'#8B5CF6',alignItems:'center'},saveT:{color:'#FFF',fontWeight:'bold'},
});
