# 页面布局 (Layout)

## 1. 概述

打印设计器采用经典的 **三栏布局** 设计，旨在提供最大的操作空间同时保持工具的易用性。

- **左侧边栏 (Left Sidebar)**: 资源与设置
- **中间画布 (Center Canvas)**: 核心编辑区
- **右侧边栏 (Right Sidebar)**: 属性面板

## 2. 详细规格

### 左侧边栏 (Left Sidebar)

- **宽度**: `288px` (Tailwind `w-72`)
- **功能**: 可收起/展开
- **内容**: 采用选项卡 (`Tabs`) 组织
  - **基础设置 (Settings)**: 纸张大小、边距等全局配置。
  - **字段设置 (Fields)**: 可拖拽或点击添加的字段列表 (Header/Body/Footer)。
- **交互**: 点击侧边悬浮按钮进行展开/收起切换。

### 中间画布 (Center Canvas)

- **宽度**: 自适应 (`flex-1`)
- **功能**:
  - **自动滚动**: 当画布内容超出视口时，显示滚动条。
  - **缩放**: 支持画布缩放 (`transform: scale(...)`)，以适应不同屏幕尺寸。
  - **居中显示**: 纸张默认在区域内水平居中。
- **内容**: `Paper` 组件，模拟真实的打印纸张效果。

### 右侧边栏 (Right Sidebar)

- **宽度**: `288px` (Tailwind `w-72`)
- **功能**: 可收起/展开
- **内容**:
  - **组件属性**: 当前选中元素的详细属性设置 (如坐标、宽高、字体样式等)。
  - _(目前为占位符，待实现具体属性面板)_
- **交互**: 点击侧边悬浮按钮进行展开/收起切换。

### 顶部导航 (Header)

- **高度**: 约 `64px`
- **内容**:
  - 模板名称输入
  - 工具栏 (撤销/重做/缩放控制等)
  - 预览与保存按钮

## 3. 技术实现

- **布局容器**: `Flexbox` (`flex-row`)
- **状态管理**: 使用 React State (`leftPanelOpen`, `rightPanelOpen`) 控制侧边栏显隐。
- **动画**: 使用 CSS Transition (`transition-all duration-300`) 实现平滑的侧边栏切换效果。
- **UI 组件**:
  - `shadcn/ui` Tabs (选项卡)
  - `shadcn/ui` ScrollArea (滚动区域)
  - `lucide-react` Icons (ChevronLeft/Right)
