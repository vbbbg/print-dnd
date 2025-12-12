- [x] 拖动 header handler，当 header handler 靠近 body handler 时，body handler 会往下移动

  **原因 (Cause):**  
  CSS 样式问题。区域容器 (`div`) 上直接设置了 `p-1` (padding: 4px)。当拖动 header handler 导致 header 高度极小（逻辑高度 < 物理渲染高度）时，`padding` 加上 `border` 撑大了容器的实际高度，超过了通过 `style.height` 设置的逻辑高度。这导致该区域“溢出”并挤压或覆盖了下方的边框线，视觉上造成 body handler 位置偏移。

  **解决方案 (Solution):**  
  修改 `src/components/Paper.tsx`，将 `p-1` padding 从负责定位和高度的外部容器上移除，移动到内部的文本容器上。外部容器现在只负责 `box-border` 和边框绘制，严格遵循 `style.height`，不再受 padding 撑开影响。
