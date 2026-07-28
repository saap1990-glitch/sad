// ✅ API الاتصال بلوحة تحكم المالك
const OWNER_DASHBOARD_URL = 'https://your-dashboard.com/api';

export const ownerAPI = {
  // التحقق من الاشتراك
  async checkSubscription(userId: string) {
    try {
      const response = await fetch(`${OWNER_DASHBOARD_URL}/subscription/${userId}`);
      return await response.json();
    } catch {
      // إذا ما فيه إنترنت - استخدم البيانات المخزنة محلياً
      return { active: true, type: 'local', expiresAt: null };
    }
  },

  // التحقق من التحديثات
  async checkUpdates(currentVersion: string) {
    try {
      const response = await fetch(`${OWNER_DASHBOARD_URL}/updates/latest`);
      const data = await response.json();
      return {
        hasUpdate: data.version !== currentVersion,
        version: data.version,
        mandatory: data.mandatory,
        notes: data.notes,
      };
    } catch {
      return { hasUpdate: false };
    }
  },

  // إرسال تقرير خطأ
  async reportCrash(error: any) {
    try {
      await fetch(`${OWNER_DASHBOARD_URL}/crashes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          screen: error.screen,
          file: error.file,
          line: error.line,
          device: error.device,
          os: error.os,
          version: error.version,
          time: new Date().toISOString(),
        }),
      });
    } catch {}
  },

  // مزامنة البيانات
  async syncData(userId: string, data: any) {
    try {
      await fetch(`${OWNER_DASHBOARD_URL}/sync/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {}
  },
};
