import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportsIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const reports = [
    { icon: '📊', label: 'الميزانية العمومية', desc: 'الأصول والخصوم وحقوق الملكية', route: '/reports/balance-sheet', color: '#10B981' },
    { icon: '📈', label: 'قائمة الدخل', desc: 'الإيرادات والمصروفات والأرباح', route: '/reports/income-statement', color: '#3B82F6' },
    { icon: '💵', label: 'التدفقات النقدية', desc: 'حركة النقد الداخلة والخارجة', route: '/reports/cash-flow', color: '#F59E0B' },
    { icon: '📦', label: 'تقرير المخزون', desc: 'حالة المخزون والأصناف', route: '/reports/stock-report', color: '#8B5CF6' },
    { icon: '🔔', label: 'التنبيهات', desc: 'تنبيهات المخزون والديون', route: '/reports/alerts', color: '#EF4444' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1128" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>📈 التقارير والتحليلات</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView>
        <View style={styles.list}>
          {reports.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.card, { borderLeftColor: item.color, borderLeftWidth: 3 }]} onPress={() => router.push(item.route as any)}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: item.color }]}>{item.label}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  backBtn: { fontSize: 22, color: '#D4AF37', padding: 6 },
  title: { color: '#D4AF37', fontSize: 17, fontWeight: 'bold' },
  list: { padding: 12, gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213E', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2a3550' },
  cardIcon: { fontSize: 28, marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  cardDesc: { color: '#94A3B8', fontSize: 11 },
  arrow: { color: '#D4AF37', fontSize: 18 },
});
