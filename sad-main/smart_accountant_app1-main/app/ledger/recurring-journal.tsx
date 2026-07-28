import { eventBus, Events } from '../../src/events/eventBus';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecurringJournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>🔄 قيود متكررة</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}><Text style={styles.text}>🚧 قيد التطوير</Text></View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { fontSize: 24, color: '#D4AF37', padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#94A3B8', fontSize: 16 },
});
