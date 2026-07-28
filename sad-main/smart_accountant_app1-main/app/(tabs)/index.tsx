import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function HomeTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  
  // حالة القوائم المنسدلة - الكل مقفول أول مرة
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  const sections = [
    {
      id: 'finance',
      icon: '📊',
      title: 'الحسابات والمالية',
      color: '#10B981',
      items: [
        { icon: '📊', label: 'دليل الحسابات', route: '/ledger/accounts' },
        { icon: '📁', label: 'مجموعات الحسابات', route: '/ledger/account-groups' },
        { icon: '💰', label: 'الصناديق', route: '/ledger/cash-boxes' },
        { icon: '📥', label: 'سند قبض', route: '/ledger/cash-receipt' },
        { icon: '📤', label: 'سند صرف', route: '/ledger/cash-payment' },
        { icon: '🏦', label: 'البنوك', route: '/ledger/banks' },
        { icon: '💱', label: 'شركات الصرافة', route: '/ledger/exchange-companies' },
        { icon: '📱', label: 'المحافظ', route: '/ledger/ewallets' },
        { icon: '📝', label: 'قيد يومية', route: '/ledger/journal-entry' },
        { icon: '📋', label: 'كشف حساب', route: '/ledger/account-statement' },
        { icon: '⚖️', label: 'ميزان مراجعة', route: '/ledger/trial-balance' },
        { icon: '📖', label: 'الأستاذ العام', route: '/ledger/general-ledger' },
        { icon: '💱', label: 'العملات', route: '/ledger/currencies' },
      ]
    },
    {
      id: 'sales',
      icon: '🛒',
      title: 'المبيعات والعملاء',
      color: '#3B82F6',
      items: [
        { icon: '👤', label: 'العملاء', route: '/sales/customers' },
        { icon: '📁', label: 'مجموعات العملاء', route: '/sales/customer-groups' },
        { icon: '🧾', label: 'فاتورة مبيعات', route: '/sales/sales-invoice' },
        { icon: '↩️', label: 'مرتجع مبيعات', route: '/sales/sales-return' },
        { icon: '📋', label: 'عرض أسعار', route: '/sales/quotation' },
        { icon: '📊', label: 'ملخص المبيعات', route: '/sales/summary' },
        { icon: '👨‍💼', label: 'المندوبين', route: '/sales/reps' },
      ]
    },
    {
      id: 'inventory',
      icon: '📦',
      title: 'المخزون والمشتريات',
      color: '#F59E0B',
      items: [
        { icon: '📦', label: 'الأصناف', route: '/inventory/items' },
        { icon: '🏪', label: 'الموردون', route: '/inventory/suppliers' },
        { icon: '🛒', label: 'فاتورة شراء', route: '/inventory/purchase-invoice' },
        { icon: '↩️', label: 'مرتجع شراء', route: '/inventory/purchase-return' },
        { icon: '🏭', label: 'المخازن', route: '/inventory/warehouses' },
        { icon: '📤', label: 'صرف مخزون', route: '/inventory/inventory-issue' },
        { icon: '📥', label: 'استلام مخزون', route: '/inventory/inventory-receipt' },
        { icon: '🔢', label: 'جرد المخزون', route: '/inventory/stock-count' },
      ]
    },
    {
      id: 'reports',
      icon: '📈',
      title: 'التقارير والتحليلات',
      color: '#8B5CF6',
      items: [
        { icon: '📊', label: 'الميزانية العمومية', route: '/reports/balance-sheet' },
        { icon: '📈', label: 'قائمة الدخل', route: '/reports/income-statement' },
        { icon: '💵', label: 'التدفقات النقدية', route: '/reports/cash-flow' },
        { icon: '📦', label: 'تقرير المخزون', route: '/reports/stock-report' },
        { icon: '🔔', label: 'التنبيهات', route: '/reports/alerts' },
      ]
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1128" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💎</Text>
          <View style={{marginLeft:12}}>
            <Text style={styles.appName}>دفتر المحاسب الذكي</Text>
            <Text style={styles.appNameEn}>Smart Accountant</Text>
          </View>
        </View>

        {/* القوائم المنسدلة */}
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          
          return (
            <View key={section.id} style={styles.sectionContainer}>
              {/* رأس القسم - قابل للضغط */}
              <TouchableOpacity
                style={[styles.sectionHeader, { borderLeftColor: section.color }]}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
                <Text style={styles.sectionCount}>{section.items.length}</Text>
                <Text style={[styles.arrow, isOpen && styles.arrowOpen]}>{isOpen ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {/* المحتوى المنسدل */}
              {isOpen && (
                <View style={styles.dropdownContent}>
                  <View style={styles.grid}>
                    {section.items.map((item, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.card, { borderColor: section.color + '30' }]}
                        onPress={() => router.push(item.route as any)}
                      >
                        <Text style={styles.cardIcon}>{item.icon}</Text>
                        <Text style={styles.cardLabel}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* أدوات سريعة */}
        <View style={styles.tools}>
          <TouchableOpacity style={styles.tool} onPress={() => router.push('/settings' as any)}>
            <Text style={styles.toolIcon}>⚙️</Text>
            <Text style={styles.toolLabel}>الإعدادات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tool} onPress={() => router.push('/backup' as any)}>
            <Text style={styles.toolIcon}>💾</Text>
            <Text style={styles.toolLabel}>نسخ احتياطي</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tool} onPress={() => router.push('/about' as any)}>
            <Text style={styles.toolIcon}>ℹ️</Text>
            <Text style={styles.toolLabel}>عن التطبيق</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>الإصدار 1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  logo: { fontSize: 40 },
  appName: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  appNameEn: { color: '#64748B', fontSize: 11, letterSpacing: 1 },

  // Section
  sectionContainer: { marginHorizontal: 12, marginTop: 8 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213E',
    padding: 14, borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1, borderColor: '#2a3550',
  },
  sectionIcon: { fontSize: 22, marginRight: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  sectionCount: { 
    backgroundColor: '#0A1128', color: '#94A3B8',
    fontSize: 11, fontWeight: 'bold',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    marginRight: 8,
  },
  arrow: { fontSize: 12, color: '#D4AF37' },
  arrowOpen: { transform: [{ rotate: '0deg' }] },

  // Dropdown
  dropdownContent: { 
    backgroundColor: '#0E1630',
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    padding: 10,
    borderWidth: 1, borderColor: '#2a3550', borderTopWidth: 0,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  card: {
    width: '31%',
    backgroundColor: '#16213E',
    padding: 10, borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#2a3550',
  },
  cardIcon: { fontSize: 18, marginBottom: 3 },
  cardLabel: { color: '#FFF', fontSize: 9, textAlign: 'center' },

  // Tools
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 20 },
  tool: { alignItems: 'center' },
  toolIcon: { fontSize: 22 },
  toolLabel: { color: '#94A3B8', fontSize: 10, marginTop: 3 },

  version: { color: '#475569', fontSize: 10, textAlign: 'center', marginTop: 16 },
});

// تمت إضافة التحديث التلقائي
