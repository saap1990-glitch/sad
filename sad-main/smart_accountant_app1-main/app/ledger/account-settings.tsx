import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState('YER');
  const [autoNumbering, setAutoNumbering] = useState(true);
  const [defaultCashAccount, setDefaultCashAccount] = useState('');
  const [defaultBankAccount, setDefaultBankAccount] = useState('');

  useEffect(() => {
    if (isReady && db) loadSettings();
  }, [isReady, db]);

  const loadSettings = async () => {
    if (!db) return;
    try {
      const base = await db.getFirstAsync("SELECT code FROM currencies WHERE is_base=1") as any;
      setBaseCurrency(base?.code || 'YER');

      const cashAcc = await db.getFirstAsync("SELECT a.code FROM system_accounts sa JOIN accounts a ON a.id = sa.account_id WHERE sa.key = 'cash_account'") as any;
      setDefaultCashAccount(cashAcc?.code || '110101');

      const bankAcc = await db.getFirstAsync("SELECT a.code FROM system_accounts sa JOIN accounts a ON a.id = sa.account_id WHERE sa.key = 'bank_account'") as any;
      setDefaultBankAccount(bankAcc?.code || '');

      const numbering = await db.getFirstAsync("SELECT value FROM settings WHERE key = 'auto_number_accounts'") as any;
      setAutoNumbering(numbering?.value !== 'false');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!db) return;
    try {
      // تحديث العملة الأساسية
      await db.runAsync("UPDATE currencies SET is_base = 0");
      await db.runAsync("UPDATE currencies SET is_base = 1 WHERE code = ?", [baseCurrency]);

      // تحديث الحسابات الافتراضية
      const cashAcc = await db.getFirstAsync("SELECT id FROM accounts WHERE code = ?", [defaultCashAccount]) as any;
      if (cashAcc) await db.runAsync("UPDATE system_accounts SET account_id = ? WHERE key = 'cash_account'", [cashAcc.id]);

      const bankAcc = await db.getFirstAsync("SELECT id FROM accounts WHERE code = ?", [defaultBankAccount]) as any;
      if (bankAcc) await db.runAsync("INSERT OR REPLACE INTO system_accounts (key, account_id) VALUES ('bank_account', ?)", [bankAcc.id]);

      // حفظ الترقيم التلقائي
      await db.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_number_accounts', ?)", [autoNumbering ? 'true' : 'false']);

      Alert.alert('✅', 'تم حفظ الإعدادات');
    } catch (e) { console.error(e); Alert.alert('خطأ', 'فشل حفظ الإعدادات'); }
  };

  if (!isReady || loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;
  }

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.t}>⚙️ إعدادات الحسابات</Text>
        <TouchableOpacity onPress={saveSettings}><Text style={styles.saveBtn}>💾 حفظ</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* العملة الأساسية */}
        <Text style={styles.sectionTitle}>💱 العملة الأساسية</Text>
        <View style={styles.currencyRow}>
          {['YER', 'USD', 'SAR'].map(code => (
            <TouchableOpacity
              key={code}
              style={[styles.currencyBtn, baseCurrency === code && styles.currencyBtnActive]}
              onPress={() => setBaseCurrency(code)}
            >
              <Text style={[styles.currencyBtnText, baseCurrency === code && styles.currencyBtnTextActive]}>{code}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* الترقيم التلقائي */}
        <Text style={styles.sectionTitle}>🔢 الترقيم التلقائي</Text>
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[styles.switchBtn, autoNumbering && styles.switchBtnActive]}
            onPress={() => setAutoNumbering(true)}
          >
            <Text style={[styles.switchText, autoNumbering && styles.switchTextActive]}>✅ تلقائي</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, !autoNumbering && styles.switchBtnActive]}
            onPress={() => setAutoNumbering(false)}
          >
            <Text style={[styles.switchText, !autoNumbering && styles.switchTextActive]}>❌ يدوي</Text>
          </TouchableOpacity>
        </View>

        {/* الحسابات الافتراضية */}
        <Text style={styles.sectionTitle}>🏦 الحسابات الافتراضية</Text>
        <View style={styles.inputRow}>
          <Text style={styles.label}>حساب الصندوق</Text>
          <TextInput
            style={styles.input}
            value={defaultCashAccount}
            onChangeText={setDefaultCashAccount}
            placeholder="مثال: 110101"
            placeholderTextColor="#666"
            textAlign="right"
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>حساب البنك</Text>
          <TextInput
            style={styles.input}
            value={defaultBankAccount}
            onChangeText={setDefaultBankAccount}
            placeholder="مثال: 110201"
            placeholderTextColor="#666"
            textAlign="right"
          />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#0E1630', borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  back: { fontSize: 22, color: '#D4AF37' },
  t: { color: '#D4AF37', fontSize: 17, fontWeight: 'bold' },
  saveBtn: { color: '#10B981', fontSize: 16, fontWeight: 'bold', padding: 8 },
  content: { padding: 16 },
  sectionTitle: { color: '#D4AF37', fontSize: 15, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  currencyRow: { flexDirection: 'row', gap: 10 },
  currencyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: '#16213E', borderWidth: 2, borderColor: '#2a3550' },
  currencyBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3720' },
  currencyBtnText: { color: '#94A3B8', fontSize: 16 },
  currencyBtnTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', gap: 10 },
  switchBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#16213E', borderWidth: 1, borderColor: '#2a3550', alignItems: 'center' },
  switchBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3720' },
  switchText: { color: '#94A3B8', fontSize: 14 },
  switchTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  inputRow: { marginBottom: 12 },
  label: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  input: { backgroundColor: '#16213E', borderRadius: 8, padding: 12, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: '#2a3550' },
});
