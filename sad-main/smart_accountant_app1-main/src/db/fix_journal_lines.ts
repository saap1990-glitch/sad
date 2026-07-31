// سيتم استدعاؤها من migrations.ts
export const JOURNAL_LINES_FIX = `
  ALTER TABLE journal_lines ADD COLUMN currency_id INTEGER REFERENCES currencies(id);
  ALTER TABLE journal_lines ADD COLUMN exchange_rate REAL DEFAULT 1;
  ALTER TABLE journal_lines ADD COLUMN foreign_amount REAL DEFAULT 0;
`;
