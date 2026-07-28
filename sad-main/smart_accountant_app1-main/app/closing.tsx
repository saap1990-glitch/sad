import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClosingScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();

  const handleClosePeriod = () => {
    Alert.alert('إقفال الفترة', 'سيتم إقفال الفترة الحالية وترحيل الأرباح/الخسائر. هل تريد المتابعة؟', [
      { text: 'إلغاء' },
      { text: 'إقفال', style: 'destructive', onPress: () => Alert.alert('✅', 'تم إقفال الفترة') }
    ]);
  };

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🔒 إقفال الفترة</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        <Text style={styles.warning}>⚠️</Text>
        <Text style={styles.desc}>إقفال الفترة المالية سيؤدي إلى ترحيل الأرباح/الخسائر ولا يمكن التراجع عنه.</Text>
        <TouchableOpacity style={styles.btn} onPress={handleClosePeriod}>
          <Text style={styles.btnT}>🔒 إقفال الفترة المالية</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{flex:1,justifyContent:'center',alignItems:'center',padding:30},
  warning:{fontSize:60,marginBottom:16},desc:{color:'#EF4444',fontSize:14,textAlign:'center',marginBottom:30},
  btn:{backgroundColor:'#EF4444',padding:16,borderRadius:12},btnT:{color:'#FFF',fontSize:16,fontWeight:'bold'},
});
