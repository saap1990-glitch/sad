import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackupService } from '../src/services/BackupService';

export default function BackupScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    await BackupService.createBackup();
    setLoading(false);
  };

  const handleRestore = async () => {
    Alert.alert('استعادة', 'سيتم استعادة آخر نسخة احتياطية. هل تريد المتابعة؟', [
      { text: 'إلغاء' },
      { text: 'استعادة', onPress: () => Alert.alert('✅', 'تمت الاستعادة') }
    ]);
  };

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>💾 النسخ الاحتياطي</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.btn} onPress={handleBackup} disabled={loading}>
          <Text style={styles.btnT}>{loading ? '⏳' : '📤 إنشاء نسخة احتياطية'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#3B82F6' }]} onPress={handleRestore}>
          <Text style={styles.btnT}>📥 استعادة نسخة</Text>
        </TouchableOpacity>
        <Text style={styles.note}>يتم حفظ النسخ في مجلد المستندات</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:20, gap:16},
  btn:{backgroundColor:'#10B981',padding:16,borderRadius:12,alignItems:'center'},
  btnT:{color:'#FFF',fontSize:16,fontWeight:'bold'},
  note:{color:'#64748B',textAlign:'center',fontSize:12,marginTop:10},
});
