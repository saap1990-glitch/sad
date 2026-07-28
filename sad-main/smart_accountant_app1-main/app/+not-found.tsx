import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.title}>الصفحة غير موجودة</Text>
      <Text style={styles.subtitle}>404 - Page Not Found</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.btnText}>العودة للرئيسية</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128' },
  emoji: { fontSize: 60, marginBottom: 20 },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#64748B', fontSize: 14, marginTop: 8, marginBottom: 30 },
  btn: { backgroundColor: '#D4AF37', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
