export const MOCK_REAL_DATA: Record<string, any> = {
  // Common Fields
  title: '销售单',

  // Header Fields
  billNo: 'SO-20241217-001',
  customerName: '深圳市华为技术有限公司',
  makeTimeDate: '2024-12-17 10:30:00',
  fullAddress: '广东省深圳市龙岗区坂田街道华为基地',
  contactName: '张三',
  contactPhone: '13800138000',
  remark: '请发顺丰特快，谢谢合作。',

  // Footer Fields
  handlerName: '李四',
  examineUserName: '王五',
  currentDue: '¥12,500.00',

  // Table Rows (Usually handled by RegionTable, but good to have for context)
  serialNumber: 1,
  spuName: '华为 Mate 60 Pro',
  skuName: '12GB+512GB 雅川青',
  unitName: '台',
  qty: 2,
  price: '6999.00',
  amount: '13998.00',
}
