# 模板数据结构文档

主要基于对 `template.json` 的分析，以下是数据结构字段的详细说明：

## 根字段 (Root Fields)

- **`bodyItems`**: 定义文档的主要表格/列表区域（通常是商品明细列表）。
  - `cols`: 列定义的数组。
  - `type`: 区域类型（例如 "table"）。
- **`headerItems`**: 页眉区域显示的项的数组（例如：客户名称、单号、日期等）。
- **`footerItems`**: 页脚区域显示的项的数组（例如：总金额、账户信息、签名等）。
- **`templateTitle`**: 定义文档主标题的项的数组。
- **`imgList`**: 图片项的数组（例如：Logo、二维码）。
- **`paperInfo`**: 页面配置信息。
  - `pageWidth`, `pageHeight`: 纸张尺寸。
  - `tableWidth`: 表格区域的宽度。
  - `tableHeadHeight`, `titleHeight`: 特定区域的高度。
- **`fontInfo`**: 默认字体设置。
- **`lineHeightInfo`**: 文档行高设置。
- **`margins`**: (`top`, `bottom`, `left`, `right`) 文档边距（通常从 `top`, `left` 等根字段推断，虽然可能没有显式的 `margins` 对象，但存在独立的边距字段）。

## 项结构 (Common Fields - Header/Footer/Title)

`headerItems`, `footerItems`, `templateTitle` 中的项通常包含以下属性：

- **`alias`**: 别名/显示标签（人类可读的名称）。
- **`name`**: 内部名称。
- **`field`**: 该项映射的数据字段（例如 `customerName`, `billNo`）。
- **`type`**: 项的类型（例如 `text` 文本, `img` 图片）。
- **`value`**: 默认值或示例文本。
- **`visible`**: 布尔值，是否显示该项。
- **`x`, `y`**: 定位坐标（通常相对于所在区域或页面）。
- **`width`, `height`**: 项的尺寸（宽、高）。
- **`fontFamily`, `fontSize`, `fontColor`**: 字体样式属性。
- **`bold`, `italic`, `underline`**: 文本样式标记（加粗、斜体、下划线）。
- **`alignment`**: 对齐方式（`verticalAlignment`, `horizontalAlignment` 或 implied by `align`）。

## 列结构 (Column Structure - bodyItems.cols)

- **`colname`**:列对应的数据字段名（例如 `barCode`, `qty`）。
- **`title`**: 列头显示的文本。
- **`width`**: 列宽。
- **`visible`**: 是否可见。
- **`align`**: 文本对齐方式（`bodyAlign` 内容对齐, `titleAlign` 标题对齐等）。
- **`sum`, `pageSum`**: 与合计、页合计相关的属性。

## 坐标系统 (Coordinate System)

- **`x`, `y`**: 似乎是用于打印/渲染的逻辑坐标。
- **`webX`, `webY`**: 可能是专门用于 Web 渲染的坐标，或是另一套坐标空间的坐标。
