import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useDatabase } from '../../context/DatabaseContext';
import { Colors, Spacing, FontSizes } from '../../theme/colors';

interface CurrencyPickerProps {
  visible: boolean;
  onSelect: (currency: any) => void;
  onClose: () => void;
  title?: string;
}

export default function CurrencyPicker({ visible, onSelect, onClose, title = 'اختر عملة' }: CurrencyPickerProps) {
  const { db, isReady } = useDatabase();
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && db) loadCurrencies();
  }, [visible, db]);

  const loadCurrencies = async () => {
    setLoading(true);
    const result = await db!.getAllAsync('SELECT * FROM currencies WHERE is_active=1 ORDER BY code');
    setCurrencies(result as any[]);
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{marginTop:20}} />
          ) : (
            <FlatList
              data={currencies}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
                  <Text style={styles.symbol}>{item.symbol || '¤'}</Text>
                  <Text style={styles.name}>{item.name_ar} ({item.code})</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.7)' },
  container: { backgroundColor: Colors.surface, borderTopLeftRadius:20, borderTopRightRadius:20, maxHeight:'60%' },
  header: { flexDirection:'row', justifyContent:'space-between', padding:Spacing.lg, borderBottomWidth:1, borderBottomColor:Colors.border },
  title: { color: Colors.primary, fontSize: FontSizes.xl, fontWeight:'bold' },
  close: { color: Colors.credit, fontSize:20 },
  item: { flexDirection:'row', alignItems:'center', paddingVertical:14, paddingHorizontal:20, borderBottomWidth:0.5, borderBottomColor:Colors.border },
  symbol: { fontSize:20, marginRight:12, color: Colors.primary },
  name: { color: Colors.text, fontSize: FontSizes.lg }
});
