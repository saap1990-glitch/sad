import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';
import { Colors, Spacing, FontSizes } from '../../src/theme/colors';

export default function GeneralLedgerScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    if (!db) return; setLoading(true);
    const result = await db.getAllAsync(`
      SELECT je.*, 
        (SELECT GROUP_CONCAT(a.code || ':' || a.name_ar || ' D:' || jl.debit || ' C:' || jl.credit, ' | ') 
         FROM journal_lines jl JOIN accounts a ON a.id = jl.account_id WHERE jl.entry_id = je.id) as details
      FROM journal_entries je
      ORDER BY je.date DESC, je.id DESC LIMIT 100
    `);
    setEntries(result as any[]); setLoading(false);
  }, [db]);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const filtered = search ? entries.filter(e => e.description?.includes(search) || e.entry_number?.includes(search) || e.details?.includes(search)) : entries;

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity><Text style={styles.t}>📖 الأستاذ العام</Text><View style={{width:40}}/></View>
      <TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="بحث..." placeholderTextColor="#666" textAlign="right" />
      <FlatList
        data={filtered}
        keyExtractor={(_,i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardH}>
              <Text style={styles.entryNum}>{item.entry_number}</Text>
              <Text style={styles.entryDate}>{item.date}</Text>
            </View>
            <Text style={styles.entryDesc}>{item.description}</Text>
            <Text style={styles.entryDetails}>{item.details}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد قيود</Text>}
        contentContainerStyle={{padding:12}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:Colors.background},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,backgroundColor:Colors.surface,borderBottomWidth:1,borderBottomColor:Colors.border},
  back:{fontSize:24,color:Colors.primary},t:{fontSize:18,fontWeight:'bold',color:Colors.primary},
  search:{backgroundColor:Colors.card,margin:12,padding:10,borderRadius:8,color:Colors.text,borderWidth:1,borderColor:Colors.border},
  card:{backgroundColor:Colors.card,padding:14,borderRadius:10,marginBottom:8},
  cardH:{flexDirection:'row',justifyContent:'space-between'},
  entryNum:{color:Colors.primary,fontWeight:'bold'},
  entryDate:{color:Colors.textSecondary,fontSize:12},
  entryDesc:{color:Colors.text,marginTop:4},
  entryDetails:{color:Colors.textMuted,fontSize:10,marginTop:4},
  empty:{color:Colors.textMuted,textAlign:'center',marginTop:30},
});
