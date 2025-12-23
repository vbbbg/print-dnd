const generateList = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    serialNumber: i + 1,
    spuName: `测试商品长长长长长长长长名称 ${i + 1}`,
    skuName: `测试规格 ${i + 1}`,
    unitName: '个',
    qty: 10 + i,
    price: (100 + i * 10).toFixed(2),
    amount: ((100 + i * 10) * (10 + i)).toFixed(2),
    remark: i % 5 === 0 ? '加急' : '',
  }))
}

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
  currentDue: '¥999,996.00',

  // Table Data List - Generated 50 rows
  list: generateList(50),
}
