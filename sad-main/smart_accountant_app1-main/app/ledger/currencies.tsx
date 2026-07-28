import { eventBus, Events } from '../../src/events/eventBus';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDatabase } from '../../src/context/DatabaseContext';

export default function CurrenciesScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets();
  const { db, isReady } = useDatabase();
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRate, setShowRate] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [newRate, setNewRate] = useState('');

  useEffect(() => { if (isReady && db) load(); }, [isReady, db]);

  async function load() {
    if (!db) return;
    const result = await db.getAllAsync(`
      SELECT c.*, COALESCE((SELECT rate FROM exchange_rates WHERE currency_id=c.id ORDER BY date DESC LIMIT 1), 1) as current_rate
      FROM currencies c WHERE c.is_active=1 ORDER BY c.is_base DESC, c.code
    `);
    setCurrencies(result as any[]); setLoading(false);
  }

  async function updateRate() {
    if (!selectedCurrency || !newRate || !db) return;
    await db.runAsync('INSERT INTO exchange_rates (currency_id, rate, date) VALUES (?,?,date("now"))', [selectedCurrency.id, parseFloat(newRate)]);
    setShowRate(false); setNewRate(''); load();
    Alert.alert('✅', `تم تحديث سعر ${selectedCurrency.code} إلى ${newRate}`);
  }

  if (!isReady || loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;

  return (
    <View style={[styles.c, { paddingTop: insets.top }]}>
      <View style={styles.h}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.t}>💱 العملات وأسعار الصرف</Text>
        <View style={{width:40}} />
      </View>

      <FlatList data={currencies} keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setSelectedCurrency(item); setNewRate(String(item.current_rate)); setShowRate(true); }}>
            <Text style={styles.icon}>{item.is_base ? '⭐' : '💱'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.name}>{item.code} - {item.name_ar}</Text>
              <Text style={styles.symbol}>{item.symbol}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.rate}>{item.current_rate?.toLocaleString()}</Text>
              <Text style={styles.rateLabel}>سعر الصرف</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد عملات</Text>}
        contentContainerStyle={styles.list}
      />

      <Modal visible={showRate} animationType="slide" transparent>
        <View style={styles.modal}><View style={styles.modalC}>
          <Text style={styles.modalT}>تحديث سعر الصرف</Text>
          {selectedCurrency && (
            <>
              <Text style={styles.curLabel}>{selectedCurrency.code} - {selectedCurrency.name_ar}</Text>
              <TextInput style={styles.inp} value={newRate} onChangeText={setNewRate} keyboardType="numeric" placeholder="سعر الصرف" placeholderTextColor="#666" textAlign="center" />
              <View style={styles.btns}>
                <TouchableOpacity style={styles.cancel} onPress={() => setShowRate(false)}><Text style={styles.cancelT}>إلغاء</Text></TouchableOpacity>
                <TouchableOpacity style={styles.save} onPress={updateRate}><Text style={styles.saveT}>💾 تحديث</Text></TouchableOpacity>
              </View>
            </>
          )}
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#0A1128'},center:{flex:1,justifyContent:'center',alignItems:'center'},
  h:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,backgroundColor:'#0E1630',borderBottomWidth:1,borderBottomColor:'#1a2745'},
  back:{fontSize:22,color:'#D4AF37'},t:{color:'#D4AF37',fontSize:17,fontWeight:'bold'},
  list:{padding:12},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#16213E',padding:14,borderRadius:12,marginBottom:8},
  icon:{fontSize:28,marginRight:12},name:{color:'#FFF',fontSize:15,fontWeight:'600'},symbol:{color:'#D4AF37',fontSize:13,marginTop:2},
  rate:{color:'#10B981',fontSize:18,fontWeight:'bold'},rateLabel:{color:'#64748B',fontSize:9},
  empty:{color:'#64748B',textAlign:'center',marginTop:40},
  modal:{flex:1,justifyContent:'center',backgroundColor:'rgba(0,0,0,0.8)',padding:20},
  modalC:{backgroundColor:'#16213E',borderRadius:16,padding:20},
  modalT:{color:'#D4AF37',fontSize:18,fontWeight:'bold',textAlign:'center',marginBottom:16},
  curLabel:{color:'#FFF',fontSize:16,textAlign:'center',marginBottom:12},
  inp:{backgroundColor:'#0A1128',borderRadius:10,padding:14,color:'#FFF',fontSize:20,fontWeight:'bold',textAlign:'center',borderWidth:2,borderColor:'#D4AF3740',marginBottom:16},
  btns:{flexDirection:'row',gap:10},
  cancel:{flex:1,padding:14,borderRadius:10,backgroundColor:'#2a3550',alignItems:'center'},cancelT:{color:'#94A3B8'},
  save:{flex:2,padding:14,borderRadius:10,backgroundColor:'#D4AF37',alignItems:'center'},saveT:{color:'#0A1128',fontWeight:'bold'},
});
