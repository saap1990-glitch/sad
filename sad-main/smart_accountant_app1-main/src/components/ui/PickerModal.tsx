import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PickerModalProps {
  visible: boolean;
  title: string;
  data: any[];
  displayField?: string;
  subField?: string;
  showBalance?: boolean;
  onSelect: (item: any) => void;
  onClose: () => void;
}

export function PickerModal({ visible, title, data, displayField = 'name_ar', subField = 'code', showBalance = true, onSelect, onClose }: PickerModalProps) {
  const [search, setSearch] = useState('');

  const filteredData = search.trim()
    ? data.filter(item => {
        const name = (item[displayField] || '').toLowerCase();
        const code = (item[subField] || '').toLowerCase();
        const query = search.toLowerCase();
        return name.includes(query) || code.includes(query);
      })
    : data;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{filteredData.length}</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="بحث..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => (item.id || index).toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
              <View style={styles.itemLeft}>
                {item.icon ? <Text style={styles.itemIcon}>{item.icon}</Text> : null}
                <View style={styles.itemInfo}>
                  <View style={styles.itemTopRow}>
                    {item[subField] ? <Text style={styles.itemCode}>{item[subField]}</Text> : null}
                    <Text style={styles.itemName}>{item[displayField]}</Text>
                  </View>
                  {item.type && (
                    <Text style={styles.itemType}>
                      {item.type === 'asset' ? '🏦 أصول' : item.type === 'liability' ? '💳 خصوم' : item.type === 'expense' ? '📊 مصروفات' : item.type === 'revenue' ? '💰 إيرادات' : ''}
                    </Text>
                  )}
                </View>
              </View>
              {showBalance && item.current_balance !== undefined && (
                <Text style={[styles.itemBalance, (item.current_balance || 0) >= 0 ? styles.positive : styles.negative]}>
                  {(item.current_balance || 0).toLocaleString()} ﷼
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>لا توجد نتائج</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#16213E', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: '#EF4444', fontSize: 18, fontWeight: 'bold' },
  title: { color: '#D4AF37', fontSize: 17, fontWeight: 'bold' },
  count: { backgroundColor: '#D4AF37', color: '#0A1128', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginVertical: 10, backgroundColor: '#16213E', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#2a3550' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#FFF' },
  clearSearch: { color: '#EF4444', fontSize: 16, padding: 4 },

  // List
  listContent: { paddingBottom: 20 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#2a3550' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemIcon: { fontSize: 22, marginRight: 10 },
  itemInfo: { flex: 1 },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemCode: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
  itemName: { color: '#FFF', fontSize: 14, flex: 1 },
  itemType: { color: '#64748B', fontSize: 10, marginTop: 2 },
  itemBalance: { fontSize: 13, fontWeight: 'bold', minWidth: 80, textAlign: 'right' },
  positive: { color: '#10B981' },
  negative: { color: '#EF4444' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: '#64748B', fontSize: 15 },
});
