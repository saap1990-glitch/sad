import { SQLiteDatabase } from 'expo-sqlite';

export async function seedAccounts(db: SQLiteDatabase) {
  const count = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM accounts');
  if ((count as any).cnt > 0) return;

  // إدخال العملات الأساسية
  await db.runAsync(`INSERT INTO currencies (code, name_ar, symbol, exchange_rate, is_base, is_active) VALUES 
    ('YER', 'ريال يمني', '﷼', 1, 1, 1),
    ('USD', 'دولار أمريكي', '$', 250, 0, 1),
    ('SAR', 'ريال سعودي', '﷼', 66, 0, 1)
  `);

  // حسابات المستوى الأول
  await db.runAsync(`INSERT INTO accounts (code, name_ar, name_en, level, type, nature, is_virtual, is_leaf, is_system, is_active) VALUES 
    ('1', 'الأصول', 'Assets', 1, 'asset', 'debit', 1, 0, 1, 1),
    ('2', 'الخصوم', 'Liabilities', 1, 'liability', 'credit', 1, 0, 1, 1),
    ('3', 'المصروفات', 'Expenses', 1, 'expense', 'debit', 1, 0, 1, 1),
    ('4', 'الإيرادات', 'Revenues', 1, 'revenue', 'credit', 1, 0, 1, 1)
  `);

  // حسابات المستوى الثاني والثالث (اختصارًا)
  const accounts = [
    // الأصول
    { code: '11', name_ar: 'الأصول المتداولة', level: 2, type: 'asset', nature: 'debit', parent: '1' },
    { code: '12', name_ar: 'الأصول غير المتداولة', level: 2, type: 'asset', nature: 'debit', parent: '1' },
    { code: '1101', name_ar: 'الصندوق', level: 3, type: 'asset', nature: 'debit', parent: '11' },
    { code: '1102', name_ar: 'البنوك', level: 3, type: 'asset', nature: 'debit', parent: '11' },
    { code: '1103', name_ar: 'شركات الصرافة', level: 3, type: 'asset', nature: 'debit', parent: '11' },
    { code: '1104', name_ar: 'المحافظ الإلكترونية', level: 3, type: 'asset', nature: 'debit', parent: '11' },
    { code: '1105', name_ar: 'العملاء', level: 3, type: 'asset', nature: 'debit', parent: '11' },
    { code: '1106', name_ar: 'المخزون', level: 3, type: 'asset', nature: 'debit', parent: '11' },
    { code: '1107', name_ar: 'العهد', level: 3, type: 'asset', nature: 'debit', parent: '11' },
    { code: '1201', name_ar: 'الأراضي', level: 3, type: 'asset', nature: 'debit', parent: '12' },
    { code: '1202', name_ar: 'المباني', level: 3, type: 'asset', nature: 'debit', parent: '12' },
    { code: '1203', name_ar: 'السيارات', level: 3, type: 'asset', nature: 'debit', parent: '12' },
    { code: '1204', name_ar: 'الأجهزة', level: 3, type: 'asset', nature: 'debit', parent: '12' },
    { code: '1205', name_ar: 'الأثاث', level: 3, type: 'asset', nature: 'debit', parent: '12' },
    // الخصوم
    { code: '21', name_ar: 'الخصوم المتداولة', level: 2, type: 'liability', nature: 'credit', parent: '2' },
    { code: '22', name_ar: 'الخصوم طويلة الأجل', level: 2, type: 'liability', nature: 'credit', parent: '2' },
    { code: '2101', name_ar: 'الموردون', level: 3, type: 'liability', nature: 'credit', parent: '21' },
    { code: '2102', name_ar: 'أوراق الدفع', level: 3, type: 'liability', nature: 'credit', parent: '21' },
    { code: '2103', name_ar: 'الرواتب المستحقة', level: 3, type: 'liability', nature: 'credit', parent: '21' },
    { code: '2104', name_ar: 'الضرائب المستحقة', level: 3, type: 'liability', nature: 'credit', parent: '21' },
    { code: '2201', name_ar: 'قروض طويلة الأجل', level: 3, type: 'liability', nature: 'credit', parent: '22' },
    // المصروفات
    { code: '31', name_ar: 'المصروفات التشغيلية', level: 2, type: 'expense', nature: 'debit', parent: '3' },
    { code: '32', name_ar: 'المصروفات الإدارية', level: 2, type: 'expense', nature: 'debit', parent: '3' },
    { code: '33', name_ar: 'المصروفات البيعية', level: 2, type: 'expense', nature: 'debit', parent: '3' },
    { code: '3101', name_ar: 'الرواتب', level: 3, type: 'expense', nature: 'debit', parent: '31' },
    { code: '3102', name_ar: 'الإيجارات', level: 3, type: 'expense', nature: 'debit', parent: '31' },
    { code: '3103', name_ar: 'الكهرباء والمياه', level: 3, type: 'expense', nature: 'debit', parent: '31' },
    { code: '3104', name_ar: 'الاتصالات', level: 3, type: 'expense', nature: 'debit', parent: '31' },
    { code: '3105', name_ar: 'الصيانة', level: 3, type: 'expense', nature: 'debit', parent: '31' },
    { code: '3106', name_ar: 'الوقود', level: 3, type: 'expense', nature: 'debit', parent: '31' },
    { code: '3107', name_ar: 'النقل', level: 3, type: 'expense', nature: 'debit', parent: '31' },
    { code: '3201', name_ar: 'القرطاسية', level: 3, type: 'expense', nature: 'debit', parent: '32' },
    { code: '3202', name_ar: 'مصروف بنكي', level: 3, type: 'expense', nature: 'debit', parent: '32' },
    // الإيرادات
    { code: '41', name_ar: 'إيرادات النشاط الرئيسي', level: 2, type: 'revenue', nature: 'credit', parent: '4' },
    { code: '42', name_ar: 'الإيرادات الأخرى', level: 2, type: 'revenue', nature: 'credit', parent: '4' },
    { code: '4101', name_ar: 'المبيعات', level: 3, type: 'revenue', nature: 'credit', parent: '41' },
    { code: '4102', name_ar: 'إيرادات الخدمات', level: 3, type: 'revenue', nature: 'credit', parent: '41' },
    { code: '4201', name_ar: 'إيراد آخر', level: 3, type: 'revenue', nature: 'credit', parent: '42' },
  ];

  for (const acc of accounts) {
    const parentRow = await db.getFirstAsync('SELECT id FROM accounts WHERE code = ?', [acc.parent]) as any;
    if (parentRow) {
      await db.runAsync(
        `INSERT INTO accounts (code, name_ar, level, type, nature, parent_id, is_virtual, is_leaf, is_system, is_active) VALUES (?,?,?,?,?,?,1,0,1,1)`,
        [acc.code, acc.name_ar, acc.level, acc.type, acc.nature, parentRow.id]
      );
    }
  }

  // إضافة حساب نقدي فعلي (ورقة)
  await db.runAsync(`INSERT INTO accounts (code, name_ar, level, type, nature, parent_id, is_leaf, is_active) VALUES ('110101', 'الصندوق الرئيسي', 4, 'asset', 'debit', (SELECT id FROM accounts WHERE code='1101'), 1, 1)`);

  console.log('✅ تم إدراج الحسابات الأساسية');
}
