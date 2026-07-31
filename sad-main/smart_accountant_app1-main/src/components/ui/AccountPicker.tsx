import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useDatabase } from '../../context/DatabaseContext';
import { Colors, Spacing, FontSizes } from '../../theme/colors';

interface AccountPickerProps {
  visible: boolean;
  onSelect: (account: any) => void;
  onClose: () => void;
  filterType?: string;
  title?: string;
}

export default function AccountPicker({ visible, onSelect, onClose, filterType, title = 'اختر حساب' }: AccountPickerProps) {
  const { db, isReady } = useDatabase();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && db) loadAccounts();
  }, [visible, db, search]);

  const loadAccounts = async () => {
    setLoading(true);
    let query = 'SELECT * FROM accounts WHERE is_active=1 AND is_leaf=1';
    const params: any[] = [];
    if (filterType) {
      query += ' AND type = ?';
      params.push(filterType);
    }
    if (search) {
      query += ' AND (name_ar LIKE ? OR code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY code LIMIT 50';
    const result = await db!.getAllAsync(query, params);
    setAccounts(result as any[]);
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
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="بحث عن حساب..."
            placeholderTextColor={Colors.textMuted}
          />
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{marginTop:20}} />
          ) : (
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
                  <Text style={styles.code}>{item.code}</Text>
                  <Text style={styles.name}>{item.name_ar}</Text>
                  <Text style={styles.balance}>{(item.current_balance || 0).toLocaleString()}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>لا توجد حسابات</Text>}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.7)' },
  container: { backgroundColor: Colors.surface, borderTopLeftRadius:20, borderTopRightRadius:20, maxHeight:'80%', paddingBottom:20 },
  header: { flexDirection:'row', justifyContent:'space-between', padding:Spacing.lg, borderBottomWidth:1, borderBottomColor:Colors.border },
  title: { color: Colors.primary, fontSize: FontSizes.xl, fontWeight:'bold' },
  close: { color: Colors.credit, fontSize:20 },
  search: { backgroundColor: Colors.card, margin:Spacing.md, padding:Spacing.md, borderRadius:8, color: Colors.text, borderWidth:1, borderColor: Colors.border },
  item: { flexDirection:'row', alignItems:'center', paddingVertical:12, paddingHorizontal:16, borderBottomWidth:0.5, borderBottomColor:Colors.border },
  code: { color: Colors.primary, fontWeight:'bold', width:70 },
  name: { color: Colors.text, flex:1 },
  balance: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  empty: { color: Colors.textMuted, textAlign:'center', marginTop:20 }
});
