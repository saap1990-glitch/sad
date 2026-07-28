import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InventoryIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: '📦 الأصناف',
      items: [
        { icon: '📦', label: 'الأصناف', route: '/inventory/items' },
        { icon: '📁', label: 'التصنيفات', route: '/inventory/categories' },
        { icon: '🏷️', label: 'الماركات', route: '/inventory/brands' },
        { icon: '📏', label: 'وحدات القياس', route: '/inventory/units' },
      ]
    },
    {
      title: '🏪 المشتريات والموردين',
      items: [
        { icon: '🛒', label: 'فاتورة شراء', route: '/inventory/purchase-invoice' },
        { icon: '↩️', label: 'مرتجع شراء', route: '/inventory/purchase-return' },
        { icon: '🏪', label: 'الموردون', route: '/inventory/suppliers' },
      ]
    },
    {
      title: '🏭 المخازن والحركات',
      items: [
        { icon: '🏭', label: 'المخازن', route: '/inventory/warehouses' },
        { icon: '📤', label: 'صرف مخزون', route: '/inventory/inventory-issue' },
        { icon: '📥', label: 'استلام مخزون', route: '/inventory/inventory-receipt' },
        { icon: '🔄', label: 'تحويل بين المخازن', route: '/inventory/warehouse-transfer' },
      ]
    },
    {
      title: '📊 الجرد والتقارير',
      items: [
        { icon: '🔢', label: 'جرد المخزون', route: '/inventory/stock-count' },
        { icon: '⚙️', label: 'تسوية المخزون', route: '/inventory/stock-adjustment' },
        { icon: '📋', label: 'حركة الصنف', route: '/inventory/item-movement' },
        { icon: '📊', label: 'تقرير الكميات', route: '/inventory/qty-report' },
        { icon: '💰', label: 'تقرير التكاليف', route: '/inventory/cost-report' },
      ]
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1128" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>📦 المخزون والمشتريات</Text>
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
