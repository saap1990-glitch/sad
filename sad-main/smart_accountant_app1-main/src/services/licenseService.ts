import { ownerAPI } from './ownerAPI';

export const licenseService = {
  // التحقق من الترخيص عند بدء التشغيل
  async validate() {
    const userId = 'user-123'; // يجيب من AsyncStorage
    const subscription = await ownerAPI.checkSubscription(userId);
    
    if (!subscription.active) {
      return { valid: false, message: 'انتهى الاشتراك. يرجى التجديد.' };
    }
    
    return { valid: true, subscription };
  },

  // التحقق من التحديثات
  async checkUpdates() {
    const currentVersion = '1.0.0';
    return await ownerAPI.checkUpdates(currentVersion);
  },

  // إرسال تقرير خطأ
  async reportError(error: any) {
    await ownerAPI.reportCrash({
      message: error.message,
      screen: error.screen || 'unknown',
      file: error.file || 'unknown',
      line: error.line || 0,
      device: 'Mobile',
      os: 'Android/iOS',
      version: '1.0.0',
    });
  },
};
