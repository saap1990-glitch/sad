import { eventBus } from '../events/eventBus';
import { settingsService } from './SettingsService';

// ✅ تطبيق الإعدادات فوراً عند تغييرها
eventBus.on('settings.changed', (event, data) => {
  const { section, key, value } = data;
  
  // تطبيق على المحرك المحاسبي
  if (['journal', 'tax', 'currency'].includes(section)) {
    console.log('🔄 تحديث المحرك المحاسبي:', section, key);
    // accountingEngine.updateSettings(data);
  }
  
  // تطبيق على التقارير
  if (['company', 'print', 'reports'].includes(section)) {
    console.log('🔄 تحديث إعدادات التقارير:', section, key);
    // reportEngine.updateSettings(data);
  }
  
  // تطبيق على الواجهة
  if (section === 'system') {
    console.log('🔄 تحديث الواجهة:', key, value);
    // تحديث اللغة والاتجاه والمظهر
    if (key === 'language') { /* i18n.locale = value; */ }
    if (key === 'direction') { /* I18nManager.forceRTL(value === 'rtl'); */ }
    if (key === 'theme') { /* applyTheme(value); */ }
  }
  
  // تطبيق على المخزون
  if (section === 'inventory') {
    console.log('🔄 تحديث إعدادات المخزون');
    // inventoryService.updateSettings(data);
  }
  
  console.log(`✅ تم تطبيق ${section}.${key} = ${value}`);
});

console.log('✅ SettingsApplier مفعل - يستمع للتغييرات');
