import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppearanceSettings() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState('ar');

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🌐 اللغة والمظهر</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>الوضع الليلي</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <Text style={styles.sectionTitle}>اللغة</Text>
        <View style={styles.langRow}>
          {['ar', 'en'].map(l => (
            <TouchableOpacity key={l} style={[styles.langBtn, lang === l && styles.langBtnActive]} onPress={() => setLang(l)}>
              <Text style={[styles.langT, lang === l && styles.langTActive]}>{l === 'ar' ? '🇾🇪 العربية' : '🇺🇸 English'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:10,marginBottom:16},
  label:{color:'#FFF',fontSize:14}, sectionTitle:{color:'#D4AF37',fontSize:14,fontWeight:'bold',marginBottom:8},
  langRow:{flexDirection:'row',gap:10},
  langBtn:{flex:1,padding:14,borderRadius:10,backgroundColor:'#16213E',alignItems:'center',borderWidth:1,borderColor:'#2a3550'},
  langBtnActive:{borderColor:'#D4AF37',backgroundColor:'#D4AF3720'},
  langT:{color:'#94A3B8',fontSize:14},langTActive:{color:'#D4AF37',fontWeight:'bold'},
});
