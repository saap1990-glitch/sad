export const customerService = {
  async create(data: any) {
    return { success: true, message: `تم إضافة العميل: ${data.name}` };
  },

  async updateBalance(data: any) {
    return { success: true };
  },
};
