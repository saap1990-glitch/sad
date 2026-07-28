import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LedgerIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: '📂 دليل الحسابات',
      items: [
        { icon: '📊', label: 'شجرة الحسابات', route: '/ledger/accounts' },
        { icon: '📁', label: 'مجموعات الحسابات', route: '/ledger/account-groups' },
        { icon: '📄', label: 'تفاصيل الحساب', route: '/ledger/account-details' },
        { icon: '💵', label: 'أرصدة العملات', route: '/ledger/account-balances' },
        { icon: '⚙️', label: 'إعدادات الحسابات', route: '/ledger/account-settings' },
      ]
    },
    {
      title: '💰 الخزينة',
      items: [
        { icon: '💰', label: 'الصناديق', route: '/ledger/cash-boxes' },
        { icon: '📥', label: 'سند قبض', route: '/ledger/cash-receipt' },
        { icon: '📤', label: 'سند صرف', route: '/ledger/cash-payment' },
        { icon: '🏦', label: 'البنوك', route: '/ledger/banks' },
        { icon: '💱', label: 'شركات الصرافة', route: '/ledger/exchange-companies' },
        { icon: '📱', label: 'المحافظ', route: '/ledger/ewallets' },
        { icon: '💱', label: 'العملات', route: '/ledger/currencies' },
      ]
    },
    {
      title: '📝 العمليات المحاسبية',
      items: [
        { icon: '📝', label: 'قيد يومية', route: '/ledger/journal-entry' },
        { icon: '🔄', label: 'قيد متكرر', route: '/ledger/recurring-journal' },
        { icon: '🧾', label: 'سندات', route: '/ledger/vouchers' },
        { icon: '📋', label: 'كشف حساب', route: '/ledger/account-statement' },
        { icon: '📖', label: 'الأستاذ العام', route: '/ledger/general-ledger' },
        { icon: '⚖️', label: 'ميزان المراجعة', route: '/ledger/trial-balance' },
        { icon: '📊', label: 'تقارير العملات', route: '/ledger/currency-reports' },
      ]
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1128" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>📊 الحسابات والمالية</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView>
        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity key={iIdx} style={styles.card} onPress={() => router.push(item.route as any)}>
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  backBtn: { fontSize: 22, color: '#D4AF37', padding: 6 },
  title: { color: '#D4AF37', fontSize: 17, fontWeight: 'bold' },
  section: { paddingHorizontal: 12, marginTop: 16 },
  sectionTitle: { color: '#D4AF37', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: '31%', backgroundColor: '#16213E', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  cardIcon: { fontSize: 24, marginBottom: 6 },
  cardLabel: { color: '#FFF', fontSize: 11, textAlign: 'center' },
});
