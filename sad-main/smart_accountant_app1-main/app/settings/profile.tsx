import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function ProfileSettings() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [profile, setProfile] = useState({ name: '', address: '', phone: '', email: '', username: '', password: '' });

  useEffect(() => { if (isReady && db) loadProfile(); }, [isReady, db]);

  async function loadProfile() {
    if (!db) return;
    const result = await db.getFirstAsync("SELECT * FROM companies LIMIT 1") as any;
    if (result) setProfile(result);
  }

  async function saveProfile() {
    if (!db) return;
    await db.runAsync('DELETE FROM companies');
    await db.runAsync('INSERT INTO companies (name_ar, address, phone, email) VALUES (?,?,?,?)', [profile.name, profile.address, profile.phone, profile.email]);
    Alert.alert('✅', 'تم حفظ البيانات');
  }

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>👤 البيانات الشخصية</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        {['name', 'address', 'phone', 'email', 'username', 'password'].map(field => (
          <View key={field}>
            <Text style={styles.label}>{field === 'name' ? 'الاسم' : field === 'address' ? 'العنوان' : field === 'phone' ? 'الهاتف' : field === 'email' ? 'البريد' : field === 'username' ? 'المستخدم' : 'كلمة المرور'}</Text>
            <TextInput style={styles.input} value={(profile as any)[field]} onChangeText={v => setProfile({...profile, [field]: v})} secureTextEntry={field === 'password'} textAlign="right" />
          </View>
        ))}
        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}><Text style={styles.saveT}>💾 حفظ</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, label:{color:'#94A3B8',fontSize:12,marginBottom:4,marginTop:10},
  input:{backgroundColor:'#16213E',borderRadius:8,padding:10,color:'#FFF',fontSize:14,borderWidth:1,borderColor:'#2a3550'},
  saveBtn:{backgroundColor:'#D4AF37',padding:14,borderRadius:10,alignItems:'center',marginTop:20},saveT:{color:'#000',fontWeight:'bold'},
});
