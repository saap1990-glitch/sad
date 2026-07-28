import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService } from '../../src/services/AuthService';

export default function SecuritySettings() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const pinE = await AuthService.isPinEnabled();
    const bioE = await AuthService.isBiometricEnabled();
    const bioA = await AuthService.isBiometricAvailable();
    setPinEnabled(pinE);
    setBiometricEnabled(bioE);
    setBiometricAvailable(bioA);
  }

  async function togglePin(value: boolean) {
    setPinEnabled(value);
    await AuthService.setSetting('pin_enabled', String(value));
    if (value) {
      setShowPinInput(true);
    } else {
      Alert.alert('✅', 'تم إلغاء PIN');
    }
  }

  async function savePin() {
    if (pin.length < 4) { Alert.alert('خطأ', 'PIN يجب أن يكون 4 أرقام على الأقل'); return; }
    await AuthService.loginWithPin(pin);
    setShowPinInput(false);
    setPin('');
    Alert.alert('✅', 'تم حفظ PIN بنجاح');
  }

  async function toggleBiometric(value: boolean) {
    if (value && !biometricAvailable) {
      Alert.alert('غير متاح', 'جهازك لا يدعم بصمة الإصبع');
      return;
    }
    setBiometricEnabled(value);
    await AuthService.setBiometricEnabled(String(value));
    Alert.alert('✅', value ? 'تم تفعيل بصمة الإصبع' : 'تم إلغاء بصمة الإصبع');
  }

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>🔒 الأمان</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        {/* تفعيل PIN */}
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>تفعيل كلمة السر (PIN)</Text>
            <Text style={styles.hint}>مطلوب 4-6 أرقام</Text>
          </View>
          <Switch value={pinEnabled} onValueChange={togglePin} trackColor={{ false: '#2a3550', true: '#D4AF37' }} thumbColor={pinEnabled ? '#D4AF37' : '#666'} />
        </View>

        {showPinInput && (
          <View style={styles.pinSection}>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              placeholder="******"
              placeholderTextColor="#666"
              textAlign="center"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={savePin}>
              <Text style={styles.saveT}>💾 حفظ PIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* تفعيل البصمة */}
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>تفعيل بصمة الإصبع</Text>
            <Text style={styles.hint}>{biometricAvailable ? '👆 جهازك يدعم البصمة' : '❌ غير مدعوم'}</Text>
          </View>
          <Switch value={biometricEnabled} onValueChange={toggleBiometric} trackColor={{ false: '#2a3550', true: '#D4AF37' }} thumbColor={biometricEnabled ? '#D4AF37' : '#666'} disabled={!biometricAvailable} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'}, h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:16}, row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#16213E',borderRadius:10,marginBottom:10},
  label:{color:'#FFF',fontSize:14}, hint:{color:'#94A3B8',fontSize:11,marginTop:2},
  pinSection:{backgroundColor:'#16213E',borderRadius:10,padding:14,marginBottom:10},
  pinInput:{backgroundColor:'#0A1128',borderRadius:8,padding:12,color:'#D4AF37',fontSize:24,fontWeight:'bold',letterSpacing:8,textAlign:'center',borderWidth:2,borderColor:'#D4AF3740'},
  saveBtn:{backgroundColor:'#D4AF37',padding:12,borderRadius:8,alignItems:'center',marginTop:10},saveT:{color:'#000',fontWeight:'bold'},
});
