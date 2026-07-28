import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

const ACCOUNT_TYPES: any = {
  asset: { label: 'أصول', color: '#10B981', icon: '🏦', bgColor: '#10B98115' },
  liability: { label: 'خصوم', color: '#EF4444', icon: '💳', bgColor: '#EF444415' },
  expense: { label: 'مصروفات', color: '#F59E0B', icon: '📊', bgColor: '#F59E0B15' },
  revenue: { label: 'إيرادات', color: '#3B82F6', icon: '💰', bgColor: '#3B82F615' },
};

export default function AccountsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'balance' | 'profit'>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '4']));
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [baseCurrency, setBaseCurrency] = useState('YER');

  const loadData = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      // تحديث الأرصدة المجمعة
      await financialEngine.updateAllParentBalances(db, []);
      
      const base = await db.getFirstAsync("SELECT code FROM currencies WHERE is_base=1") as any;
      setBaseCurrency(base?.code || 'YER');

      const result = await db.getAllAsync(`
        SELECT a.*, p.name_ar as parent_name, c.code as currency_code, c.symbol,
          COALESCE(a.current_balance, 0) as current_balance,
          (SELECT COUNT(*) FROM accounts WHERE parent_id = a.id) as children_count,
          (SELECT COUNT(*) FROM journal_lines WHERE account_id = a.id) as transactions_count,
          (SELECT GROUP_CONCAT(ab.currency_code || ': ' || ab.balance) FROM account_balances ab WHERE ab.account_id = a.id) as balances_text
        FROM accounts a
        LEFT JOIN accounts p ON p.id = a.parent_id
        LEFT JOIN currencies c ON c.id = a.currency_id
        WHERE a.is_active = 1
        ORDER BY a.level, a.code
      `);
      setAccounts(result || []);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // فلترة
  const filteredAccounts = searchQuery
    ? accounts.filter((a: any) => a.name_ar?.includes(searchQuery) || a.code?.includes(searchQuery))
    : activeTab === 'all'
      ? accounts
      : activeTab === 'balance'
        ? accounts.filter((a: any) => ['asset', 'liability'].includes(a.type))
        : accounts.filter((a: any) => ['expense', 'revenue'].includes(a.type));

  // بناء الشجرة
  const buildTree = (parentId: string | null = null): any[] => {
    return filteredAccounts
      .filter((a: any) => (a.parent_id?.toString() || null) === parentId)
      .map((child: any) => ({ ...child, children: buildTree(child.id.toString()) }));
  };

  const treeData = buildTree(null);

  // عرض الشجرة
  const renderTree = (items: any[], level: number = 0) => {
    return items.map((item: any) => {
      const isExpanded = expandedNodes.has(item.id.toString());
      const hasChildren = item.children?.length > 0;
      const ti = ACCOUNT_TYPES[item.type] || ACCOUNT_TYPES.asset;
      const isVirtual = item.is_virtual === 1;
      const isLeaf = item.is_leaf === 1;
      const balance = item.current_balance || 0;

      return (
        <View key={item.id}>
          <TouchableOpacity
            style={[styles.treeNode, { paddingLeft: 4 + level * 18 }, selectedAccount?.id === item.id && styles.selected,
              isVirtual && styles.virtualNode, isLeaf && styles.leafNode]}
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
              {isVirtual && <Text style={styles.virtualBadge}>📊</Text>}
              {isLeaf && <Text style={styles.leafBadge}>📝</Text>}
              {hasChildren && <Text style={styles.childBadge}>👶{item.children_count || 0}</Text>}
            </View>
            <View style={styles.balanceCol}>
              <Text style={[styles.nodeBalance, balance >= 0 ? styles.pos : styles.neg]}>
                {balance !== 0 ? Math.abs(balance).toLocaleString() + ' ﷼' : ''}
              </Text>
              {item.balances_text && <Text style={styles.multiBal}>💱 {item.balances_text}</Text>}
            </View>
          </TouchableOpacity>
          {isExpanded && hasChildren && renderTree(item.children, level + 1)}
        </View>
      );
    });
  };

  // المعالج
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    type: 'asset', category: '', name_ar: '', name_en: '',
    opening_balance: '0', currency_code: 'YER', notes: '',
  });

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
      { label: 'ورقة دفع', icon: '📝', parentCode: '2102' },
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

  const saveFromWizard = async () => {
    if (!wizardData.name_ar.trim()) { Alert.alert('خطأ', 'أدخل اسم الحساب'); return; }
    if (!db) return;

    const category = ACCOUNT_CATEGORIES[wizardData.type]?.find((c: any) => c.label === wizardData.category);
    if (!category) { Alert.alert('خطأ', 'اختر التصنيف'); return; }

    setLoading(true);
    try {
      const parent = await db.getFirstAsync('SELECT * FROM accounts WHERE code = ?', [category.parentCode]) as any;
      if (!parent) { Alert.alert('خطأ', 'الحساب الأب غير موجود'); setLoading(false); return; }

      const lastChild = await db.getFirstAsync("SELECT code FROM accounts WHERE code LIKE ?||'%' ORDER BY code DESC LIMIT 1", [category.parentCode]) as any;
      let newCode = `${category.parentCode}01`;
      if (lastChild) {
        const num = parseInt(lastChild.code.substring(category.parentCode.length)) || 0;
        newCode = category.parentCode + String(num + 1).padStart(2, '0');
      }

      const foreignAmount = parseFloat(wizardData.opening_balance) || 0;
      const rate = await financialEngine.getExchangeRate(db, wizardData.currency_code);
      const baseAmount = foreignAmount * rate;
      const curId = (await db.getFirstAsync("SELECT id FROM currencies WHERE code = ?", [wizardData.currency_code]) as any)?.id || 1;

      await db.runAsync(
        `INSERT INTO accounts (code, name_ar, name_en, parent_id, level, type, nature, currency_id, opening_balance, current_balance, is_postable, is_virtual, is_system, is_leaf, is_active, notes) VALUES (?,?,?,?,?,?,?,?,?,?,1,0,0,1,1,?)`,
        [newCode, wizardData.name_ar, wizardData.name_en || wizardData.name_ar, parent.id, parent.level + 1, parent.type, parent.nature, curId, baseAmount, baseAmount, wizardData.notes || '']
      );

      if (wizardData.currency_code !== 'YER' && foreignAmount > 0) {
        const newAcc = await db.getFirstAsync('SELECT id FROM accounts WHERE code = ?', [newCode]) as any;
        if (newAcc) {
          await db.runAsync("INSERT INTO account_balances (account_id, currency_code, balance) VALUES (?,?,?)", [newAcc.id, wizardData.currency_code, foreignAmount]);
        }
      }

      await financialEngine.updateAllParentBalances(db, [parent.id]);
      Alert.alert('✅', `تم إنشاء الحساب: ${newCode}`);
      setShowWizard(false); setWizardStep(0);
      loadData();
    } catch (e) { console.error(e); Alert.alert('خطأ', 'فشل إنشاء الحساب'); }
    setLoading(false);
  };

  if (!isReady || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loading}>جاري تحميل دليل الحسابات...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.h}>
        <TouchableOpacity onPress={() => router.back()} style={styles.hBtn}><Text style={styles.hBtnT}>←</Text></TouchableOpacity>
        <Text style={styles.hTitle}>📊 دليل الحسابات</Text>
        <TouchableOpacity onPress={() => { setWizardStep(0); setShowWizard(true); }} style={styles.hWiz}><Text style={styles.hWizT}>🧙</Text></TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { key: 'all', label: '📋 الكل' },
          { key: 'balance', label: '📊 الميزانية' },
          { key: 'profit', label: '📈 الأرباح' },
        ].map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key as any)}>
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="🔍 بحث عن حساب..." placeholderTextColor="#64748B" value={searchQuery} onChangeText={setSearchQuery} textAlign="right" />
      </View>

      {/* Tree */}
      <ScrollView style={styles.tree} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        {treeData.length > 0 ? renderTree(treeData) : <Text style={styles.empty}>لا توجد حسابات</Text>}
        <View style={{ height: selectedAccount ? 300 : 60 }} />
      </ScrollView>

      {/* Details Panel */}
      {selectedAccount && (
        <View style={styles.details}>
          <View style={styles.detailsH}>
            <Text style={[styles.detailsCode, { color: ACCOUNT_TYPES[selectedAccount.type]?.color }]}>{selectedAccount.code}</Text>
            <Text style={styles.detailsName}>{selectedAccount.name_ar}</Text>
            <TouchableOpacity onPress={() => setSelectedAccount(null)}><Text style={styles.detailsClose}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.detailsB}>
            <Text style={styles.detailRow}>🏷️ النوع: {ACCOUNT_TYPES[selectedAccount.type]?.label} | {selectedAccount.is_virtual ? 'رئيسي 📊' : 'فرعي 📝'}</Text>
            <Text style={styles.detailRow}>💱 العملة: {selectedAccount.currency_code || baseCurrency}</Text>
            <Text style={styles.detailRow}>💰 الرصيد: {(selectedAccount.current_balance || 0).toLocaleString()} ﷼</Text>
            {selectedAccount.balances_text && <Text style={styles.detailRow}>💱 أرصدة: {selectedAccount.balances_text}</Text>}
            <Text style={styles.detailRow}>📝 الحركات: {selectedAccount.transactions_count || 0}</Text>
            <Text style={styles.detailRow}>👶 الأبناء: {selectedAccount.children_count || 0}</Text>
          </View>
          <View style={styles.opsBar}>
            {selectedAccount.level < 5 && (
              <TouchableOpacity style={styles.opBtn} onPress={() => { setWizardData(prev => ({ ...prev, type: selectedAccount.type })); setWizardStep(1); setShowWizard(true); }}>
                <Text style={styles.opIcon}>➕</Text><Text style={styles.opLabel}>فرعي</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.opBtn} onPress={() => router.push(`/ledger/account-statement` as any)}>
              <Text style={styles.opIcon}>📋</Text><Text style={styles.opLabel}>كشف</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.opBtn} onPress={() => router.push(`/ledger/account-currencies?accountId=${selectedAccount.id}&accountName=${selectedAccount.name_ar}` as any)}>
              <Text style={styles.opIcon}>💱</Text><Text style={styles.opLabel}>عملات</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Wizard Modal */}
      <Modal visible={showWizard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalC}>
            <View style={styles.modalH}><Text style={styles.modalT}>🧙 معالج إنشاء حساب</Text><TouchableOpacity onPress={() => { setShowWizard(false); setWizardStep(0); }}><Text style={styles.modalX}>✕</Text></TouchableOpacity></View>
            <View style={styles.steps}>
              {['النوع', 'التصنيف', 'البيانات'].map((s, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[styles.stepCircle, wizardStep >= i && styles.stepActive]}><Text style={[styles.stepNum, wizardStep >= i && styles.stepNumActive]}>{i + 1}</Text></View>
                  <Text style={[styles.stepLabel, wizardStep >= i && styles.stepLabelActive]}>{s}</Text>
                </View>
              ))}
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {wizardStep === 0 && (
                <View>
                  <Text style={styles.wizQ}>ما نوع الحساب؟</Text>
                  <View style={styles.wizGrid}>
                    {Object.entries(ACCOUNT_TYPES).map(([k, v]: any) => (
                      <TouchableOpacity key={k} style={[styles.wizCard, wizardData.type === k && { borderColor: v.color, backgroundColor: v.bgColor }]}
                        onPress={() => { setWizardData({ ...wizardData, type: k, category: '' }); setWizardStep(1); }}>
                        <Text style={styles.wizIcon}>{v.icon}</Text>
                        <Text style={[styles.wizLabel, wizardData.type === k && { color: v.color }]}>{v.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              {wizardStep === 1 && (
                <View>
                  <Text style={styles.wizQ}>اختر التصنيف:</Text>
                  <View style={styles.wizGrid}>
                    {(ACCOUNT_CATEGORIES[wizardData.type] || []).map((c: any) => (
                      <TouchableOpacity key={c.label} style={[styles.wizCard, wizardData.category === c.label && { borderColor: '#8B5CF6' }]}
                        onPress={() => { setWizardData({ ...wizardData, category: c.label }); setWizardStep(2); }}>
                        <Text style={styles.wizIcon}>{c.icon}</Text>
                        <Text style={styles.wizLabel}>{c.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => setWizardStep(0)}><Text style={styles.backStep}>← رجوع</Text></TouchableOpacity>
                </View>
              )}
              {wizardStep === 2 && (
                <View>
                  <Text style={styles.wizQ}>أدخل البيانات:</Text>
                  <Text style={styles.summary}>النوع: {ACCOUNT_TYPES[wizardData.type]?.icon} {ACCOUNT_TYPES[wizardData.type]?.label} | التصنيف: {wizardData.category}</Text>
                  <Text style={styles.fl}>اسم الحساب *</Text>
                  <TextInput style={styles.fi} value={wizardData.name_ar} onChangeText={v => setWizardData({ ...wizardData, name_ar: v })} placeholder="الاسم" placeholderTextColor="#666" textAlign="right" autoFocus />
                  <Text style={styles.fl}>الرصيد الافتتاحي</Text>
                  <TextInput style={styles.fi} value={wizardData.opening_balance} onChangeText={v => setWizardData({ ...wizardData, opening_balance: v })} placeholder="0" placeholderTextColor="#666" keyboardType="numeric" textAlign="right" />
                  <Text style={styles.fl}>العملة</Text>
                  <View style={styles.curRow}>
                    {['YER', 'USD', 'SAR'].map(c => (
                      <TouchableOpacity key={c} style={[styles.curBtn, wizardData.currency_code === c && styles.curBtnActive]} onPress={() => setWizardData({ ...wizardData, currency_code: c })}>
                        <Text style={[styles.curBtnT, wizardData.currency_code === c && styles.curBtnTActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128' },
  loading: { color: '#D4AF37', marginTop: 10 },

  h: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#0E1630', borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  hBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center' },
  hBtnT: { color: '#D4AF37', fontSize: 18 },
  hTitle: { color: '#D4AF37', fontSize: 17, fontWeight: 'bold' },
  hWiz: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#8B5CF620', justifyContent: 'center', alignItems: 'center' },
  hWizT: { fontSize: 18 },

  tabRow: { flexDirection: 'row', padding: 8, gap: 6 },
  tab: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#16213E', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  tabActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3710' },
  tabText: { color: '#94A3B8', fontSize: 12 },
  tabTextActive: { color: '#D4AF37', fontWeight: 'bold' },

  searchRow: { paddingHorizontal: 12, paddingVertical: 6 },
  searchInput: { backgroundColor: '#16213E', borderRadius: 8, padding: 8, color: '#FFF', fontSize: 13, borderWidth: 1, borderColor: '#2a3550' },

  tree: { flex: 1 },
  treeNode: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingRight: 4, borderRadius: 4, marginHorizontal: 2 },
  selected: { backgroundColor: '#D4AF3715' },
  virtualNode: { borderLeftWidth: 2, borderLeftColor: '#8B5CF6' },
  leafNode: { borderLeftWidth: 2, borderLeftColor: '#10B981' },
  expandIcon: { fontSize: 13, marginRight: 2 },
  typeIcon: { fontSize: 13, marginRight: 3 },
  nodeInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  nodeCode: { fontSize: 11, fontWeight: 'bold', minWidth: 35 },
  nodeName: { color: '#FFF', fontSize: 11, flex: 1 },
  virtualBadge: { fontSize: 8, color: '#8B5CF6', backgroundColor: '#8B5CF615', paddingHorizontal: 3, borderRadius: 3 },
  leafBadge: { fontSize: 8, color: '#10B981', backgroundColor: '#10B98115', paddingHorizontal: 3, borderRadius: 3 },
  childBadge: { fontSize: 8, color: '#3B82F6', marginLeft: 2 },
  balanceCol: { alignItems: 'flex-end' },
  nodeBalance: { fontSize: 10, fontWeight: 'bold' },
  multiBal: { fontSize: 7, color: '#D4AF37' },
  pos: { color: '#10B981' }, neg: { color: '#EF4444' },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },

  details: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0E1630', borderTopLeftRadius: 14, borderTopRightRadius: 14, maxHeight: 300, borderTopWidth: 1, borderTopColor: '#D4AF3730' },
  detailsH: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  detailsCode: { fontSize: 14, fontWeight: 'bold', marginRight: 6 },
  detailsName: { color: '#FFF', fontSize: 13, flex: 1 },
  detailsClose: { color: '#EF4444', fontSize: 16 },
  detailsB: { padding: 10, maxHeight: 180 },
  detailRow: { color: '#94A3B8', fontSize: 11, marginBottom: 3 },
  opsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1a2745' },
  opBtn: { alignItems: 'center' },
  opIcon: { fontSize: 18 },
  opLabel: { color: '#94A3B8', fontSize: 9 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalC: { backgroundColor: '#0E1630', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalH: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  modalT: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  modalX: { color: '#EF4444', fontSize: 20 },
  steps: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, gap: 24 },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2a3550' },
  stepActive: { borderColor: '#8B5CF6', backgroundColor: '#8B5CF620' },
  stepNum: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  stepNumActive: { color: '#8B5CF6' },
  stepLabel: { color: '#64748B', fontSize: 9, marginTop: 2 },
  stepLabelActive: { color: '#8B5CF6' },
  wizQ: { color: '#FFF', fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 14, paddingHorizontal: 16 },
  wizGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, justifyContent: 'center' },
  wizCard: { width: '44%', backgroundColor: '#16213E', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#2a3550' },
  wizIcon: { fontSize: 26, marginBottom: 6 },
  wizLabel: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  summary: { color: '#D4AF37', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  fl: { color: '#94A3B8', fontSize: 11, marginBottom: 3, marginTop: 8, paddingHorizontal: 16 },
  fi: { backgroundColor: '#16213E', borderRadius: 8, padding: 10, color: '#FFF', fontSize: 13, marginHorizontal: 16, borderWidth: 1, borderColor: '#2a3550' },
  curRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  curBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: '#16213E', borderWidth: 1, borderColor: '#2a3550' },
  curBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3720' },
  curBtnT: { color: '#94A3B8', fontSize: 12 },
  curBtnTActive: { color: '#D4AF37', fontWeight: 'bold' },
  backStep: { color: '#94A3B8', fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  wizBtns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 12, marginBottom: 20 },
  saveWiz: { backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  saveWizT: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});
