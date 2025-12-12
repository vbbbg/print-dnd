### 各区域内容

- templateTitle 填充到主标题区域
- headerItems 填充到页眉区域
- bodyItems 填充到表格区
- footerItems 填充到页脚区域

### item 数据结构

参看 template.json

### 拖动规则

- 除了表格区域，其他各个区域的item，可以拖动放置
- 拖动时，要实时更新，不显示preview
- 坐标系统使用 mm 单位，显示时通过 `SCALE` 常量 (3.78px/mm) 进行转换
- 不允许拖动到 paper 之外
- 不允许拖动到表格区域
- header region 可以拖动到 footer region
- item 拖动时，可以经过表格区域，只是不允许放置

### 单位与坐标

- 内部数据存储 (EditorState) 使用 **mm** 为单位
- 渲染层使用显式转换：`px = mm * SCALE` (3.78)
- 布局属性 (width, height, top, left) 均通过 `mmToPx` 转换
- **坐标系**: 采用扁平化(Flat)坐标系。虽然逻辑上Item属于某个Region，但在渲染时，Item直接相对于Paper (0,0) 定位，避免了Region偏移量的重复叠加。
- 字体大小也乘以 `SCALE` 以保证清晰度
- **不再使用** 全局 `transform: scale()`，避免字体模糊和边框失真
