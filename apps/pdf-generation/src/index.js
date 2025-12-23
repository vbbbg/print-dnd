const express = require('express')
const puppeteer = require('puppeteer')
const { buildHtmlFromTemplate } = require('./renderEngine')
const app = express()
const port = 3001

app.use(express.json())

// Manual CORS to avoid dependency issues
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// Main endpoint to generate PDF
app.post('/api/print', async (req, res) => {
  try {
    const { template, data } = req.body

    if (!template) {
      return res.status(400).send('Missing template JSON')
    }

    console.log('Generating PDF for template:', template.name || 'Untitled')

    const { join } = require('path')

    // Launch puppeteer
    // Explicitly pointing to the installed local Chrome to bypass resolution errors
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: join(
        __dirname,
        '../.chrome/chrome/mac_arm-121.0.6167.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
      ),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })
    const page = await browser.newPage()

    // Generate HTML using the render engine
    const htmlContent = buildHtmlFromTemplate(template, data || {})

    await page.setContent(htmlContent)

    const pdfBuffer = await page.pdf({
      width: `${template.paperWidth || 210}mm`,
      height: `${template.paperHeight || 297}mm`,
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
