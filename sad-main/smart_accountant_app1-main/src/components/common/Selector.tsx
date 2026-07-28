import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useDatabase } from '../../context/DatabaseContext';

interface SelectorProps {
  label: string; tableName: string; displayField?: string; subField?: string;
  filterField?: string; filterValue?: string;
  selectedId: string; selectedName: string;
  onSelect: (item: any) => void;
  showBalance?: boolean; placeholder?: string;
}

export const Selector: React.FC<SelectorProps> = ({
  label, tableName, displayField = 'name', subField, filterField, filterValue,
  placeholder = 'اختر...', selectedId, selectedName, onSelect, showBalance
}) => {
  const { db, isReady } = useDatabase();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => { if (visible && db) loadData(); }, [visible, tableName, db]);

  const loadData = async () => {
    if (!db) return;
    try {
      let sql = `SELECT * FROM ${tableName}`;
      if (filterField && filterValue) sql += ` WHERE ${filterField} = '${filterValue}'`;
      sql += ` ORDER BY ${displayField}`;
      const result = await db.getAllAsync(sql);
      setData(result);
    } catch (e) { setData([]); }
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((item: any) =>
      (item[displayField] || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // ✅ جلب تفاصيل الرصيد للعنصر المحدد
  const selectedAccount = accounts.find((a: any) => a.id === selectedId);
  const balance = selectedAccount?.balance || 0;
  const currency = selectedAccount?.currency || 'YER';
  const nature = selectedAccount?.isDebit !== 0 ? 'مدين' : 'دائن';

  return (
    <View style={{ marginBottom: 10 }}>
      {label ? <Text style={{ color: '#9A9B3B', fontSize: 13, marginBottom: 4 }}>{label}</Text> : null}
      
      <TouchableOpacity
        style={{
          flexDirection: 'row', justifyContent: 'space-between',
          backgroundColor: '#0A1128', padding: 12, borderRadius: 10,
          borderWidth: 1, borderColor: '#2a3550'
        }}
        onPress={() => { setVisible(true); setSearch(''); }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: selectedName ? '#FFF' : '#666', fontSize: 14, textAlign: 'right' }}>
            {selectedName || placeholder}
          </Text>
          {/* ✅ عرض الرصيد والطبيعة تحت الاسم */}
          {showBalance && selectedId && selectedAccount && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: balance >= 0 ? '#10B981' : '#EF4444', fontSize: 11 }}>
                الرصيد: {Math.abs(balance).toLocaleString()} ﷼
              </Text>
              <Text style={{ color: nature === 'مدين' ? '#10B981' : '#EF4444', fontSize: 11 }}>
                {nature}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ color: '#D4AF37', fontSize: 12 }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#16213E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
            <TextInput
              style={{ margin: 16, padding: 12, backgroundColor: '#0A1128', borderRadius: 10, color: '#FFF', textAlign: 'right' }}
              placeholder="🔍 بحث..."
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
            />
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#2a3550' }}
                  onPress={() => { onSelect(item); setVisible(false); }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFF', fontSize: 14, textAlign: 'right' }}>{item[displayField]}</Text>
                      {item[subField || 'code'] && <Text style={{ color: '#94a3b8', fontSize: 11, textAlign: 'right' }}>{item[subField || 'code']}</Text>}
                    </View>
                    {/* ✅ الرصيد في القائمة */}
                    {showBalance && (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: (item.balance || 0) >= 0 ? '#10B981' : '#EF4444', fontSize: 13, fontWeight: 'bold' }}>
                          {Math.abs(item.balance || 0).toLocaleString()} ﷼
                        </Text>
                        <Text style={{ color: (item.isDebit !== 0) ? '#10B981' : '#EF4444', fontSize: 10 }}>
                          {item.isDebit !== 0 ? 'مدين' : 'دائن'}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setVisible(false)} style={{ padding: 14, backgroundColor: '#EF4444', alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 16 }}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
