import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { Selector } from '../../src/components/common/Selector';
import { ControlHeader } from '../../src/components/ui/ControlButtons';

export default function AccountDetailsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [movements, setMovements] = useState<any[]>([]);

  useFocusEffect(useCallback(() => { loadAccounts(); }, []));

  const loadMovements = async (id: string) => {
    if (!db) return;
    const result = await db.getAllAsync('SELECT * FROM journal_details WHERE account_id=? ORDER BY rowid DESC LIMIT 20', [id]);
    setMovements(result);
  };

  const account = accounts.find((a: any) => a.id === selectedId);
  const balance = account?.balance || 0;
  const currency = account?.currency || 'YER';
  const nature = account?.isDebit !== 0 ? 'مدين' : 'دائن';
  
  // حساب مجموع الحركات
  const totalDebit = movements.reduce((s, m) => s + (m.debit || 0), 0);
  const totalCredit = movements.reduce((s, m) => s + (m.credit || 0), 0);
  const netChange = totalDebit - totalCredit;

  return (
    <View style={[st.c, { paddingTop: insets.top }]}>
      <ControlHeader title="تفاصيل الحساب" onBack={() => router.back()} />
      
      <Selector
        label="اختر الحساب"
        tableName="accounts"
        displayField="name"
        subField="code"
        showBalance
        selectedId={selectedId}
        selectedName={selectedName}
        onSelect={(i: any) => { setSelectedId(i.id); setSelectedName(i.name); loadMovements(i.id); }}
      />

      {selectedId && account && (
        <ScrollView>
          {/* ✅ بطاقة ملخص الحساب */}
          <View style={st.card}>
            <Text style={st.cardTitle}>{account.name}</Text>
            <Text style={st.cardCode}>الكود: {account.code}</Text>
            
            <View style={st.balanceRow}>
              <View style={[st.balanceBox, { borderColor: '#10B981' }]}>
                <Text style={st.balanceLabel}>الرصيد الحالي</Text>
                <Text style={[st.balanceValue, { color: balance >= 0 ? '#10B981' : '#EF4444' }]}>
                  {Math.abs(balance).toLocaleString()} ﷼
                </Text>
                <Text style={[st.badge, { backgroundColor: nature === 'مدين' ? '#10B98120' : '#EF444420' }]}>
                  <Text style={{ color: nature === 'مدين' ? '#10B981' : '#EF4444' }}>{nature}</Text>
                </Text>
              </View>
              
              <View style={[st.balanceBox, { borderColor: '#D4AF37' }]}>
                <Text style={st.balanceLabel}>العملة</Text>
                <Text style={[st.balanceValue, { color: '#D4AF37' }]}>{currency}</Text>
              </View>
            </View>

            {/* ✅ ملخص الحركات */}
            <View style={st.summaryRow}>
              <View style={st.summaryItem}>
                <Text style={{ color: '#10B981', fontSize: 12 }}>إجمالي مدين</Text>
                <Text style={{ color: '#10B981', fontSize: 16, fontWeight: 'bold' }}>{totalDebit.toLocaleString()} ﷼</Text>
              </View>
              <View style={st.summaryItem}>
                <Text style={{ color: '#EF4444', fontSize: 12 }}>إجمالي دائن</Text>
                <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: 'bold' }}>{totalCredit.toLocaleString()} ﷼</Text>
              </View>
              <View style={st.summaryItem}>
                <Text style={{ color: '#D4AF37', fontSize: 12 }}>صافي التغير</Text>
                <Text style={{ color: netChange >= 0 ? '#10B981' : '#EF4444', fontSize: 16, fontWeight: 'bold' }}>
                  {netChange >= 0 ? '+' : ''}{netChange.toLocaleString()} ﷼
                </Text>
              </View>
            </View>
          </View>

          {/* ✅ آخر الحركات */}
          <Text style={st.sectionTitle}>📋 آخر الحركات</Text>
          {movements.map((m, i) => (
            <View key={i} style={st.movementRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 13, textAlign: 'right' }}>{m.description || 'حركة'}</Text>
              </View>
              <Text style={{ color: '#10B981', fontSize: 13, fontWeight: 'bold', marginHorizontal: 8 }}>
                {m.debit > 0 ? `+${m.debit.toLocaleString()}` : ''}
              </Text>
              <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: 'bold' }}>
                {m.credit > 0 ? `-${m.credit.toLocaleString()}` : ''}
              </Text>
            </View>
          ))}
          {movements.length === 0 && (
            <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>لا توجد حركات</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0A1128' },
  card: { margin: 16, padding: 20, backgroundColor: '#16213E', borderRadius: 16, borderWidth: 2, borderColor: '#2a3550' },
  cardTitle: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
  cardCode: { color: '#94a3b8', fontSize: 13, textAlign: 'right', marginTop: 4 },
  balanceRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  balanceBox: { flex: 1, padding: 14, backgroundColor: '#0A1128', borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  balanceLabel: { color: '#94a3b8', fontSize: 11 }, balanceValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  badge: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  summaryRow: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2a3550' },
  summaryItem: { flex: 1, alignItems: 'center' },
  sectionTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', margin: 16, textAlign: 'right' },
  movementRow: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, marginBottom: 4, backgroundColor: '#16213E', borderRadius: 8 },
});
