# 基础设置 (Basic Settings)

## 1. 概述

基础设置面板位于左侧边栏的 "Settings" 标签页，允许用户配置打印模板的全局属性，如纸张大小、页边距和模板名称。

## 2. 功能特性

### 2.1 模板名称

- 允许用户修改当前打印模板的名称。
- 只有保存时才会持久化。

### 2.2 纸张规格 (Paper Size)

支持多种预设与自定义纸张规格：

| 规格类型            | 说明        | 尺寸 (宽 x 高)  |
| ------------------- | ----------- | --------------- |
| **A4**              | 标准 A4 纸  | 210mm x 297mm   |
| **二等分 (A4_2)**   | A4 纸对半切 | 210mm x 148.5mm |
| **三等分 (A4_3)**   | A4 纸三等分 | 210mm x 99mm    |
| **自定义 (Custom)** | 手动输入    | 用户自定义      |

**交互逻辑**：

- 选择预设规格时，自动更新 `paperWidth` 和 `paperHeight`，禁用手动输入。
- 选择 "自定义" 时，允许用户手动输入宽度和高度。

### 2.3 页边距 (Margins)

- 提供 **上、下、左、右** 四个方向的边距设置 (单位: mm)。
- **视觉反馈**: 中间画布 (`Paper` 组件) 会实时渲染出灰色的边距遮罩区域，直观展示打印有效区域。
- **自动约束**: 当边距发生变化时，画布上的已有元素会自动检测并调整位置，确保不超出有效打印区域（根据 `constrainItemsToMargins` 逻辑）。

## 3. 数据结构

相关状态定义在 `EditorState` 中：

```typescript
// defined in src/types/editor.ts

interface EditorState {
  // ... 其他字段
  name: string // 模板名称

  // 纸张设置
  paperType: 'A4' | 'A4_2' | 'A4_3' | 'custom'
  paperWidth: number // mm
  paperHeight: number // mm
  paperDefinitions: PaperDefinition[] // 可选的纸张预设列表

  // 页边距
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}
```

## 4. 常量定义

预设纸张定义在 `src/constants/paper.ts`：

```typescript
export const PAPER_DEFINITIONS: PaperDefinition[] = [
  { type: 'A4', name: 'A4 (210mm x 297mm)', width: 210, height: 297 },
  { type: 'A4_2', name: '二等分 (210mm x 148.5mm)', width: 210, height: 148.5 },
  { type: 'A4_3', name: '三等分 (210mm x 99mm)', width: 210, height: 99 },
  { type: 'custom', name: '自定义' },
]
```
