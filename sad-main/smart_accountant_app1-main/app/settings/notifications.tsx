import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationSettings() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [debtAlert, setDebtAlert] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [backupAlert, setBackupAlert] = useState(false);

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🔔 الإشعارات</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        {[
          ['تنبيه الديون', debtAlert, setDebtAlert],
          ['تنبيه المخزون المنخفض', lowStockAlert, setLowStockAlert],
          ['تنبيه النسخ الاحتياطي', backupAlert, setBackupAlert],
        ].map(([label, value, setter]: any, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch value={value} onValueChange={setter} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:10,marginBottom:10},
  label:{color:'#FFF',fontSize:14},
});
