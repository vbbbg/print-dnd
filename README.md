# Print DND Monorepo

这是一个包含打印编辑器 (`print-editor`) 和 PDF 生成器 (`pdf-generator`) 的 Monorepo 项目。本项目旨在提供一个可拖拽的打印模版设计器，以及基于该模版生成 PDF 的能力。

## 📦 核心包

- **print-editor**: 基于 React 的所见即所得打印模版编辑器。
- **pdf-generator**: 基于模版数据生成 PDF 的工具库 (使用 `@react-pdf/renderer`)。

## 🧩 数据结构 (Data Structures)

核心数据结构定义在 `EditorState` 中，它描述了整个打印模版的布局和内容。

### EditorState

整个编辑器的状态树。

```typescript
interface EditorState {
  name: string // 模版名称
  paperType: 'A4' | 'A4_2' | 'A4_3' | 'custom' // 纸张类型
  paperWidth: number // 纸张宽度 (mm)
  paperHeight: number // 纸张高度 (mm)
  margins: {
    // 页边距
    top: number
    bottom: number
    left: number
    right: number
  }
  regions: Region[] // 区域列表
}
```

### Region (区域)

页面被划分为不同的区域，主要有以下几种类型：

1.  **FreeLayoutRegion (自由布局区域)**
    - `type`: `'free-layout'`
    - `data`: `EditorItem[]` (包含文本、图片等绝对定位元素)
2.  **TableRegion (表格区域)**
    - `type`: `'table'`
    - `data`: `TableItem[]` (定义表格列和属性)

### EditorItem (元素)

页面上的基本元素。

```typescript
interface EditorItem {
  type: 'text' | 'image' | 'table' | 'qrcode' | 'line'
  x: number
  y: number
  width: number
  height: number
  value?: string // 固定值 (例如固定文本)
  field?: string // 绑定的数据字段名 (例如 "orderNo")
  title?: string // 表格列标题
  // ... 样式属性 (fontSize, bold, etc.)
}
```

---

## 🚀 集成教程 (Integration)

### 1. 集成编辑器 (Print Editor)

`TemplateEditor` 是核心组件，提供了完整的编辑功能。

#### 🔌 组件注册 (Component Registration)

在使用编辑器之前，**必须**注册需要使用的组件插件。通常在应用入口或编辑器组件外部执行一次。

```tsx
import {
  componentRegistry,
  TextPlugin,
  ImagePlugin,
  TablePlugin,
  QRCodePlugin,
  LinePlugin,
} from 'print-editor'

// 注册标准组件
componentRegistry.register(TextPlugin)
componentRegistry.register(ImagePlugin)
componentRegistry.register(TablePlugin)
componentRegistry.register(QRCodePlugin)
componentRegistry.register(LinePlugin)

// 如果有自定义组件，也可以通过 componentRegistry.register(MyCustomPlugin) 进行注册
```

#### 🎨 自定义组件开发 (Custom Component Development)

你可以开发自定义组件来扩展编辑器的能力。需要实现 `ComponentPlugin` 接口。

```tsx
import React from 'react'
import { ComponentPlugin, ComponentRenderProps } from 'print-editor'

// 1. 定义渲染组件
const MyCustomRender: React.FC<ComponentRenderProps> = ({ item }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>
      {item.value || 'Default Text'}
    </div>
  )
}

// 2. 定义属性配置面板 (可选)
// interface SettingsPanelProps { item: EditorItem; onChange: (updates) => void }
// const MySettingsPanel: React.FC<SettingsPanelProps> = ...

// 3. 定义插件配置
export const MyCustomPlugin: ComponentPlugin = {
  type: 'my-custom', // 唯一标识类型
  name: '自定义组件', // 显示名称
  defaultWidth: 100,
  defaultHeight: 50,
  render: MyCustomRender, // 渲染组件
  // settingsPanel: MySettingsPanel, // 右侧属性面板组件 (可选)
  defaultData: {
    // 拖入时的默认数据
    type: 'my-custom',
    value: 'Hello World',
  },
}

// 4. 注册插件
// componentRegistry.register(MyCustomPlugin);
```

#### ✨ 功能特性

