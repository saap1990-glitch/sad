import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
export default function AccountDetailsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📋 تفاصيل الحساب</Text><View style={{width:40}}/></View>
      <Text style={styles.placeholder}>تفاصيل الحساب ستظهر هنا</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:Colors.background}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:Colors.surface,borderBottomWidth:1,borderBottomColor:Colors.border},
  back:{fontSize:24,color:Colors.primary},t:{fontSize:18,fontWeight:'bold',color:Colors.primary},
  placeholder:{color:Colors.textSecondary,textAlign:'center',marginTop:100}
});
