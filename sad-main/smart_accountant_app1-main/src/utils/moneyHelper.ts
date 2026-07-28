export const roundYER = (amount: number): number => Math.round(amount * 100) / 100;
export const formatYER = (amount: number): string => roundYER(amount).toLocaleString();
export const parseAmount = (value: string): number => roundYER(parseFloat(value) || 0);
