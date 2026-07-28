import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrintSettings() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [showData, setShowData] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [footerNote, setFooterNote] = useState('');

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🖨️ خيارات الطباعة</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        {[
          ['إظهار البيانات', showData, setShowData],
          ['إظهار التاريخ', showDate, setShowDate],
          ['طباعة الرصيد المتبقي', showBalance, setShowBalance],
        ].map(([label, value, setter]: any, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch value={value} onValueChange={setter} />
          </View>
        ))}
        <Text style={styles.label}>ملاحظة أسفل التعهد</Text>
        <TextInput style={styles.input} value={footerNote} onChangeText={setFooterNote} placeholder="التذييل" placeholderTextColor="#666" multiline textAlign="right" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:10,marginBottom:10},
  label:{color:'#FFF',fontSize:14}, input:{backgroundColor:'#16213E',borderRadius:10,padding:12,color:'#FFF',height:80,textAlignVertical:'top',marginTop:10},
});
