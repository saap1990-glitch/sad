import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SalesIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: '👥 العملاء',
      items: [
        { icon: '👤', label: 'العملاء', route: '/sales/customers' },
        { icon: '📁', label: 'مجموعات العملاء', route: '/sales/customer-groups' },
        { icon: '📊', label: 'مبيعات العملاء', route: '/sales/customer-sales' },
      ]
    },
    {
      title: '🧾 المبيعات',
      items: [
        { icon: '🧾', label: 'فاتورة مبيعات', route: '/sales/sales-invoice' },
        { icon: '↩️', label: 'مرتجع مبيعات', route: '/sales/sales-return' },
        { icon: '📋', label: 'عرض أسعار', route: '/sales/quotation' },
        { icon: '📊', label: 'ملخص المبيعات', route: '/sales/summary' },
        { icon: '📦', label: 'مبيعات الأصناف', route: '/sales/item-sales' },
      ]
    },
    {
      title: '👨‍💼 المندوبين',
      items: [
        { icon: '👨‍💼', label: 'المندوبين', route: '/sales/reps' },
        { icon: '📈', label: 'أداء المندوبين', route: '/sales/rep-performance' },
        { icon: '🎯', label: 'تحفيز المندوبين', route: '/sales/rep-motivation' },
      ]
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1128" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>🛒 المبيعات والعملاء</Text>
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
