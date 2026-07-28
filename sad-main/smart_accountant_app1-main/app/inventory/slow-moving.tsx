import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SlowMovingScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🐢 أصناف راكدة</Text><View style={{width:40}}/></View>
      <View style={styles.content}><Text style={styles.placeholder}>لا توجد أصناف راكدة حالياً</Text></View>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{flex:1,justifyContent:'center',alignItems:'center'},placeholder:{color:'#94A3B8',fontSize:16},
});
