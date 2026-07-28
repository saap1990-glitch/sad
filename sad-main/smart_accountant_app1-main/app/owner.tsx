import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../src/context/DatabaseContext';

// بيانات محاكاة للاشتراكات (تستبدل بقاعدة بيانات حقيقية لاحقاً)
const MOCK_SUBSCRIPTIONS = [
  {
    id: 1,
    user: 'demo@example.com',
    plan: 'شهري',
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    status: 'active',
    deviceId: 'ABC123',
  },
  {
    id: 2,
    user: 'test@test.com',
    plan: 'سنوي',
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    status: 'active',
    deviceId: 'DEF456',
  },
];

export default function OwnerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();

  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    user: '',
    plan: 'شهري',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
  });

  useEffect(() => {
    // في الواقع يتم جلب الاشتراكات من الخادم أو قاعدة البيانات
    setTimeout(() => {
      setSubscriptions(MOCK_SUBSCRIPTIONS);
      setLoading(false);
    }, 500);
  }, []);

  const handleActivate = (sub: any) => {
    Alert.alert('تفعيل', `تم تفعيل اشتراك ${sub.user}`, [{ text: 'حسناً' }]);
    // تحديث محلي
    setSubscriptions(subs => subs.map(s => s.id === sub.id ? { ...s, status: 'active' } : s));
  };

  const handleDeactivate = (sub: any) => {
    Alert.alert('إلغاء', `تم إلغاء اشتراك ${sub.user}`, [{ text: 'حسناً' }]);
    setSubscriptions(subs => subs.map(s => s.id === sub.id ? { ...s, status: 'inactive' } : s));
  };

  const handleRenew = (sub: any) => {
    Alert.alert('تجديد', `تم تجديد اشتراك ${sub.user}`, [{ text: 'حسناً' }]);
    const newEnd = new Date();
    newEnd.setMonth(newEnd.getMonth() + (sub.plan === 'سنوي' ? 12 : 1));
    setSubscriptions(subs => subs.map(s => s.id === sub.id ? { ...s, endDate: newEnd.toISOString().split('T')[0] } : s));
  };

  const handleAddSubscription = () => {
    if (!newSubscription.user || !newSubscription.endDate) {
      Alert.alert('خطأ', 'يرجى ملء البريد الإلكتروني وتاريخ الانتهاء');
      return;
    }
    const sub = {
      id: Date.now(),
      user: newSubscription.user,
      plan: newSubscription.plan,
      startDate: newSubscription.startDate,
      endDate: newSubscription.endDate,
      status: newSubscription.status,
      deviceId: 'N/A',
    };
    setSubscriptions([sub, ...subscriptions]);
    setShowAddModal(false);
    setNewSubscription({ user: '', plan: 'شهري', startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'active' });
  };

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiredCount = subscriptions.filter(s => new Date(s.endDate) < new Date()).length;

  if (!isReady || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔐 إدارة الاشتراكات</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtn}>➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* إحصائيات سريعة */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: '#10B981' }]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{subscriptions.length}</Text>
            <Text style={styles.statLabel}>إجمالي الاشتراكات</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#3B82F6' }]}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>النشطة</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#EF4444' }]}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{expiredCount}</Text>
            <Text style={styles.statLabel}>منتهية</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>📋 قائمة الاشتراكات</Text>

        {subscriptions.map((sub) => (
          <View key={sub.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userEmail}>{sub.user}</Text>
                <Text style={styles.planInfo}>{sub.plan} | {sub.startDate} → {sub.endDate}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: sub.status === 'active' ? '#10B98120' : '#EF444420' }]}>
                <Text style={{ color: sub.status === 'active' ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                  {sub.status === 'active' ? '✅ نشط' : '⏸️ موقوف'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B98120' }]} onPress={() => handleActivate(sub)}>
                <Text style={styles.actionText}>تفعيل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF444420' }]} onPress={() => handleDeactivate(sub)}>
                <Text style={styles.actionText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F59E0B20' }]} onPress={() => handleRenew(sub)}>
                <Text style={styles.actionText}>تجديد</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {subscriptions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد اشتراكات حالياً</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal إضافة اشتراك جديد */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>➕ إضافة اشتراك جديد</Text>
            <TextInput style={styles.modalInput} placeholder="البريد الإلكتروني" value={newSubscription.user} onChangeText={(v) => setNewSubscription({ ...newSubscription, user: v })} placeholderTextColor="#666" />
            <View style={styles.planRow}>
              <TouchableOpacity style={[styles.planBtn, newSubscription.plan === 'شهري' && styles.planBtnActive]} onPress={() => setNewSubscription({ ...newSubscription, plan: 'شهري' })}>
                <Text style={{ color: newSubscription.plan === 'شهري' ? '#D4AF37' : '#FFF' }}>شهري</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.planBtn, newSubscription.plan === 'سنوي' && styles.planBtnActive]} onPress={() => setNewSubscription({ ...newSubscription, plan: 'سنوي' })}>
                <Text style={{ color: newSubscription.plan === 'سنوي' ? '#D4AF37' : '#FFF' }}>سنوي</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.modalInput} placeholder="تاريخ البداية (YYYY-MM-DD)" value={newSubscription.startDate} onChangeText={(v) => setNewSubscription({ ...newSubscription, startDate: v })} placeholderTextColor="#666" />
            <TextInput style={styles.modalInput} placeholder="تاريخ النهاية (YYYY-MM-DD)" value={newSubscription.endDate} onChangeText={(v) => setNewSubscription({ ...newSubscription, endDate: v })} placeholderTextColor="#666" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#2a3550' }]} onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#D4AF37' }]} onPress={handleAddSubscription}>
                <Text style={styles.modalBtnText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0E1630', borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  backBtn: { fontSize: 22, color: '#D4AF37' },
  title: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  addBtn: { fontSize: 24, color: '#D4AF37' },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#16213E', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  card: { backgroundColor: '#16213E', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a3550' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userEmail: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  planInfo: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94A3B8', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
  modalContainer: { backgroundColor: '#0E1630', borderRadius: 16, padding: 20 },
  modalTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: { backgroundColor: '#16213E', borderRadius: 8, padding: 12, color: '#FFF', marginBottom: 10, borderWidth: 1, borderColor: '#2a3550', fontSize: 14 },
  planRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  planBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#16213E', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  planBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3720' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});
