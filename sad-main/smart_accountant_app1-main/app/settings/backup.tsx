import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackupService } from '../../src/services/BackupService';

export default function BackupSettings() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [autoBackup, setAutoBackup] = useState(false);

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>💾 خيارات النسخ الاحتياطي</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>حفظ تلقائي يومي</Text>
          <Switch value={autoBackup} onValueChange={setAutoBackup} />
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => BackupService.createBackup()}><Text style={styles.btnT}>📥 حفظ نسخة الآن</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#3B82F6' }]} onPress={() => Alert.alert('استرجاع', 'جاري فتح الملفات...')}><Text style={styles.btnT}>🔄 استرجاع نسخة</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#6366F1' }]} onPress={() => Alert.alert('☁️', 'جاري المزامنة مع السحابة...')}><Text style={styles.btnT}>☁️ مزامنة سحابية</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:10,marginBottom:16},
  label:{color:'#FFF',fontSize:14},
  btn:{backgroundColor:'#10B981',padding:14,borderRadius:10,alignItems:'center',marginBottom:10},btnT:{color:'#FFF',fontWeight:'bold'},
});
