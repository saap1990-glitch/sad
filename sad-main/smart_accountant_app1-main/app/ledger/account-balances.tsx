import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Selector } from '../../src/components/common/Selector';
import { ControlButtons, ControlHeader } from '../../src/components/ui/ControlButtons';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function AccountBalancesScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [balances, setBalances] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newBalance, setNewBalance] = useState('');
  const [newIsDebit, setNewIsDebit] = useState(true);

  useFocusEffect(useCallback(() => { loadAccounts(); }, []));

  const loadBalances = async (accountId: string) => {
    if (!db) return;
    const result = await db.getAllAsync('SELECT * FROM account_balances WHERE account_id=?', [accountId]);
    if (result.length === 0) {
      // إذا ما فيه أرصدة، نجيب رصيد الحساب الأساسي
      const acc = accounts.find((a: any) => a.id === accountId);
      if (acc) {
        setBalances([{ id: 'main', currency: acc.currency || 'YER', balance: acc.balance || 0, base_balance: acc.balance || 0, exchange_rate: 1, isMain: true }]);
      }
    } else {
      setBalances(result);
    }
  };

  const account = accounts.find((a: any) => a.id === selectedId);
  const nature = account?.isDebit !== 0 ? 'مدين' : 'دائن';
  const totalYER = balances.reduce((s: number, b: any) => s + (b.base_balance || 0), 0);

  const addBalance = async () => {
    if (!newBalance || parseFloat(newBalance) <= 0) { Alert.alert('خطأ', 'أدخل رصيداً صحيحاً'); return; }
    if (!db || !selectedId) return;

    const balance = parseFloat(newBalance);
    const cur = await db.getFirstAsync('SELECT rate FROM currencies WHERE code=?', [newCurrency]) as any;
    const rate = cur?.rate || 1;
    const baseBalance = balance * rate;

    await db.runAsync(
      'INSERT INTO account_balances (id, account_id, currency, balance, base_balance, exchange_rate) VALUES (?,?,?,?,?,?)',
      ['bal-' + Date.now(), selectedId, newCurrency, balance, baseBalance, rate]
    );

    // تحديث الرصيد الإجمالي
    const finalBalance = newIsDebit ? baseBalance : -baseBalance;
    await db.runAsync('UPDATE accounts SET balance = COALESCE(balance,0) + ? WHERE id = ?', [finalBalance, selectedId]);

    await loadAccounts();
    await loadBalances(selectedId);
    setShowAdd(false);
    setNewBalance('');
    Alert.alert('✅', `تم إضافة ${balance.toLocaleString()} ${newCurrency}`);
  };

  const deleteBalance = async (bal: any) => {
    if (bal.isMain) return Alert.alert('تنبيه', 'لا يمكن حذف الرصيد الأساسي');
    Alert.alert('حذف', 'حذف هذا الرصيد؟', [
      { text: 'إلغاء' },
      { text: 'حذف', onPress: async () => {
        await db.runAsync('UPDATE accounts SET balance = COALESCE(balance,0) - ? WHERE id = ?', [bal.base_balance, selectedId]);
        await db.runAsync('DELETE FROM account_balances WHERE id=?', [bal.id]);
        await loadAccounts();
        await loadBalances(selectedId);
      }}
    ]);
  };

  return (
    <View style={[st.c, { paddingTop: insets.top }]}>
      <ControlHeader title="الأرصدة التفصيلية" onBack={() => router.back()} />
      
      <Selector label="اختر الحساب" tableName="accounts" displayField="name" subField="code" selectedId={selectedId} selectedName={selectedName} onSelect={(i: any) => { setSelectedId(i.id); setSelectedName(i.name); loadBalances(i.id); }} />

      {selectedName && (
        <>
          <View style={st.infoBox}>
            <Text style={st.infoName}>{selectedName}</Text>
            <Text style={st.infoNature}>الطبيعة: {nature} | العملة الأساسية: {account?.currency}</Text>
            <Text style={st.infoTotal}>إجمالي بالريال: {totalYER.toLocaleString()} ﷼</Text>
          </View>

          <TouchableOpacity style={st.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={st.addBtnText}>💱 + إضافة رصيد بعملة أخرى</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={st.hr}>
        <Text style={[st.th, { flex: 1.2 }]}>العملة</Text>
        <Text style={[st.th, { flex: 1.8 }]}>الرصيد بالعملة</Text>
        <Text style={[st.th, { flex: 1.8 }]}>المقابل بالريال</Text>
        <Text style={[st.th, { flex: 1 }]}>السعر</Text>
        <Text style={[st.th, { flex: 0.8 }]}>حذف</Text>
      </View>

      <FlatList data={balances} keyExtractor={(i, idx) => i.id || idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={st.row} onLongPress={() => deleteBalance(item)}>
            <Text style={[st.cell, { flex: 1.2, color: '#D4AF37', fontWeight: 'bold' }]}>{item.currency}</Text>
            <Text style={[st.cell, { flex: 1.8, color: item.balance >= 0 ? '#10B981' : '#EF4444' }]}>
              {item.balance?.toLocaleString()} {item.currency}
            </Text>
            <Text style={[st.cell, { flex: 1.8, color: '#FFF' }]}>
              {item.base_balance?.toLocaleString()} ﷼
            </Text>
            <Text style={[st.cell, { flex: 1, color: '#94a3b8' }]}>{item.exchange_rate || 1}</Text>
            <TouchableOpacity style={{ flex: 0.8, alignItems: 'center' }} onPress={() => deleteBalance(item)}>
              <Text style={{ color: '#EF4444' }}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={st.et}>{selectedId ? 'لا توجد أرصدة' : 'اختر حساباً'}</Text>}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* نافذة إضافة رصيد */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={st.mo}><View style={st.mc}><View style={st.mh}><Text style={st.mt}>إضافة رصيد بعملة</Text><TouchableOpacity onPress={() => setShowAdd(false)}><Text style={st.mx}>✕</Text></TouchableOpacity></View>
        <View style={st.mb}>
          <Text style={st.fl}>العملة</Text>
          <Selector label="" tableName="currencies" displayField="code" subField="name" selectedId={newCurrency} selectedName={newCurrency} onSelect={(i: any) => setNewCurrency(i.code)} />
          <Text style={st.fl}>الرصيد</Text>
          <TextInput style={st.fi} value={newBalance} onChangeText={setNewBalance} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />
          <Text style={st.fl}>الطبيعة</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[st.tb, { flex: 1 }, newIsDebit && st.tba]} onPress={() => setNewIsDebit(true)}><Text style={[st.tt, newIsDebit && st.tta]}>مدين</Text></TouchableOpacity>
            <TouchableOpacity style={[st.tb, { flex: 1 }, !newIsDebit && st.tba]} onPress={() => setNewIsDebit(false)}><Text style={[st.tt, !newIsDebit && st.tta]}>دائن</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={st.sb} onPress={addBalance}><Text style={st.sbt}>💾 حفظ</Text></TouchableOpacity>
        </View></View></View>
      </Modal>
    </View>
  );
}
const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' }, et: { color: '#FFF', textAlign: 'center', marginTop: 40 },
  infoBox: { marginHorizontal: 16, marginVertical: 10, padding: 16, backgroundColor: '#16213E', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  infoName: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' },
  infoNature: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  infoTotal: { color: '#10B981', fontSize: 16, fontWeight: 'bold', marginTop: 6 },
  addBtn: { marginHorizontal: 16, marginBottom: 10, padding: 12, backgroundColor: '#D4AF3720', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#D4AF3740' },
  addBtnText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
  hr: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#16213E', marginHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  th: { color: '#D4AF37', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213E', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#2a3550', marginHorizontal: 12 },
  cell: { fontSize: 12, textAlign: 'center' },
  mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }, mc: { backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }, mh: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 }, mt: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' }, mx: { color: '#EF4444', fontSize: 22 }, mb: { padding: 16 },
  fl: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 }, fi: { backgroundColor: '#0A1128', borderRadius: 10, padding: 12, color: '#FFF', borderWidth: 1, borderColor: '#2a3550', fontSize: 14, textAlign: 'right' },
  tb: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#2a3550' }, tba: { borderColor: '#D4AF37', backgroundColor: '#D4AF3720' }, tt: { color: '#94a3b8', fontSize: 12 }, tta: { color: '#D4AF37', fontWeight: 'bold' },
  sb: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 }, sbt: { color: '#0A1128', fontSize: 16, fontWeight: 'bold' },
});
