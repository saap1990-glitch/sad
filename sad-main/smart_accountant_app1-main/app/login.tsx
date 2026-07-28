import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../src/services/AuthService';

export default function LoginScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const pinE = await AuthService.isPinEnabled();
      const bioE = await AuthService.isBiometricEnabled();
      const bioA = await AuthService.isBiometricAvailable();
      setPinEnabled(pinE);
      setBiometricEnabled(bioE);
      setBiometricAvailable(bioA);

      // إذا لم يتم تفعيل أي وسيلة حماية، تخطي الدخول
      if (!pinE && !bioE) {
        router.replace('/(tabs)');
        return;
      }

      // إذا كانت البصمة مفعلة ومتاحة، حاول تسجيل الدخول بها تلقائياً
      if (bioE && bioA) {
        handleBiometric();
      }
    }
    checkAuth();
  }, []);

  async function handlePinLogin() {
    if (!pin || pin.length < 4) {
      Alert.alert('تنبيه', 'PIN يجب أن يكون 4 أرقام على الأقل');
      return;
    }
    setLoading(true);
    const success = await AuthService.loginWithPin(pin);
    setLoading(false);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('خطأ', 'PIN غير صحيح');
      setPin('');
    }
  }

  async function handleBiometric() {
    setLoading(true);
    const success = await AuthService.loginWithBiometrics();
    setLoading(false);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('فشل', 'لم يتم التعرف على بصمة الإصبع');
    }
  }

  if (!pinEnabled && !biometricEnabled) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#D4AF37" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🔐</Text>
      <Text style={styles.title}>تسجيل الدخول</Text>

      {biometricEnabled && biometricAvailable && (
        <TouchableOpacity style={styles.bioBtn} onPress={handleBiometric} disabled={loading}>
          <Text style={styles.bioIcon}>👆</Text>
          <Text style={styles.bioText}>تسجيل الدخول بالبصمة</Text>
        </TouchableOpacity>
      )}

      {pinEnabled && (
        <>
          <View style={styles.orRow}><View style={styles.orLine} /><Text style={styles.orText}>أو PIN</Text><View style={styles.orLine} /></View>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            maxLength={6}
            secureTextEntry
            placeholder="******"
            placeholderTextColor="#64748B"
            textAlign="center"
          />
          <TouchableOpacity style={styles.btn} onPress={handlePinLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#0A1128" /> : <Text style={styles.btnText}>🔓 دخول</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128', justifyContent: 'center', alignItems: 'center', padding: 30 },
  logo: { fontSize: 60, marginBottom: 20 },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
  bioBtn: { backgroundColor: '#16213E', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#D4AF3740', width: '80%' },
  bioIcon: { fontSize: 40, marginBottom: 8 },
  bioText: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '80%' },
  orLine: { flex: 1, height: 1, backgroundColor: '#2a3550' },
  orText: { color: '#64748B', marginHorizontal: 10, fontSize: 12 },
  input: { backgroundColor: '#16213E', borderRadius: 12, padding: 14, fontSize: 28, color: '#D4AF37', letterSpacing: 8, borderWidth: 2, borderColor: '#D4AF3740', width: '80%', textAlign: 'center' },
  btn: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, marginTop: 20, width: '80%', alignItems: 'center' },
  btnText: { color: '#0A1128', fontSize: 17, fontWeight: 'bold' },
});
