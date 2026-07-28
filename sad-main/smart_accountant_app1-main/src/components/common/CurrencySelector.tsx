import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDatabase } from '../../context/DatabaseContext';

interface Props {
  selectedCurrency: string;
  exchangeRate: string;
  onCurrencyChange: (currency: string, rate: string) => void;
}

export const CurrencySelector: React.FC<Props> = ({ selectedCurrency, exchangeRate, onCurrencyChange }) => {
  const { db } = useDatabase();
  const [currencies, setCurrencies] = useState<any[]>([]);

  useEffect(() => {
    if (db) db.getAllAsync('SELECT * FROM currencies ORDER BY isDefault DESC').then(setCurrencies);
  }, [db]);

  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: '#9A9B3B', fontSize: 13, marginBottom: 6 }}>العملة</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {currencies.map((c: any) => (
          <TouchableOpacity
            key={c.id}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
              backgroundColor: selectedCurrency === c.code ? '#D4AF3720' : '#0A1128',
              borderWidth: 1, borderColor: selectedCurrency === c.code ? '#D4AF37' : '#2a3550',
            }}
            onPress={() => onCurrencyChange(c.code, String(c.rate || 1))}
          >
            <Text style={{ color: selectedCurrency === c.code ? '#D4AF37' : '#94a3b8', fontSize: 12 }}>
              {c.symbol} {c.code}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedCurrency !== 'YER' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 10 }}>سعر الصرف:</Text>
          <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold' }}>1 {selectedCurrency} = {exchangeRate} ﷼</Text>
        </View>
      )}
    </View>
  );
};
