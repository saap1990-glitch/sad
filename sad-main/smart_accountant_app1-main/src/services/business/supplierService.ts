export const supplierService = {
  async create(data: any) {
    return { success: true, message: `تم إضافة المورد: ${data.name}` };
  },
};
