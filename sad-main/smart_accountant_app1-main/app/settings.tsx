import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../src/context/SettingsContext';
import { BackupService } from '../src/services/BackupService';
import { AuthService } from '../src/services/AuthService';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, theme, updateSetting, t } = useSettings();

  const menuItems = [
    { icon: '👤', label: t('profile'), route: '/settings/profile' },
    { icon: '🖨️', label: t('print_settings'), route: '/settings/print' },
    { icon: '🔒', label: t('security'), route: '/settings/security' },
    { icon: '💱', label: t('currencies'), route: '/ledger/currencies' },
    { icon: '💾', label: t('backup_settings'), route: '/settings/backup' },
    { icon: '🔔', label: t('notifications'), route: '/settings/notifications' },
    { icon: '⚙️', label: t('advanced'), route: '/settings/advanced' },
    { icon: '🌐', label: t('language_theme'), route: '/settings/appearance' },
  ];

  const quickActions = [
    { icon: '📥', label: t('save_backup'), action: () => BackupService.createBackup() },
    { icon: '🔄', label: t('restore_backup'), action: () => Alert.alert(t('restore'), 'جاري فتح الملفات...') },
    { icon: '📞', label: t('contact_support'), action: () => Alert.alert(t('support'), 'SmartAccountant@gmail.com') },
    { icon: 'ℹ️', label: t('about'), route: '/about' },
    { icon: '🔗', label: t('share_app'), action: async () => { try { await Share.share({ message: 'جرب دفتر المحاسب الذكي - تطبيق محاسبي متكامل!' }); } catch (e) {} } },
    { icon: '🚪', label: t('logout'), action: async () => { await AuthService.logout(); router.replace('/login'); } },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* اللغة السريعة */}
        <View style={styles.langRow}>
          <TouchableOpacity style={[styles.langBtn, language === 'ar' && styles.langBtnActive]} onPress={() => updateSetting('language', 'ar')}>
            <Text style={[styles.langT, language === 'ar' && styles.langTActive]}>🇾🇪 العربية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.langBtn, language === 'en' && styles.langBtnActive]} onPress={() => updateSetting('language', 'en')}>
            <Text style={[styles.langT, language === 'en' && styles.langTActive]}>🇺🇸 English</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('general_settings')}</Text>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={() => item.route ? router.push(item.route as any) : item.action?.()}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
        {quickActions.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={() => item.route ? router.push(item.route as any) : item.action?.()}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1128' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0E1630', borderBottomWidth: 1, borderBottomColor: '#1a2745' },
  backBtn: { fontSize: 22, color: '#D4AF37' },
  title: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  langBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#16213E', alignItems: 'center', borderWidth: 1, borderColor: '#2a3550' },
  langBtnActive: { borderColor: '#D4AF37', backgroundColor: '#D4AF3720' },
  langT: { color: '#94A3B8', fontSize: 14 },
  langTActive: { color: '#D4AF37', fontWeight: 'bold' },
  sectionTitle: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213E', padding: 14, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: '#2a3550' },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { color: '#FFF', fontSize: 14, flex: 1 },
  menuArrow: { color: '#D4AF37', fontSize: 16 },
});
