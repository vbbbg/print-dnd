### 设置项卡片 (Item Settings Panel)

## 基础交互 (Interaction)

- **默认选中**: 编辑器加载时，默认选中标题区域的第一个组件 (`templateTitle`)。
- **点击选中**: 点击 Title、Header、Footer 区域的任意组件即可选中，选中时显示蓝色边框。
- **面板位置**: 位于屏幕右侧，与左侧边栏对称。
- **视觉样式**: 无左侧边框 (`border-l-0`)，保持干净简洁。

## 设置项 (Settings Fields)

根据选中的组件类型显示相应的属性设置：

### 1. 基础信息 (Basic Info)

- **字段名称 (Field Name)**:
  - 显示组件绑定的内部字段名 (如 `templateTitle`, `orderCode`)。
  - **只读 (Read-Only)**: 不可直接修改字段绑定，以保证数据映射的稳定性。
  - 样式: 灰色背景，提示不可编辑。
- **别名 (Alias)**:
  - 可编辑文本框。
  - 用于修改组件在打印模板上的显示名称（如果支持）。

### 2. 位置与尺寸 (Position & Size)

- **单位**: 毫米 (mm)
- **属性**:
  - `X`: 水平坐标
  - `Y`: 垂直坐标
  - `W`: 宽度
  - `H`: 高度
- **交互**: 输入数值后实时更新组件位置和大小。

### 3. 字体样式 (Typography)

- **大小 (Font Size)**: 输入像素值 (px)。
- **字体 (Font Family)**: 下拉选择 (黑体, 宋体, Arial, Times New Roman)。
- **样式开关**:
  - **B** (Bold): 加粗
  - **I** (Italic): 斜体
  - **U** (Underline): 下划线

### 4. 对齐方式 (Alignment)

- **水平对齐**:
  - 左对齐 (Left)
  - 居中对齐 (Center)
  - 右对齐 (Right)
