import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import CurrencyPicker from '../../src/components/ui/CurrencyPicker';
import { Colors, Spacing, FontSizes } from '../../src/theme/colors';

const ACCOUNT_TYPES: any = {
  asset: { label: 'أصول', color: Colors.asset, icon: '🏦' },
  liability: { label: 'خصوم', color: Colors.liability, icon: '💳' },
  expense: { label: 'مصروفات', color: Colors.expense, icon: '📊' },
  revenue: { label: 'إيرادات', color: Colors.revenue, icon: '💰' },
};

const ACCOUNT_CATEGORIES: any = {
  asset: [
    { label: 'صندوق', icon: '💰', parentCode: '1101' },
    { label: 'بنك', icon: '🏦', parentCode: '1102' },
    { label: 'شركة صرافة', icon: '💱', parentCode: '1103' },
    { label: 'محفظة إلكترونية', icon: '📱', parentCode: '1104' },
    { label: 'عميل', icon: '👤', parentCode: '1105' },
    { label: 'مخزون', icon: '📦', parentCode: '1106' },
    { label: 'عهدة', icon: '💵', parentCode: '1107' },
    { label: 'أرض', icon: '🏗️', parentCode: '1201' },
    { label: 'مبنى', icon: '🏢', parentCode: '1202' },
    { label: 'سيارة', icon: '🚗', parentCode: '1203' },
    { label: 'جهاز', icon: '💻', parentCode: '1204' },
    { label: 'أثاث', icon: '🪑', parentCode: '1205' },
  ],
  liability: [
    { label: 'مورد', icon: '🏪', parentCode: '2101' },
    { label: 'أوراق دفع', icon: '📝', parentCode: '2102' },
    { label: 'رواتب مستحقة', icon: '👷', parentCode: '2103' },
    { label: 'ضرائب مستحقة', icon: '🧾', parentCode: '2104' },
    { label: 'قرض', icon: '🏛️', parentCode: '2201' },
  ],
  expense: [
    { label: 'رواتب', icon: '💵', parentCode: '3101' },
    { label: 'إيجار', icon: '🏠', parentCode: '3102' },
    { label: 'كهرباء ومياه', icon: '💡', parentCode: '3103' },
    { label: 'اتصالات', icon: '📞', parentCode: '3104' },
    { label: 'صيانة', icon: '🔧', parentCode: '3105' },
    { label: 'وقود', icon: '⛽', parentCode: '3106' },
    { label: 'نقل', icon: '🚚', parentCode: '3107' },
    { label: 'قرطاسية', icon: '📎', parentCode: '3201' },
    { label: 'مصروف بنكي', icon: '🏦', parentCode: '3202' },
  ],
  revenue: [
    { label: 'مبيعات', icon: '🛒', parentCode: '4101' },
    { label: 'خدمات', icon: '🔧', parentCode: '4102' },
    { label: 'إيراد آخر', icon: '📋', parentCode: '4201' },
  ],
};

