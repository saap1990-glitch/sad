import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>ℹ️ عن التطبيق</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        <Text style={styles.logo}>💎</Text>
        <Text style={styles.name}>دفتر المحاسب الذكي</Text>
        <Text style={styles.version}>الإصدار 1.0.0</Text>
        <Text style={styles.desc}>تطبيق محاسبي متكامل للشركات الصغيرة والمتوسطة.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{flex:1,justifyContent:'center',alignItems:'center',padding:20},
  logo:{fontSize:80,marginBottom:20},name:{color:'#D4AF37',fontSize:24,fontWeight:'bold'},
  version:{color:'#94A3B8',fontSize:14,marginTop:8},desc:{color:'#94A3B8',fontSize:14,textAlign:'center',marginTop:16},
});
