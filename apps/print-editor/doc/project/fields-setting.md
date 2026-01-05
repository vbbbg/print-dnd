# 字段设置面板 (Field Settings Panel)

## 1. 概述

字段设置面板允许用户管理打印模板中各区域（表头、表体、表尾）的字段。
通过左侧侧边栏的 "Fields" 标签页访问，提供可视化、交互式的字段添加与移除功能。

## 2. 数据结构

### 源数据 (`items.json`)

由 `src/types/fields.ts` 定义：

```typescript
interface JsonField {
  width: number // 原始宽度 (参考用)
  key: string // 字段名称 (如 "客户名称")
  value: string // 字段唯一标识/数据键 (如 "customer_name")
  customColFlg: boolean
  index: number
  child: any[]
}
```

## 3. 映射逻辑

当用户将字段添加到画布时，`JsonField` (源) 会映射为 `EditorItem` (目标)。

| 属性      | 源 (items.json) | 目标 (EditorItem) | 说明                                  |
| --------- | --------------- | ----------------- | ------------------------------------- |
| **Field** | `value`         | `field`           | **核心绑定**：用于数据绑定的唯一标识  |
| **Name**  | `key`           | `name`            | 元素名称元数据                        |
| **Value** | `key`           | `value`           | 画布显示文本，默认为 `key + ":"`      |
| **X**     | -               | `x`               | 默认对齐左边距 (`margins.left`)       |
| **Y**     | -               | `y`               | 区域顶部 (`RegionTop`) + 自动堆叠偏移 |

## 4. 默认行为

### 初始样式

新添加的字段默认应用以下样式：

- **字体**: `SimHei` (黑体)
- **字号**: `11`
- **颜色**: `#000000` (黑色)
- **尺寸**: `40mm` x `8mm`

### 自动布局

为保持简单，新添加的字段默认放置在区域的左上角：

- `X = margins.left`
- `Y = RegionTop`
  不进行自动堆叠处理，允许初始重叠。

## 5. 交互逻辑

### 自由布局区域 (Header/Footer)

- **添加**:
  - 检查 `state.headerItems` 或 `state.footerItems` 中是否存在该字段 (`item.field === json.value`).
  - 若不存在，创建新 `EditorItem` 并推入数组。
- **移除**:
  - 若存在，从数组中过滤掉 (`filter`) 该字段。

### 表格区域 (Body)

- **显示/隐藏**:
  - 表体字段映射为表格列 (`TableColumn`)。
  - **添加**: 若列存在，设为 `visible: true`；若不存在，追加新列。
  - **移除**: 将对应列设为 `visible: false`。

## 6. 技术实现

- **Hook**: `src/hooks/useFieldSettings.ts`
  - 封装了所有添加/移除逻辑。
  - 抽象了 `toggleFreeLayoutItem` 方法处理 Header/Footer 的通用逻辑。
- **Component**: `src/components/FieldSettingsPanel.tsx`
  - 负责渲染字段列表。
  - 接收 `EditorState` 并调用 Hook 方法更新状态。
