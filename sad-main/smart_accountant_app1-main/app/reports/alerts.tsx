import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlertsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const alerts = [
    { icon: '⚠️', text: 'لا توجد تنبيهات حالياً', color: '#F59E0B' },
    { icon: '✅', text: 'جميع الحسابات محدثة', color: '#10B981' },
  ];
  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🔔 التنبيهات</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        {alerts.map((a, i) => (
          <View key={i} style={[styles.card, {borderLeftColor: a.color}]}><Text>{a.icon} {a.text}</Text></View>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, card:{backgroundColor:'#16213E',padding:14,borderRadius:10,marginBottom:8,borderLeftWidth:4},
});
