// ================================================================
// الأنواع الأساسية للنظام المحاسبي
// ================================================================

export type AccountType = 'asset' | 'liability' | 'expense' | 'revenue';
export type AccountNature = 'debit' | 'credit';
export type AccountLevel = 1 | 2 | 3 | 4 | 5;
export type CurrencyCode = string;
export type TransactionType = 
  | 'journal' | 'sales' | 'purchase' | 'cash' | 'bank' 
  | 'exchange' | 'wallet' | 'asset' | 'depreciation';

export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Account extends BaseEntity {
  code: string;
  nameAr: string;
  nameEn: string;
  type: AccountType;
  nature: AccountNature;
  level: AccountLevel;
  parentId: number | null;
  currencyId: number;
  isPostable: boolean;
  allowMovements: boolean;
  isVirtual: boolean;
  openingBalance: number;
  notes: string | null;
}

export interface Currency extends BaseEntity {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  isBase: boolean;
  decimalPlaces: number;
}

export interface ExchangeRate extends BaseEntity {
  currencyId: number;
  rate: number;
  date: Date;
}
