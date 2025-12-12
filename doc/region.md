### 区域

将纸张分为主标题区域，页眉区域，页脚区域和表格区域

#### 区域数据结构

在 `template.json` 中定义以下字段来记录各区域的边界位置（Y坐标）：

- `headerTop`: 主标题区域结束位置（即页眉区域起始位置）
- `bodyTop`: 页眉区域结束位置（即表格区域起始位置）
- `footerTop`: 表格区域结束位置（即页脚区域起始位置）
- `paperHeight`: 纸张总高度
- `paperWidth`: 纸张总宽度

各区域范围如下：

1. **Title Region**: 0 ~ `headerTop`
2. **Header Region**: `headerTop` ~ `bodyTop`
3. **Body Region**: `bodyTop` ~ `footerTop`
4. **Footer Region**: `footerTop` ~ `paperHeight`

#### 功能

- 支持通过拖拽边界线（Handler）来改变相邻区域的大小。
