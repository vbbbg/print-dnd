### 基础设置卡片

- 模板名称：修改模板名称
- 纸张大小
  - A4
    - 默认展示
  - 二等分
    - 默认展示
  - 自定义（mm）
    - 纸张宽度
    - 纸张高度
- 边距(mm)
  - 上下左右

### 数据结构

在 `EditorState` 中增加以下字段：

```typescript
interface EditorState {
  // ... existing fields
  name: string // 模板名称
  paperType: 'A4' | 'A4_2' | 'A4_3' | 'custom' // 纸张规格: A4, A4_2(二等分), A4_3(三等分), custom(自定义)
  paperWidth: number // 纸张宽度 (mm)
  paperHeight: number // 纸张高度 (mm)
  margins: {
    top: number // 上边距 (mm)
    bottom: number // 下边距 (mm)
    left: number // 左边距 (mm)
    right: number // 右边距 (mm)
  }
}
```

### 其他

- margin 区域有颜色区分
- 改变 margin 时，自动更新 items
