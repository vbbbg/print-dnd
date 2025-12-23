### 分页打印

目前的实现逻辑如下：

#### 1. 分页核心逻辑

- **计算可用高度**:
  - 系统首先确定页面的可用**表格区域高度**。
  - 计算公式：`AvailableHeight = FooterTopY - BodyTopY`。
  - `FooterTopY`: 取所有页脚元素（Footer Items）中 `y` 坐标最小的值。如果没有页脚元素，则默认预留底部 20mm 边距。
  - `BodyTopY`: 模板中定义的表格起始 `y` 坐标。

- **计算每页行数**:
  - 使用预估的行高 `ESTIMATED_ROW_HEIGHT_MM` (目前设定为 10mm)。
  - `RowsPerPage = Math.floor(AvailableHeight / 10mm)`。

- **数据切分**:
  - 根据 `RowsPerPage` 将表格数据列表 (`data.list`) 切分成多个块 (Chunks)。
  - 每个块对应生成一个 PDF 页面。

#### 2. 页面元素渲染规则

对于生成的每一页（`.page` 容器）：

- **页眉 (Header)**: 在每一页都会重复渲染。
- **主标题 (Title)**: 在每一页都会重复渲染。
- **页脚 (Footer)**: 在每一页都会重复渲染。
- **表格 (Table)**:
  - **表头 (Thead)**: 在每一页的表格中都会重复显示，保证上下文清晰。
  - **表体 (Tbody)**: 仅显示当前页面对应的数据块。
  - **合计行 (Total Row)**: **仅在最后一页**的表格底部显示。

#### 3. 技术实现细节

- 使用 HTML/CSS 进行物理分页。
- 每个页面被包裹在 `<div class="page">` 中。
- CSS 样式 `.page { page-break-after: always; }` 确保打印时强制分页。
- 最后一页使用 `page-break-after: auto`。
