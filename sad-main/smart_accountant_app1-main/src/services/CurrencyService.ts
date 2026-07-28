import * as SQLite from 'expo-sqlite';

class CurrencyService {
  async getBaseCurrency(db: SQLite.SQLiteDatabase | null): Promise<string> {
    if (!db) return 'YER';
    const result = await db.getFirstAsync("SELECT code FROM currencies WHERE is_base = 1") as any;
    return result?.code || 'YER';
  }

  async getExchangeRate(db: SQLite.SQLiteDatabase | null, currencyCode: string): Promise<number> {
    if (!db) return 1;
    if (currencyCode === 'YER') return 1;
    const result = await db.getFirstAsync(
      "SELECT rate FROM exchange_rates WHERE currency_id = (SELECT id FROM currencies WHERE code = ?) ORDER BY date DESC LIMIT 1",
      [currencyCode]
    ) as any;
    return result?.rate || 1;
  }

  async convertToBase(db: SQLite.SQLiteDatabase | null, amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === 'YER' || !db) return amount;
    const rate = await this.getExchangeRate(db, fromCurrency);
    return amount * rate;
  }

  async convertFromBase(db: SQLite.SQLiteDatabase | null, amountInBase: number, toCurrency: string): Promise<number> {
    if (toCurrency === 'YER' || !db) return amountInBase;
    const rate = await this.getExchangeRate(db, toCurrency);
    return amountInBase / rate;
  }
}

export const currencyService = new CurrencyService();
