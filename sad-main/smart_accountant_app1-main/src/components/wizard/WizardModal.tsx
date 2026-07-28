import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { accountCreationService } from '../../services/AccountCreationService';

interface WizardModalProps {
  visible: boolean;
  onClose: () => void;
  db: SQLite.SQLiteDatabase | null;
}

const ACCOUNT_TYPES = [
  { key: 'asset', label: 'أصول', icon: '🏦', color: '#10B981' },
  { key: 'liability', label: 'خصوم', icon: '💳', color: '#EF4444' },
  { key: 'expense', label: 'مصروفات', icon: '📊', color: '#F59E0B' },
  { key: 'revenue', label: 'إيرادات', icon: '💰', color: '#3B82F6' },
];

const CATEGORIES: any = {
  asset: [
    { label: 'صندوق', icon: '💰', parentCode: '1101', systemKey: 'cash_account' },
    { label: 'بنك', icon: '🏦', parentCode: '1102', systemKey: 'bank_parent' },
    { label: 'شركة صرافة', icon: '💱', parentCode: '1103', systemKey: 'exchange_parent' },
    { label: 'محفظة إلكترونية', icon: '📱', parentCode: '1104', systemKey: 'wallet_parent' },
    { label: 'عميل', icon: '👤', parentCode: '1105', systemKey: 'customer_parent' },
    { label: 'مخزون', icon: '📦', parentCode: '1106', systemKey: 'inventory_account' },
    { label: 'عهدة', icon: '💵', parentCode: '1107', systemKey: 'asset' },
    { label: 'أرض', icon: '🏗️', parentCode: '1201', systemKey: 'asset' },
    { label: 'مبنى', icon: '🏢', parentCode: '1202', systemKey: 'asset' },
    { label: 'سيارة', icon: '🚗', parentCode: '1203', systemKey: 'asset' },
    { label: 'جهاز', icon: '💻', parentCode: '1204', systemKey: 'asset' },
    { label: 'أثاث', icon: '🪑', parentCode: '1205', systemKey: 'asset' },
  ],
  liability: [
    { label: 'مورد', icon: '🏪', parentCode: '2101', systemKey: 'supplier_parent' },
    { label: 'قرض', icon: '🏛️', parentCode: '2201', systemKey: 'liability' },
  ],
  expense: [
    { label: 'رواتب', icon: '💵', parentCode: '3101', systemKey: 'expense' },
    { label: 'إيجار', icon: '🏠', parentCode: '3102', systemKey: 'expense' },
  ],
  revenue: [
    { label: 'مبيعات', icon: '🛒', parentCode: '4101', systemKey: 'revenue' },
  ],
};

