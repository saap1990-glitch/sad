import { Account, AccountType, AccountNature, AccountLevel } from '../../shared/types';

export class AccountEntity implements Account {
  id!: number;
  code!: string;
  nameAr!: string;
  nameEn!: string;
  type!: AccountType;
  nature!: AccountNature;
  level!: AccountLevel;
  parentId!: number | null;
  currencyId!: number;
  isPostable!: boolean;
  allowMovements!: boolean;
  isVirtual!: boolean;
  openingBalance!: number;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  isActive!: boolean;

  constructor(data: Partial<AccountEntity>) {
    Object.assign(this, data);
  }

  // توليد الكود تلقائياً حسب المستوى والأب
  static generateCode(parentCode: string | null, level: AccountLevel, lastChildCode?: string): string {
    if (!parentCode) {
      // المستوى الأول: 1, 2, 3, 4
      const prefixes = { asset: '1', liability: '2', expense: '3', revenue: '4' };
      return prefixes.asset; // سيتم تحديده حسب النوع
    }

    const parts = parentCode.split('');
    const length = level * 2;
    
    if (lastChildCode) {
      const lastNumber = parseInt(lastChildCode.slice(-2)) || 0;
      const nextNumber = String(lastNumber + 1).padStart(2, '0');
      return parentCode + nextNumber;
    }

    return parentCode + '01';
  }

  // التحقق من صحة المستوى
  isValidLevel(): boolean {
    return this.level >= 1 && this.level <= 5;
  }

  // التحقق من إمكانية الترحيل
  canPost(): boolean {
    return this.isPostable && this.allowMovements && this.isActive;
  }
}
