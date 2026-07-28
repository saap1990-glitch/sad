import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdvancedSettings() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [whatsapp, setWhatsapp] = useState(false);
  const [voice, setVoice] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [showCurrency, setShowCurrency] = useState(true);
  const [preventNegative, setPreventNegative] = useState(false);
  const [showTotals, setShowTotals] = useState(true);
  const [showTxnNum, setShowTxnNum] = useState(true);

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>⚙️ خيارات متقدمة</Text><View style={{width:40}}/></View>
      <ScrollView contentContainerStyle={styles.content}>
        {[
          ['إرسال كشف الحساب واتساب', whatsapp, setWhatsapp],
          ['استخدام الوضع الذكي الصوتي', voice, setVoice],
          ['إظهار أيقونة الموجه', showIcon, setShowIcon],
          ['إظهار العملات', showCurrency, setShowCurrency],
          ['منع البيع بالسالب', preventNegative, setPreventNegative],
          ['إجمالي العمليات أسفل الحساب', showTotals, setShowTotals],
          ['إظهار رقم العملية', showTxnNum, setShowTxnNum],
        ].map(([label, value, setter]: any, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch value={value} onValueChange={setter} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:10,marginBottom:10},
  label:{color:'#FFF',fontSize:14},
});
