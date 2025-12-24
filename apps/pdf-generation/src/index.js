const express = require('express')
const { buildHtmlFromTemplate } = require('./renderEngine')
const app = express()

// Vercel uses process.env.VERCEL = '1'
const isVercel = process.env.VERCEL === '1'

let chromium
let puppeteerCore

if (isVercel) {
  chromium = require('@sparticuz/chromium')
  puppeteerCore = require('puppeteer-core')
  // Configure sparticuz chromium
  chromium.setGraphicsMode = false
} else {
  // Local development fallback
  try {
    // Attempt to require puppeteer if available (local dev)
    require('puppeteer')
  } catch (e) {
    console.warn(
      'Puppeteer not found, ensuring puppeteer-core or similar is handled.'
    )
  }
}

app.use(express.json())

// Manual CORS to avoid dependency issues
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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

    let browser
    if (isVercel) {
      // Vercel / Lambda Environment
      // Load Chinese font (Noto Sans SC) - required for Chinese characters
      await chromium.font(
        'https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC-Regular.otf'
      )

      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })
    } else {
      // Local Environment
      // Use standard puppeteer or local executable logic
      const puppeteer = require('puppeteer')
      browser = await puppeteer.launch({
        headless: true,
        // Keep your existing local logic or simplify
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
    }

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

    res.send(Buffer.from(pdfBuffer))
  } catch (error) {
    console.error('PDF Generation Error:', error)
    res.status(500).send('Error generating PDF: ' + error.message)
  }
})

app.get('/api/health', (req, res) => {
  res.send('PDF Service is running')
})

// Only listen if running directly (not imported as module by Vercel)
if (require.main === module) {
  const port = 3001
  app.listen(port, () => {
    console.log(`PDF Service listening at http://localhost:${port}`)
  })
}

module.exports = app
