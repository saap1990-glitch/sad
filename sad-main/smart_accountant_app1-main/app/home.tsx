import { eventBus, Events } from '../src/events/eventBus';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>🏠 الرئيسية</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.logo}>💎</Text>
        <Text style={styles.appName}>دفتر المحاسب الذكي</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)' as any)}>
          <Text style={styles.btnText}>فتح التطبيق</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#16213E', borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  backBtn: { fontSize: 24, color: '#D4AF37', padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 70, marginBottom: 16 },
  appName: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  btn: { backgroundColor: '#D4AF37', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  btnText: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
