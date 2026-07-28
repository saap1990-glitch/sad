import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { LicenseService } from '../src/services/LicenseService';
import { AuthService } from '../src/services/AuthService';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [licenseBlocked, setLicenseBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  useEffect(() => {
    async function init() {
      try {
        // 1. فحص الترخيص
        const licenseInfo = await LicenseService.checkLicense();
        if (licenseInfo.tampered && !licenseInfo.valid) {
          setLicenseBlocked(true);
          setBlockMessage(licenseInfo.message);
          setIsLoading(false);
          return;
        }

        // 2. فحص وسائل الحماية
        const pinEnabled = await AuthService.isPinEnabled();
        const bioEnabled = await AuthService.isBiometricEnabled();

        if (pinEnabled || bioEnabled) {
          setNeedsAuth(true);
        }

        setIsLoading(false);
      } catch (e) {
        console.error('Init error:', e);
        setIsLoading(false);
      }
    }
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.text}>جاري التحميل...</Text>
      </View>
    );
  }

  if (licenseBlocked) {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedIcon}>🚫</Text>
        <Text style={styles.blockedTitle}>التطبيق مقفل</Text>
        <Text style={styles.blockedMessage}>{blockMessage}</Text>
      </View>
    );
  }

  // إذا PIN أو بصمة مفعلين → شاشة الدخول
  if (needsAuth) {
    return <Redirect href="/login" />;
  }

  // غير ذلك → الرئيسية مباشرة
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128' },
  text: { color: '#D4AF37', marginTop: 10, fontSize: 16 },
  blockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128', padding: 30 },
  blockedIcon: { fontSize: 80, marginBottom: 20 },
  blockedTitle: { color: '#EF4444', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  blockedMessage: { color: '#FFF', fontSize: 16, textAlign: 'center' },
});
