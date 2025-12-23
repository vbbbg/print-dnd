# PDF 生成指南

本指南解释了如何使用导出的 JSON 模板来生成高质量的 PDF。

## 概览

JSON 文件是一个**蓝图**。它包含了布局、样式和字段定义。
要生成 PDF，你需要一个**渲染引擎**，它负责读取这个蓝图和实际业务数据，并将它们绘制到画布上。

## 推荐方案：后端渲染 (Node.js)

我们建议在服务器端使用 **Puppeteer** (无头 Chrome)。这能确保生成的 PDF 与你在编辑器中看到的 HTML/CSS 设计完全一致。

### 1. 架构

1.  **前端**: 用户设计模板 -> 导出 JSON。
2.  **数据库**: 存储 JSON 模板字符串。
3.  **后端 API**: 实现 `POST /api/print` 接口。
    - 接收 `orderId` (或直接接收 `data`) + `templateId`。
    - 从数据库获取模板 JSON。
    - 启动 Puppeteer 实例。
    - 基于 JSON 动态构建 HTML 页面。
    - 生成 PDF Buffer。
    - 将 PDF 流返回给客户端下载。

### 2. 实现示例 (概念代码)

前提条件:

```bash
npm install puppeteer handlebars
```

`pdf-service.js`:

```javascript
const puppeteer = require('puppeteer')
const handlebars = require('handlebars')

async function generatePdf(templateJson, data) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // 1. 从 JSON 获取页面尺寸
  const width = templateJson.paperWidth + 'mm'
  const height = templateJson.paperHeight + 'mm'

  // 2. 生成 HTML 内容
  // 我们构建一个模仿编辑器结构的 HTML 字符串
  // 使用绝对定位 (absolute positioning) 来放置元素
  const htmlContent = buildHtmlFromTemplate(templateJson, data)

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

  // 3. 打印为 PDF
  const pdfBuffer = await page.pdf({
    width: width,
    height: height,
    printBackground: true, // 打印背景色/图片
    pageRanges: '1', // 或者根据数据行数动态计算
  })

  await browser.close()
  return pdfBuffer
}

function buildHtmlFromTemplate(template, data) {
  // 将 JSON 元素映射为带有 style="position: absolute..." 的 HTML 字符串的逻辑
  // 使用 Handlebars 或简单的字符串替换来插入数据值
  // ...
  return `
    <html>
      <head>
        <style>
          @page { margin: 0; size: ${template.paperWidth}mm ${template.paperHeight}mm; }
          body { margin: 0; padding: 0; }
          .item { position: absolute; overflow: hidden; }
        </style>
      </head>
      <body>
        ${renderItems(template.headerItems, data)}
        ${renderBody(template.bodyItems, data.tableData)}
        ${renderItems(template.footerItems, data)}
      </body>
    </html>
  `
}
```

## 替代方案：客户端渲染

如果你必须在浏览器端生成 (例如离线模式)，可以使用 **jspdf** + **html2canvas**。

1.  在隐藏的 DOM 元素中渲染打印视图 (类似于 `RegionTable.tsx`，但填入真实数据)。
2.  使用 `html2canvas` 对该元素进行截图。
3.  将截图作为图片添加到 `jspdf` 文档中。

_优点_: 不需要后端服务。
_缺点_: 文本会被栅格化 (变成图片)，无法选中复制。打印清晰度较低。对于跨页表格的处理比较困难。
