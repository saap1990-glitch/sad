import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export const ItemRow = ({ item, onUpdate, onRemove, showRemove }: any) => {
  const total = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
  return (
    <View style={st.row}>
      {showRemove && (
        <TouchableOpacity onPress={() => onRemove(item.id)} style={st.removeBtn}>
          <Text style={st.removeText}>✕</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 2 }}>
        <Text style={st.itemName}>{item.itemName || 'اختر الصنف'}</Text>
      </View>
      <TextInput
        style={st.input}
        keyboardType="numeric"
        placeholder="كمية"
        placeholderTextColor="#666"
        value={item.qty === '0' ? '' : item.qty}
        onChangeText={v => onUpdate(item.id, 'qty', v || '0')}
      />
      <TextInput
        style={st.input}
        keyboardType="numeric"
        placeholder="سعر"
        placeholderTextColor="#666"
        value={item.price === '0' ? '' : item.price}
        onChangeText={v => onUpdate(item.id, 'price', v || '0')}
      />
      <Text style={st.total}>{total.toLocaleString()} ﷼</Text>
    </View>
  );
};

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1128', padding: 10, borderRadius: 8, marginBottom: 6, gap: 6 },
  removeBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EF444420', justifyContent: 'center', alignItems: 'center' },
  removeText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
  itemName: { color: '#FFF', fontSize: 13, textAlign: 'right' },
  input: { flex: 1, backgroundColor: '#16213E', color: '#FFF', padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 13 },
  total: { flex: 1, color: '#10B981', fontWeight: 'bold', textAlign: 'right', fontSize: 13 },
});
