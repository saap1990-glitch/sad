import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

const TYPE_COLORS: any = { asset: { color: '#10B981', icon: '🏦', label: 'أصول' }, liability: { color: '#EF4444', icon: '💳', label: 'خصوم' }, expense: { color: '#F59E0B', icon: '📊', label: 'مصروفات' }, revenue: { color: '#3B82F6', icon: '💰', label: 'إيرادات' } };

export default function AccountGroupsScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync(`
      SELECT a.*, (SELECT COUNT(*) FROM accounts WHERE parent_id = a.id) as children_count,
        COALESCE((SELECT SUM(sub.current_balance) FROM accounts sub WHERE sub.parent_id = a.id AND sub.is_active = 1), 0) as total_balance
      FROM accounts a WHERE a.is_virtual = 1 AND a.is_active = 1 AND a.level <= 2 ORDER BY a.code
    `);
    setGroups(result || []); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37"/></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📁 مجموعات الحسابات</Text><TouchableOpacity onPress={loadData}><Text style={styles.refresh}>🔄</Text></TouchableOpacity></View>
      <FlatList data={groups} keyExtractor={i => i.id.toString()} refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} />}
        renderItem={({ item }) => { const ti = TYPE_COLORS[item.type] || { color: '#64748B', icon: '📋' }; return (
          <TouchableOpacity style={[styles.card, { borderLeftColor: ti.color }]} onPress={() => router.push('/ledger/accounts' as any)}>
            <View style={[styles.colorBar, { backgroundColor: ti.color }]} /><Text style={styles.icon}>{ti.icon}</Text>
            <View style={styles.info}><Text style={styles.code}>{item.code}</Text><Text style={styles.name}>{item.name_ar}</Text>
              <View style={styles.row}><Text style={styles.children}>👶 {item.children_count || 0} حساب</Text><Text style={[styles.balance, (item.total_balance || 0) >= 0 ? styles.pos : styles.neg]}>{(item.total_balance || 0).toLocaleString()} ﷼</Text></View>
            </View>
          </TouchableOpacity>
        ); }}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد مجموعات</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},refresh:{fontSize:22,padding:8},
  list:{padding:12},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213E',borderRadius:12,marginBottom:8,overflow:'hidden',borderWidth:1,borderColor:'#2a3550',borderLeftWidth:4},
  colorBar:{width:4,height:'100%'},
  icon:{fontSize:22,marginLeft:10},
  info:{flex:1,padding:12},
  code:{color:'#94A3B8',fontSize:11},name:{color:'#FFF',fontSize:14,fontWeight:'600',marginTop:2},
  row:{flexDirection:'row',justifyContent:'space-between',marginTop:6},
  children:{color:'#3B82F6',fontSize:10},
  balance:{fontSize:12,fontWeight:'bold'},pos:{color:'#10B981'},neg:{color:'#EF4444'},
  empty:{color:'#64748B',textAlign:'center',marginTop:40},
});
