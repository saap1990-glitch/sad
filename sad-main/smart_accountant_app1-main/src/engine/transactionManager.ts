export const transactionManager = {
  async begin(): Promise<string> {
    return 'tx-' + Date.now();
  },

  async commit(txId: string) {
    console.log('✅ تم اعتماد المعاملة:', txId);
    return true;
  },

  async rollback(txId: string) {
    console.log('❌ تم التراجع عن المعاملة:', txId);
    return true;
  },
};
