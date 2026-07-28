import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { financialEngine } from '../../src/services/FinancialCoreEngine';

export default function CurrencyReportsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRecalculate = async () => {
    if (!db) return;
    setLoading(true);
    try {
      // احتساب فروق العملة للحسابات ذات العملات الأجنبية
      const accounts = await db.getAllAsync("SELECT a.id, a.code, a.name_ar, a.current_balance, c.code as currency_code, COALESCE(er.rate,1) as current_rate, a.opening_balance FROM accounts a JOIN currencies c ON c.id = a.currency_id LEFT JOIN exchange_rates er ON er.currency_id = a.currency_id AND er.date = (SELECT MAX(date) FROM exchange_rates WHERE currency_id = a.currency_id) WHERE a.is_leaf = 1 AND a.is_active = 1 AND c.code != 'YER'") as any[];
      let totalDifference = 0;
      for (const acc of accounts) {
        const oldBaseBalance = acc.current_balance; // الرصيد الحالي بالريال
        const originalForeign = await db.getFirstAsync("SELECT COALESCE(SUM(balance),0) as total FROM account_balances WHERE account_id = ? AND currency_code = ?", [acc.id, acc.currency_code]) as any;
        const foreignBalance = originalForeign?.total || 0;
        const newBaseBalance = foreignBalance * acc.current_rate;
        const difference = newBaseBalance - oldBaseBalance;
        if (Math.abs(difference) > 0.01) {
          // إنشاء قيد فروق العملة
          await financialEngine.executeTransaction(db, {
            date: new Date().toISOString().split('T')[0],
            description: `فروق أسعار صرف - ${acc.name_ar}`,
            reference: `EXD-${Date.now()}`,
            source_type: 'exchange_difference',
            currency_code: 'YER',
            exchange_rate: 1,
            lines: [
              { account_id: acc.id, debit_original: difference > 0 ? difference : 0, credit_original: difference < 0 ? -difference : 0, description: `تعديل فروق العملة` },
              { account_id: acc.id, debit_original: difference < 0 ? -difference : 0, credit_original: difference > 0 ? difference : 0, description: `فروق أسعار صرف` }
            ]
          });
          totalDifference += difference;
        }
      }
      setMessage(`تمت معالجة فروق العملة. إجمالي الفرق: ${totalDifference.toFixed(2)} ﷼`);
      Alert.alert('✅', message);
    } catch(e: any) { Alert.alert('خطأ', e.message); }
    setLoading(false);
  };

  if (!isReady) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>💱 فروق العملة</Text><View style={{width:40}}/></View>
      <View style={styles.content}>
        <Text style={styles.info}>إعادة تقييم الأرصدة بالعملات الأجنبية حسب آخر سعر صرف.</Text>
        <TouchableOpacity style={styles.btn} onPress={handleRecalculate} disabled={loading}>
          <Text style={styles.btnT}>{loading ? '⏳ جاري...' : '🔄 احتساب فروق العملة'}</Text>
        </TouchableOpacity>
        {message ? <Text style={styles.msg}>{message}</Text> : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  content:{padding:20},
  info:{color:'#94A3B8',fontSize:14,textAlign:'center',marginBottom:20},
  btn:{backgroundColor:'#8B5CF6',padding:16,borderRadius:12,alignItems:'center'},
  btnT:{color:'#FFF',fontSize:16,fontWeight:'bold'},
  msg:{color:'#10B981',fontSize:14,textAlign:'center',marginTop:20},
});