export default function WizardModal({ visible, onClose, db }: WizardModalProps) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState('asset');
  const [category, setCategory] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [currencyCode, setCurrencyCode] = useState('YER');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!db) return;
    if (!nameAr.trim()) { Alert.alert('خطأ', 'أدخل اسم الحساب'); return; }
    const cat = CATEGORIES[type]?.find((c: any) => c.label === category);
    if (!cat) { Alert.alert('خطأ', 'اختر التصنيف'); return; }

    setLoading(true);
    try {
      // استخدام AccountCreationService مباشرة (هذه ليست كيانًا، بل حسابًا عامًا)
      // لكن الخدمة الحالية تتطلب entityId، لذا سنستخدم المنطق القديم النظيف
      const parent = await db.getFirstAsync('SELECT * FROM accounts WHERE code = ?', [cat.parentCode]) as any;
      if (!parent) { Alert.alert('خطأ', 'الحساب الأب غير موجود'); setLoading(false); return; }

      const lastChild = await db.getFirstAsync("SELECT code FROM accounts WHERE code LIKE ?||'%' ORDER BY code DESC LIMIT 1", [cat.parentCode]) as any;
      let newCode = `${cat.parentCode}01`;
      if (lastChild) {
        const num = parseInt(lastChild.code.substring(cat.parentCode.length)) || 0;
        newCode = cat.parentCode + String(num + 1).padStart(2, '0');
      }

      const foreignAmount = parseFloat(openingBalance) || 0;
      const rate = currencyCode === 'YER' ? 1 : (await db.getFirstAsync("SELECT rate FROM exchange_rates WHERE currency_id = (SELECT id FROM currencies WHERE code = ?) ORDER BY date DESC LIMIT 1", [currencyCode]) as any)?.rate || 1;
      const baseAmount = foreignAmount * rate;
      const curId = (await db.getFirstAsync("SELECT id FROM currencies WHERE code = ?", [currencyCode]) as any)?.id || 1;

      const result = await db.runAsync(
        `INSERT INTO accounts (code, name_ar, name_en, parent_id, level, type, nature, currency_id, opening_balance, current_balance, is_postable, is_virtual, is_system, is_leaf, is_active, notes) VALUES (?,?,?,?,?,?,?,?,?,?,1,0,0,1,1,?)`,
        [newCode, nameAr, nameAr, parent.id, parent.level + 1, parent.type, parent.nature, curId, baseAmount, baseAmount, '']
      );

      if (currencyCode !== 'YER' && foreignAmount > 0) {
        await db.runAsync("INSERT INTO account_balances (account_id, currency_code, balance) VALUES (?,?,?)", [result.lastInsertRowId, currencyCode, foreignAmount]);
      }

      // تحديث الآباء
      await db.execAsync(`
        UPDATE accounts SET current_balance = (SELECT COALESCE(SUM(sub.current_balance), 0) FROM accounts sub WHERE sub.parent_id = accounts.id) WHERE id = ${parent.id}
      `);

      Alert.alert('✅', `تم إنشاء الحساب: ${newCode}`);
      onClose();
    } catch (e: any) { Alert.alert('خطأ', e.message || 'فشل إنشاء الحساب'); }
    setLoading(false);
  };

  // باقي الكود (الواجهة) كما هو...
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>🧙 معالج إنشاء حساب</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          {/* نفس واجهة الخطوات السابقة */}
          <View style={styles.stepsRow}>
            {['النوع', 'التصنيف', 'التفاصيل'].map((s, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepCircle, step >= i && styles.stepActive]}>
                  <Text style={[styles.stepNum, step >= i && styles.stepNumActive]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, step >= i && styles.stepLabelActive]}>{s}</Text>
              </View>
            ))}
          </View>
          <ScrollView style={{ maxHeight: 350 }}>
            {step === 0 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>اختر نوع الحساب:</Text>
                <View style={styles.grid}>
                  {ACCOUNT_TYPES.map((t) => (
                    <TouchableOpacity key={t.key} style={[styles.card, type === t.key && { borderColor: t.color, backgroundColor: t.color + '20' }]} onPress={() => { setType(t.key); setCategory(''); setStep(1); }}>
                      <Text style={styles.cardIcon}>{t.icon}</Text>
                      <Text style={[styles.cardLabel, type === t.key && { color: t.color }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>اختر التصنيف:</Text>
                <View style={styles.grid}>
                  {(CATEGORIES[type] || []).map((cat: any) => (
                    <TouchableOpacity key={cat.label} style={[styles.card, category === cat.label && { borderColor: '#8B5CF6' }]} onPress={() => { setCategory(cat.label); setStep(2); }}>
                      <Text style={styles.cardIcon}>{cat.icon}</Text>
                      <Text style={styles.cardLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setStep(0)} style={styles.backBtn}><Text style={styles.backText}>← رجوع</Text></TouchableOpacity>
              </View>
            )}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.question}>تفاصيل الحساب:</Text>
                <Text style={styles.summary}>النوع: {ACCOUNT_TYPES.find(t=>t.key===type)?.label} | التصنيف: {category}</Text>
                <Text style={styles.inputLabel}>اسم الحساب *</Text>
                <TextInput style={styles.input} value={nameAr} onChangeText={setNameAr} placeholder="الاسم" placeholderTextColor="#666" textAlign="right" />
                <Text style={styles.inputLabel}>الرصيد الافتتاحي</Text>
                <TextInput style={styles.input} value={openingBalance} onChangeText={setOpeningBalance} placeholder="0" keyboardType="numeric" placeholderTextColor="#666" textAlign="right" />
                <Text style={styles.inputLabel}>العملة</Text>
                <View style={styles.curRow}>
                  {['YER', 'USD', 'SAR'].map(c => (
                    <TouchableOpacity key={c} style={[styles.curBtn, currencyCode === c && styles.curBtnActive]} onPress={() => setCurrencyCode(c)}>
                      <Text style={[styles.curText, currencyCode === c && styles.curTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
                  <Text style={styles.createText}>{loading ? '⏳' : '💾 إنشاء الحساب'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}><Text style={styles.backText}>← رجوع</Text></TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modal: { backgroundColor: '#0E1630', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  title: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  close: { color: '#EF4444', fontSize: 22 },
  stepsRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 24 },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2a3550' },
  stepActive: { borderColor: '#8B5CF6', backgroundColor: '#8B5CF620' },
  stepNum: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  stepNumActive: { color: '#8B5CF6' },
  stepLabel: { color: '#64748B', fontSize: 10, marginTop: 4 },
  stepLabelActive: { color: '#8B5CF6' },
  stepContent: { padding: 16 },
  question: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  card: { width: '44%', backgroundColor: '#16213E', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#2a3550' },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardLabel: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  summary: { color: '#D4AF37', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  inputLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#16213E', borderRadius: 8, padding: 10, color: '#FFF', fontSize: 14 },
  curRow: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  curBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, backgroundColor: '#16213E', borderWidth: 1, borderColor: '#2a3550' },
  curBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3720' },
  curText: { color: '#94A3B8', fontSize: 14 },
  curTextActive: { color: '#D4AF37', fontWeight: 'bold' },
  createBtn: { backgroundColor: '#8B5CF6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  createText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backBtn: { alignItems: 'center', marginTop: 12 },
  backText: { color: '#94A3B8', fontSize: 14 },
});
