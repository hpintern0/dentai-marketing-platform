const path = require('path');

let browser = null;

async function initBrowser() {
  if (!browser) {
    const { chromium } = eval("require")('playwright');
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

async function renderHTMLToImage(html, css, outputPath, options = {}) {
  const { width = 1080, height = 1080 } = options;

  const b = await initBrowser();
  const page = await b.newPage();

  try {
    await page.setViewportSize({ width, height });

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }
    ${css || ''}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle' });

    // Wait for fonts to load
    await page.waitForTimeout(500);

    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width, height },
    });

    console.log(`[Renderer] Saved: ${outputPath}`);
    return outputPath;
  } finally {
    await page.close();
  }
}

async function renderMultipleSlides(slides, outputDir, options = {}) {
  const { width = 1080, height = 1080 } = options;
  const results = [];

  for (let i = 0; i < slides.length; i++) {
    const { html, css } = slides[i];
    const outputPath = path.join(outputDir, `slide_${String(i + 1).padStart(2, '0')}.png`);
    await renderHTMLToImage(html, css, outputPath, { width, height });
    results.push(outputPath);
  }

  return results;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Cleanup on exit
process.on('exit', closeBrowser);
process.on('SIGINT', async () => { await closeBrowser(); process.exit(); });
process.on('SIGTERM', async () => { await closeBrowser(); process.exit(); });

module.exports = { initBrowser, renderHTMLToImage, renderMultipleSlides, closeBrowser };
