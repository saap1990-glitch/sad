import { AuthService } from './AuthService';

const DEFAULT_LICENSE_KEY = 'SMART-2024-DEMO-FREE';
const TRIAL_DAYS = 90;

export class LicenseService {
  static async getValue(key: string): Promise<string | null> {
    return AuthService.getSetting(key);
  }

  static async setValue(key: string, value: string): Promise<void> {
    await AuthService.setSetting(key, value);
  }

  static async startTrial(): Promise<void> {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + TRIAL_DAYS);
    await this.setValue('license_plan', 'trial');
    await this.setValue('license_start', now.toISOString());
    await this.setValue('license_end', end.toISOString());
  }

  static async activateSubscription(plan: 'semi_annual' | 'annual', key: string): Promise<boolean> {
    if (key !== DEFAULT_LICENSE_KEY) return false;
    const now = new Date();
    const end = new Date();
    if (plan === 'semi_annual') end.setMonth(end.getMonth() + 6);
    else end.setFullYear(end.getFullYear() + 1);
    await this.setValue('license_key', key);
    await this.setValue('license_plan', plan);
    await this.setValue('license_start', now.toISOString());
    await this.setValue('license_end', end.toISOString());
    return true;
  }

  static async renewSubscription(plan: 'semi_annual' | 'annual'): Promise<void> {
    const currentEnd = await this.getValue('license_end');
    const endDate = currentEnd ? new Date(currentEnd) : new Date();
    if (plan === 'semi_annual') endDate.setMonth(endDate.getMonth() + 6);
    else endDate.setFullYear(endDate.getFullYear() + 1);
    await this.setValue('license_end', endDate.toISOString());
    await this.setValue('license_plan', plan);
  }

  static async checkLicense(): Promise<any> {
    const plan = await this.getValue('license_plan');
    const startDate = await this.getValue('license_start');
    const endDate = await this.getValue('license_end');

    if (!plan && !startDate) {
      await this.startTrial();
      return { valid: true, message: `فترة تجريبية - ${TRIAL_DAYS} يوم`, daysLeft: TRIAL_DAYS, plan: 'trial', isTrial: true, endDate: '', tampered: false };
    }

    const end = new Date(endDate || '');
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const currentPlan = plan || 'trial';

    if (diff > 0) {
      return { valid: true, message: `متبقي ${diff} يوم`, daysLeft: diff, plan: currentPlan, isTrial: currentPlan === 'trial', endDate: endDate || '', tampered: false };
    }
    return { valid: false, message: 'انتهت صلاحية الترخيص', daysLeft: 0, plan: currentPlan, isTrial: currentPlan === 'trial', endDate: endDate || '', tampered: false };
  }

  static async getLicenseInfo(): Promise<any> {
    const result = await this.checkLicense();
    return {
      plan: result.plan, isTrial: result.isTrial,
      key: (await this.getValue('license_key')) || 'غير مفعل',
      startDate: (await this.getValue('license_start')) || 'غير معروف',
      endDate: (await this.getValue('license_end')) || 'غير معروف',
      daysLeft: result.daysLeft, valid: result.valid,
    };
  }
}
