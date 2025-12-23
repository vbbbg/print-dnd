- [x] 拖动 header handler，当 header handler 靠近 body handler 时，body handler 会往下移动

  **原因 (Cause):**  
  CSS 样式问题。区域容器 (`div`) 上直接设置了 `p-1` (padding: 4px)。当拖动 header handler 导致 header 高度极小（逻辑高度 < 物理渲染高度）时，`padding` 加上 `border` 撑大了容器的实际高度，超过了通过 `style.height` 设置的逻辑高度。这导致该区域“溢出”并挤压或覆盖了下方的边框线，视觉上造成 body handler 位置偏移。

  **解决方案 (Solution):**  
  修改 `src/components/Paper.tsx`，将 `p-1` padding 从负责定位和高度的外部容器上移除，移动到内部的文本容器上。外部容器现在只负责 `box-border` 和边框绘制，严格遵循 `style.height`，不再受 padding 撑开影响。

- [x] Body Region 拖动到靠近 Footer Region 时，想再次拖动 Body Region，无反应

  **原因 (Cause):**  
  Handler 遮挡问题。Resize Handle 是高度为 16px 的透明区域，居中于分割线。当 Body Handle 被拖动到极靠近 Footer Handle (最小间距 5mm) 时，由于 `SCALE` 缩放，两者在屏幕上的实际距离很近，导致 Footer Handle (DOM 中后定义的元素，层级较高) 的透明点击区域覆盖了 Body Handle 的可视区域。用户想点击 Body Handle 往回拖，实际点击到了 Footer Handle 的顶部透明区，而 Footer Handle 受限于 Body 位置无法向上移动，表现为“无反应”。

  **解决方案 (Solution):**
  1. (交互层) 优化 UI 设计。将原先的全宽 Handle 条更改为右侧对齐的“拖动按钮” (Drag Button)。这不仅提供了更明确的视觉提示，还减小了可点击区域的高度和宽度，从物理上消除了 Handler 重叠的可能性，彻底解决了误触问题。