- **拖拽排版**: 支持文本、图片、二维码、表格等元素的自由拖拽和缩放。
- **撤销/重做**: 内置主要操作的历史记录支持。
- **打印预览**: 支持实时注入测试数据进行打印预览。
- **自定义工具栏**: 可以完全自定义工具栏按钮，通过回调获取编辑器状态。
- **布局辅助**: 提供对齐线、吸附功能，支持缩放查看。

#### 📝 组件参数 (Props)

| 属性名             | 类型                  | 说明                                                  |
| :----------------- | :-------------------- | :---------------------------------------------------- |
| `initialState`     | `EditorState`         | (可选) 编辑器的初始状态，用于加载已有模版。           |
| `previewData`      | `Object`              | (可选) 预览时使用的测试数据。                         |
| `toolbar`          | `EditorToolbarConfig` | (可选) 自定义工具栏配置，用于添加保存按钮等。         |
| `renderLeftPanel`  | `Function`            | (可选) 自定义左侧面板渲染函数。`(props) => ReactNode` |
| `renderRightPanel` | `Function`            | (可选) 自定义右侧面板渲染函数。`(props) => ReactNode` |
| `className`        | `string`              | (可选) 容器类名。                                     |

#### 💻 完整集成示例

以下示例展示了如何集成编辑器，包含自定义工具栏和默认的侧边栏（如果需要完全自定义侧边栏，可以传入自定义组件）。

```tsx
import React from 'react'
import {
  TemplateEditor,
  EditorState,
  EditorLeftSidebar,
  EditorRightSidebar,
} from 'print-editor'
// 引入样式 (具体路径取决于构建工具，通常是 dist/style.css 或源文件)
import 'print-editor/dist/index.css'

function MyEditorPage() {
  // 1. 定义保存处理函数
  const handleSave = (state: EditorState) => {
    console.log('✅ 保存模版数据:', state)
    // 这里可以将 state 发送到后端 API 保存
    // fetch('/api/templates', { method: 'POST', body: JSON.stringify(state) });
  }

  // 2. 自定义工具栏
  // state 参数包含了当前的 zoom, editorState, canUndo 等信息
  const customToolbar = (state) => [
    {
      id: 'actions',
      items: [
        {
          id: 'save',
          title: '保存模版',
          icon: () => <span>💾</span>, // 可以使用图标组件
          onClick: handleSave, // 点击时会自动传入当前的 editorState
        },
        // 你也可以复用内置的 action，例如 'undo', 'redo', 'zoom-in'
        { id: 'undo', action: 'undo', title: '撤销' },
        { id: 'redo', action: 'redo', title: '重做' },
      ],
    },
  ]

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TemplateEditor
        initialState={undefined} // 或者传入已有的 template 对象
        previewData={{ name: '张三', orderId: '10086' }} // 预览数据
        toolbar={{
          groups: customToolbar,
        }}
        // 使用内置的侧边栏组件，或者替换为你自己的组件
        renderLeftPanel={(props) => <EditorLeftSidebar {...props} />}
        renderRightPanel={(props) => <EditorRightSidebar {...props} />}
        className="flex-1" // 确保编辑器占满剩余空间
      />
    </div>
  )
}

export default MyEditorPage
```

### 2. 生成 PDF (PDF Generation)

使用 `generatePdf` 函数，传入模版 (`EditorState`) 和真实数据数组。

```tsx
import { generatePdf } from 'pdf-generator'

const generateAndDownload = async (template: EditorState, dataList: any[]) => {
  try {
    // dataList 是一个对象数组，每个对象对应一页的数据
    // 例如: [{ orderNo: '1001', items: [...] }, { orderNo: '1002', ... }]
    const blob = await generatePdf(template, dataList)

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'print-job.pdf'
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('PDF Generation failed:', err)
  }
}
```

## 🛠️ 本地开发 (Development)

本项目使用 pnpm 进行包管理。

1.  **安装依赖**

    ```bash
    pnpm install
    ```

2.  **启动开发环境**

    ```bash
    pnpm dev
    ```

    这将同时启动各个子包的开发模式（如果有配置）。通常主要在 `apps/print-editor` 下进行调试。

3.  **构建**
    ```bash
    pnpm build
    ```
