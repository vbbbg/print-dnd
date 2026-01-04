# Print DND 编辑器组件

`TemplateEditor` 是一个用于拖拽式打印模板设计的 React 组件。它支持自定义纸张大小、多区域（页眉、列表体、页脚）布局，以及可插拔的组件系统。

## 使用方法 (Usage)

```tsx
import { TemplateEditor } from './components/TemplateEditor'
import { MOCK_REAL_DATA } from './utils/mockRealData'

// 1. 注册插件 (通常在应用入口处)
import { componentRegistry } from './core/ComponentRegistry'
import { TextPlugin } from './plugins/TextPlugin'
componentRegistry.register(TextPlugin)

function App() {
  return (
    <TemplateEditor
      previewData={MOCK_REAL_DATA} // 用于预览变量替换的数据
      initialState={myEditorState} // 初始模板布局状态
      onSave={(state) => console.log(state)}
    />
  )
}
```

## 数据结构 (Data Structures)

### 1. EditorState (模板布局)

`EditorState` 定义了打印模板的整体结构，包括纸张设置和区域列表。

```typescript
interface EditorState {
  name: string // 模板名称
  paperWidth: number // 纸张宽度 (mm)
  paperHeight: number // 纸张高度 (mm)
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  regions: Region[] // 布局区域列表
}
```

### 2. Region (区域)

页面被划分为多个垂直排列的“区域”。最常见的模式是：

1.  **页眉 (Header)** (自由布局)
2.  **列表体 (Body)** (表格)
3.  **页脚 (Footer)** (自由布局)

```typescript
interface Region {
  id: string // 例如：'header', 'body', 'footer'
  type: 'free-layout' | 'table'
  top: number // 绝对顶部位置 (mm，相对于纸张顶部)

  // 针对 'free-layout' 类型的区域：
  items?: EditorItem[]

  // 针对 'table' 类型的区域：
  data?: TableData
}
```

### 3. EditorItem (组件项)

位于 `free-layout` 区域内的具体元素。

```typescript
interface EditorItem {
  type: 'text' | 'image' | 'qrcode' | 'line'
  x: number // 相对 x 坐标 (相对于所在 Region)
  y: number // 相对 y 坐标 (相对于所在 Region)
  width: number
  height: number

  // 数据绑定
  field?: string // 绑定 previewData 中的字段名 (例如 'customerName')
  value?: string // 静态文本值

  // 样式属性
  fontSize?: number
  fontFamily?: string
  bold?: boolean
  horizontalAlignment?: 'left' | 'center' | 'right'
  // ... 其他样式属性
}
```

### 4. TableData (表格配置)

用于配置中心表格区域的数据结构。

```typescript
interface TableData {
  cols: TableColumn[]
}

interface TableColumn {
  title: string // 列标题
  colname: string // 对应列表项中的字段名 (key)
  width: number // 列宽
}
```

## 预览数据 (Preview Data)

`previewData` 是一个普通的 JS 对象，用于在编辑器中填充变量字段以进行预览。

```typescript
const previewData = {
  // 简单字段 (绑定到 field='billNo' 的 text 组件)
  billNo: 'SO-20241217-001',
  customerName: '华为技术有限公司',

  // 列表数据 (会被 'table' 类型的区域自动渲染)
  list: [
    { sku: 'A001', name: '商品 A', price: 100 },
    { sku: 'A002', name: '商品 B', price: 200 },
  ],
}
```

## 组件属性 (Props)

| 属性名             | 类型                   | 说明                             |
| ------------------ | ---------------------- | -------------------------------- |
| `initialState`     | `EditorState`          | 模板的初始布局状态。             |
| `previewData`      | `Record<string, any>`  | 用于预览变量绑定的模拟数据。     |
| `toolbar`          | `EditorToolbarConfig`  | 工具栏配置 (见下文)。            |
| `renderLeftPanel`  | `(props) => ReactNode` | 渲染左侧设置面板的 Render Prop。 |
| `renderRightPanel` | `(props) => ReactNode` | 渲染右侧属性面板的 Render Prop。 |

## 工具栏配置 (Toolbar Configuration)

工具栏是完全可定制的。如果你不提供 `toolbar.groups`，工具栏组件将不会渲染。

```typescript
const toolbarConfig: EditorToolbarConfig = {
  // 方式 1: 静态分组
  groups: [
    {
      id: 'actions',
      items: [{ id: 'save', icon: SaveIcon, onClick: handleSave }],
    },
  ],

  // 方式 2: 动态分组 (基于 state)
  groups: (state: ToolbarState) => [
    {
      id: 'zoom',
      items: [{ id: 'zoom-in', title: `缩放 (${state.zoom}%)` }],
    },
  ],
}
```