export default function AccountsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4']));
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // حالة معالج الإضافة
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    type: 'asset',
    category: '',
    name_ar: '',
    name_en: '',
    opening_balance: '0',
    currency_code: 'YER',
    notes: '',
  });
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const loadData = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const result = await db.getAllAsync(`
        SELECT a.*, p.name_ar as parent_name, c.symbol
        FROM accounts a
        LEFT JOIN accounts p ON p.id = a.parent_id
        LEFT JOIN currencies c ON c.id = a.currency_id
        WHERE a.is_active = 1
        ORDER BY a.code
      `);
      setAccounts(result || []);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const filteredAccounts = searchQuery
    ? accounts.filter((a: any) => a.name_ar?.includes(searchQuery) || a.code?.includes(searchQuery))
    : accounts;

  const buildTree = (parentId: string | null = null): any[] => {
    return filteredAccounts
      .filter((a: any) => (a.parent_id?.toString() || null) === parentId)
      .map((child: any) => ({ ...child, children: buildTree(child.id.toString()) }));
  };

  const treeData = buildTree(null);

  const renderTree = (items: any[], level: number = 0) => {
    return items.map((item: any) => {
      const isExpanded = expandedNodes.has(item.id.toString());
      const hasChildren = item.children?.length > 0;
      const ti = ACCOUNT_TYPES[item.type] || ACCOUNT_TYPES.asset;
      const balance = item.current_balance || 0;
      const symbol = item.symbol || '﷼';

      return (
        <View key={item.id}>
          <TouchableOpacity
            style={[styles.treeNode, { paddingLeft: Spacing.md + level * 18 }, selectedAccount?.id === item.id && styles.selected]}
            onPress={() => {
              if (hasChildren) {
                const ns = new Set(expandedNodes);
                isExpanded ? ns.delete(item.id.toString()) : ns.add(item.id.toString());
                setExpandedNodes(ns);
              }
              setSelectedAccount(item);
            }}
          >
            <Text style={styles.expandIcon}>{hasChildren ? (isExpanded ? '📂' : '📁') : '📄'}</Text>
            <Text style={styles.typeIcon}>{ti.icon}</Text>
            <View style={styles.nodeInfo}>
              <Text style={[styles.nodeCode, { color: ti.color }]}>{item.code}</Text>
              <Text style={styles.nodeName} numberOfLines={1}>{item.name_ar}</Text>
            </View>
            <Text style={[styles.nodeBalance, balance >= 0 ? styles.pos : styles.neg]}>
              {balance !== 0 ? Math.abs(balance).toLocaleString() + ' ' + symbol : ''}
            </Text>
          </TouchableOpacity>
          {isExpanded && hasChildren && renderTree(item.children, level + 1)}
        </View>
      );
    });
  };

  // حفظ الحساب من المعالج (الطريقة القديمة المطورة)
  const saveFromWizard = async () => {
    if (!wizardData.name_ar.trim() || !db) { Alert.alert('خطأ', 'أدخل اسم الحساب'); return; }
    const category = ACCOUNT_CATEGORIES[wizardData.type]?.find((c: any) => c.label === wizardData.category);
    if (!category) { Alert.alert('خطأ', 'اختر التصنيف'); return; }

    setLoading(true);
    try {
      // البحث عن الحساب الأب باستخدام الكود
      const parent = await db.getFirstAsync('SELECT * FROM accounts WHERE code = ? AND is_active=1', [category.parentCode]) as any;
      if (!parent) { Alert.alert('خطأ', 'الحساب الأب غير موجود'); setLoading(false); return; }

      const lastChild = await db.getFirstAsync("SELECT code FROM accounts WHERE code LIKE ?||'%' ORDER BY code DESC LIMIT 1", [category.parentCode]) as any;
      let newCode = category.parentCode + '01';
      if (lastChild) {
        const num = parseInt(lastChild.code.substring(category.parentCode.length)) || 0;
        newCode = category.parentCode + String(num + 1).padStart(2, '0');
      }

      // التعامل مع العملة
      const cur = await db.getFirstAsync('SELECT id, exchange_rate FROM currencies WHERE code = ?', [wizardData.currency_code]) as any;
      const currencyId = cur?.id || 1;
      const exchangeRate = cur?.exchange_rate || 1;
      const openingBalance = parseFloat(wizardData.opening_balance) || 0;
      // الرصيد الافتتاحي بالعملة الأساسية (YER) = الرصيد المدخل × سعر الصرف
      const openingBalanceBase = openingBalance * exchangeRate;

      await db.runAsync(
        `INSERT INTO accounts (code, name_ar, name_en, parent_id, level, type, nature, currency_id, opening_balance, current_balance, is_postable, is_virtual, is_leaf, is_active, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,1,0,1,1,?)`,
        [newCode, wizardData.name_ar, wizardData.name_en, parent.id, parent.level + 1, parent.type, parent.nature, currencyId, openingBalanceBase, openingBalanceBase, wizardData.notes]
      );

      // تحديث رصيد الحسابات الأصلية
      await db.runAsync(`UPDATE accounts SET current_balance = (SELECT COALESCE(SUM(current_balance),0) FROM accounts child WHERE child.parent_id = accounts.id) WHERE id = ?`, [parent.id]);

      Alert.alert('✅', `تم إنشاء الحساب: ${newCode}`);
      setShowWizard(false);
      setWizardStep(0);
      setWizardData({ type: 'asset', category: '', name_ar: '', name_en: '', opening_balance: '0', currency_code: 'YER', notes: '' });
      loadData();
    } catch (e) { console.error(e); Alert.alert('خطأ', 'فشل إنشاء الحساب'); }
    setLoading(false);
  };

  if (!isReady || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loading}>جاري تحميل دليل الحسابات...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}><Text style={styles.headerBtnT}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>📊 دليل الحسابات</Text>
        <TouchableOpacity onPress={() => { setWizardStep(0); setShowWizard(true); }} style={styles.headerWiz}><Text style={styles.headerWizT}>+</Text></TouchableOpacity>
      </View>

      {/* البحث */}
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث عن حساب..." placeholderTextColor={Colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} textAlign="right" />
      </View>

      {/* الشجرة */}
      <ScrollView style={styles.tree} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        {treeData.length > 0 ? renderTree(treeData) : <Text style={styles.empty}>لا توجد حسابات</Text>}
        <View style={{ height: selectedAccount ? 250 : 60 }} />
      </ScrollView>

      {/* لوحة التفاصيل */}
      {selectedAccount && (
        <View style={styles.details}>
          <View style={styles.detailsH}>
            <Text style={[styles.detailsCode, { color: ACCOUNT_TYPES[selectedAccount.type]?.color }]}>{selectedAccount.code}</Text>
            <Text style={styles.detailsName}>{selectedAccount.name_ar}</Text>
            <TouchableOpacity onPress={() => setSelectedAccount(null)}><Text style={styles.detailsClose}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.detailsB}>
            <Text style={styles.detailRow}>🏷️ النوع: {ACCOUNT_TYPES[selectedAccount.type]?.label}</Text>
            <Text style={styles.detailRow}>💰 الرصيد: {(selectedAccount.current_balance || 0).toLocaleString()} {selectedAccount.symbol || '﷼'}</Text>
            {selectedAccount.parent_name && <Text style={styles.detailRow}>📁 الأب: {selectedAccount.parent_name}</Text>}
          </View>
        </View>
      )}

      {/* نافذة المعالج المبسطة */}
      <Modal visible={showWizard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalC}>
            <View style={styles.modalH}>
              <Text style={styles.modalT}>🧙 إنشاء حساب جديد</Text>
              <TouchableOpacity onPress={() => { setShowWizard(false); setWizardStep(0); }}><Text style={styles.modalX}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {/* الخطوة 0: اختيار نوع الحساب */}
              {wizardStep === 0 && (
                <View>
                  <Text style={styles.wizQ}>ما نوع الحساب؟</Text>
                  <View style={styles.wizGrid}>
                    {Object.entries(ACCOUNT_TYPES).map(([k, v]: any) => (
                      <TouchableOpacity key={k} style={[styles.wizCard, wizardData.type === k && { borderColor: v.color }]}
                        onPress={() => { setWizardData({ ...wizardData, type: k, category: '' }); setWizardStep(1); }}>
                        <Text style={styles.wizIcon}>{v.icon}</Text>
                        <Text style={[styles.wizLabel, wizardData.type === k && { color: v.color }]}>{v.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* الخطوة 1: اختيار التصنيف */}
              {wizardStep === 1 && (
                <View>
                  <Text style={styles.wizQ}>اختر التصنيف:</Text>
                  <View style={styles.wizGrid}>
                    {(ACCOUNT_CATEGORIES[wizardData.type] || []).map((c: any) => (
                      <TouchableOpacity key={c.label} style={[styles.wizCard, wizardData.category === c.label && { borderColor: Colors.purple }]}
                        onPress={() => { setWizardData({ ...wizardData, category: c.label }); setWizardStep(2); }}>
                        <Text style={styles.wizIcon}>{c.icon}</Text>
                        <Text style={styles.wizLabel}>{c.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => setWizardStep(0)}><Text style={styles.backStep}>← رجوع</Text></TouchableOpacity>
                </View>
              )}

              {/* الخطوة 2: إدخال البيانات */}
              {wizardStep === 2 && (
                <View>
                  <Text style={styles.wizQ}>أدخل البيانات:</Text>
                  <Text style={styles.summary}>النوع: {ACCOUNT_TYPES[wizardData.type]?.icon} {ACCOUNT_TYPES[wizardData.type]?.label} | التصنيف: {wizardData.category}</Text>
                  <Text style={styles.fl}>اسم الحساب *</Text>
                  <TextInput style={styles.fi} value={wizardData.name_ar} onChangeText={v => setWizardData({ ...wizardData, name_ar: v })} placeholder="الاسم" placeholderTextColor={Colors.textMuted} textAlign="right" autoFocus />
                  <Text style={styles.fl}>الرصيد الافتتاحي</Text>
                  <TextInput style={styles.fi} value={wizardData.opening_balance} onChangeText={v => setWizardData({ ...wizardData, opening_balance: v })} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" textAlign="right" />
                  <Text style={styles.fl}>العملة</Text>
                  <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCurrencyPicker(true)}>
                    <Text style={styles.pickerBtnText}>{wizardData.currency_code}</Text>
                  </TouchableOpacity>
                  <Text style={styles.fl}>ملاحظات</Text>
                  <TextInput style={styles.fi} value={wizardData.notes} onChangeText={v => setWizardData({ ...wizardData, notes: v })} placeholder="ملاحظات" placeholderTextColor={Colors.textMuted} multiline textAlign="right" />
                  <View style={styles.wizBtns}>
                    <TouchableOpacity onPress={() => setWizardStep(1)}><Text style={styles.backStep}>← رجوع</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.saveWiz} onPress={saveFromWizard}><Text style={styles.saveWizT}>💾 إنشاء</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CurrencyPicker
        visible={showCurrencyPicker}
        onSelect={(cur: any) => { setWizardData({ ...wizardData, currency_code: cur.code }); setShowCurrencyPicker(false); }}
        onClose={() => setShowCurrencyPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loading: { color: Colors.primary, marginTop: 10 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  headerBtnT: { color: Colors.primary, fontSize: 18 },
  headerTitle: { color: Colors.primary, fontSize: FontSizes.xl, fontWeight: 'bold' },
  headerWiz: { width: 34, height: 34, borderRadius: 8, backgroundColor: Colors.purple + '20', justifyContent: 'center', alignItems: 'center' },
  headerWizT: { fontSize: 18, color: Colors.purple },

  searchRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  searchInput: { backgroundColor: Colors.card, borderRadius: 8, padding: Spacing.sm, color: Colors.text, fontSize: FontSizes.md, borderWidth: 1, borderColor: Colors.border },

  tree: { flex: 1 },
  treeNode: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingRight: 4, borderRadius: 4, marginHorizontal: 2 },
  selected: { backgroundColor: Colors.primary + '15' },
  expandIcon: { fontSize: 13, marginRight: 2 },
  typeIcon: { fontSize: 13, marginRight: 3 },
  nodeInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  nodeCode: { fontSize: FontSizes.sm, fontWeight: 'bold', minWidth: 45 },
  nodeName: { color: Colors.text, fontSize: FontSizes.sm, flex: 1 },
  nodeBalance: { fontSize: 10, fontWeight: 'bold' },
  pos: { color: Colors.success }, neg: { color: Colors.credit },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },

  details: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopLeftRadius: 14, borderTopRightRadius: 14, maxHeight: 250, borderTopWidth: 1, borderTopColor: Colors.primary + '30' },
  detailsH: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailsCode: { fontSize: FontSizes.lg, fontWeight: 'bold', marginRight: 6 },
  detailsName: { color: Colors.text, fontSize: FontSizes.md, flex: 1 },
  detailsClose: { color: Colors.credit, fontSize: 16 },
  detailsB: { padding: Spacing.md },
  detailRow: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginBottom: 3 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalC: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalH: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalT: { color: Colors.primary, fontSize: FontSizes.xl, fontWeight: 'bold' },
  modalX: { color: Colors.credit, fontSize: 20 },
  wizQ: { color: Colors.text, fontSize: FontSizes.lg, fontWeight: 'bold', textAlign: 'center', marginBottom: 14, paddingHorizontal: Spacing.lg },
  wizGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: Spacing.lg, justifyContent: 'center' },
  wizCard: { width: '44%', backgroundColor: Colors.card, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  wizIcon: { fontSize: 26, marginBottom: 6 },
  wizLabel: { color: Colors.text, fontSize: FontSizes.md, fontWeight: '600' },
  summary: { color: Colors.primary, fontSize: FontSizes.sm, textAlign: 'center', marginBottom: 12 },
  fl: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginBottom: 3, marginTop: 8, paddingHorizontal: Spacing.lg },
  fi: { backgroundColor: Colors.card, borderRadius: 8, padding: 10, color: Colors.text, fontSize: FontSizes.md, marginHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  pickerBtn: { backgroundColor: Colors.card, borderRadius: 8, padding: 12, marginHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  pickerBtnText: { color: Colors.primary, textAlign: 'center' },
  backStep: { color: Colors.textSecondary, fontSize: FontSizes.sm, textAlign: 'center', paddingVertical: 10 },
  wizBtns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginTop: 12, marginBottom: 20 },
  saveWiz: { backgroundColor: Colors.purple, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  saveWizT: { color: Colors.text, fontSize: FontSizes.lg, fontWeight: 'bold' },
});
