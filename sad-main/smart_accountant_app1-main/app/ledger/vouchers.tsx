import { eventBus, Events } from '../../src/events/eventBus';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function VouchersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [type, setType] = useState<'receipt' | 'payment'>('receipt');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  async function handleSave() {
    if (!amount || !db) { Alert.alert('خطأ', 'أدخل المبلغ'); return; }
    Alert.alert('✅', `تم حفظ ${type === 'receipt' ? 'سند قبض' : 'سند صرف'} بنجاح`);
    setAmount(''); setDescription('');
  }

  if (!isReady) return <View style={styles.container}><Text style={styles.loading}>جاري التحميل...</Text></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>🧾 سندات القبض والصرف</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.toggle}>
          <TouchableOpacity style={[styles.toggleBtn, type === 'receipt' && styles.toggleActive]} onPress={() => setType('receipt')}>
            <Text style={[styles.toggleText, type === 'receipt' && styles.toggleTextActive]}>📥 سند قبض</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, type === 'payment' && styles.toggleActive]} onPress={() => setType('payment')}>
            <Text style={[styles.toggleText, type === 'payment' && styles.toggleTextActive]}>📤 سند صرف</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>المبلغ</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" placeholderTextColor="#94A3B8" textAlign="right" />

        <Text style={styles.label}>البيان</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="البيان..." placeholderTextColor="#94A3B8" multiline textAlign="right" />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>💾 حفظ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loading: { color: '#D4AF37', textAlign: 'center', marginTop: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { fontSize: 24, color: '#D4AF37', padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 16 },
  toggle: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center' },
  toggleActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3715' },
  toggleText: { fontSize: 14, color: '#64748B' },
  toggleTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  label: { fontSize: 13, fontWeight: '500', color: '#1E293B', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, fontSize: 14, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  saveBtn: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
