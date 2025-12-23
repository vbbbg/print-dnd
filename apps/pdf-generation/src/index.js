const express = require('express')
const puppeteer = require('puppeteer')
const app = express()
const port = 3001

app.use(express.json())

// Main endpoint to generate PDF
app.post('/api/print', async (req, res) => {
  try {
    const { template, data } = req.body

    if (!template) {
      return res.status(400).send('Missing template JSON')
    }

    console.log('Generating PDF for template:', template.name || 'Untitled')

    // Launch puppeteer
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // Mock HTML generation (Replace with real logic from your guide)
    const htmlContent = `
      <html>
        <body>
          <h1>${template.name || 'PDF Generation Test'}</h1>
          <p>This is a placeholder for the generated PDF content.</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
      </html>
    `

    await page.setContent(htmlContent)

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    })

    await browser.close()

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
    })

    res.send(pdfBuffer)
  } catch (error) {
    console.error('PDF Generation Error:', error)
    res.status(500).send('Error generating PDF')
  }
})

app.get('/health', (req, res) => {
  res.send('PDF Service is running')
})

app.listen(port, () => {
  console.log(`PDF Service listening at http://localhost:${port}`)
})
