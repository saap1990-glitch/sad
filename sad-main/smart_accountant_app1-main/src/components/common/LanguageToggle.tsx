import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { i18n } from '../../i18n/i18nService';

export const LanguageToggle: React.FC = () => {
  const toggle = () => i18n.toggle();

  return (
    <TouchableOpacity style={st.btn} onPress={toggle}>
      <Text style={st.text}>{i18n.currentLocale === 'ar' ? '🇺🇸 EN' : '🇾🇪 عربي'}</Text>
    </TouchableOpacity>
  );
};

const st = StyleSheet.create({
  btn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#D4AF3720', borderRadius: 8, borderWidth: 1, borderColor: '#D4AF3740' },
  text: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
});
