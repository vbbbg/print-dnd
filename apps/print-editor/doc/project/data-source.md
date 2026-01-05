### 真实数据预览 (Real Data Preview)

为了让模板编辑体验更接近真实的打印效果，编辑器支持注入真实业务数据进行预览。

## 数据源 (Data Source)

- **模拟数据文件**: `src/utils/mockRealData.ts`
- **结构**: 一个扁平的对象 `Record<string, any>`，key 对应组件的 `field` 属性。
- **示例**:
  ```typescript
  export const MOCK_REAL_DATA = {
    billNo: 'SO-20241217-001',
    customerName: '深圳市华为技术有限公司',
    // ...
  }
  ```

## 数据注入 (Injection Flow)

1. **Editor 层面**: `TemplateEditor` 导入 `MOCK_REAL_DATA` 并通过 `data` 属性传递给 `Paper` 组件。
2. **Paper 层面**: `Paper` 组件接收 `data`，并在渲染 `DraggableItem` 时向下传递。
3. **Item 层面**: `DraggableItem` 根据自身的 `field` 属性去 `data` 中查找对应的值。

## 显示逻辑 (Rendering Logic)

组件的显示内容遵循以下优先级规则：

1. **真实数据模式 (Real Data Match)**:
   - 如果组件绑定了 `field` **且** 在数据源中找到了对应值：
   - **格式**: `[显示名称]: [真实值]`
   - **显示名称优先级**: `Alias` (别名) > `Name` (原名)
   - **示例**:
     - 设定: Alias="客户", Field="customerName", Value="Huawei"
     - 显示: `客户: Huawei`

2. **设计模式 (Fallback)**:
   - 如果未找到真实数据：
   - **显示内容**: `Alias` (别名) || `Value` (预设值) || `Name` (原名)

## 优势 (Benefits)

- **所见即所得**: 用户能直接看到 "排版后的长短效果"，而非枯燥的占位符 `{customerName}`。
- **验证别名**: 修改别名后，能立即看到 "别名: 真实值" 的组合效果，方便校验标签语义。
