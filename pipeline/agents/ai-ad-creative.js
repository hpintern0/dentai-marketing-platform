const fs = require('fs');
const path = require('path');

async function runAdCreative(job) {
  const { task_name, procedure_focus, tone } = job.data;
  const outputDir = path.resolve(__dirname, `../../outputs/${task_name}/ads`);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Load research
  const researchPath = path.resolve(__dirname, `../../outputs/${task_name}/research_results.json`);
  let research = {};
  if (fs.existsSync(researchPath)) {
    research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
  }

  const { generateJSON, generateContent } = require('../../src/lib/ai-cjs');

  // Step 1: Generate layout spec
  const layoutPrompt = `Você é um designer de anúncios para Instagram especializando em clínicas odontológicas. Gere um layout JSON para um criativo 1080x1080 sobre "${procedure_focus}".

Tom: ${tone || 'educativo'}
Hooks disponíveis: ${JSON.stringify(research.ad_hooks?.slice(0, 3) || [])}

Gere um JSON com esta estrutura:
{
  "format": "instagram_square",
  "width": 1080,
  "height": 1080,
  "template": "nome_do_template",
  "background": "#hex_color",
  "elements": [
    {
      "type": "headline",
      "text": "max 5 palavras impactantes",
      "x": number, "y": number,
      "fontSize": number,
      "fontWeight": "bold",
      "color": "#hex"
    },
    {
      "type": "subtext",
      "text": "frase de suporte",
      "x": number, "y": number,
      "fontSize": number,
      "color": "#hex"
    },
    {
      "type": "cta",
      "text": "CTA text",
      "x": number, "y": number,
      "backgroundColor": "#hex",
      "textColor": "#hex",
      "borderRadius": number,
      "width": number,
      "height": number,
      "fontSize": number
    },
    {
      "type": "badge",
      "text": "small text like specialty",
      "x": number, "y": number,
      "fontSize": number,
      "color": "#hex",
      "backgroundColor": "#hex_with_opacity"
    }
  ]
}

Use um design clean, moderno, profissional. Cores odontológicas (azuis, brancos, verdes suaves). Headline no máximo 5 palavras.`;

  const layout = await generateJSON(layoutPrompt, `Gere o layout para um ad de ${procedure_focus}.`);
  fs.writeFileSync(path.join(outputDir, 'layout.json'), JSON.stringify(layout, null, 2));

  // Step 2: Generate HTML from layout
  const html = generateAdHTML(layout);
  fs.writeFileSync(path.join(outputDir, 'ad.html'), html);

  // Step 3: Generate CSS
  const css = generateAdCSS(layout);
  fs.writeFileSync(path.join(outputDir, 'styles.css'), css);

  // Step 4: Render with Playwright (if available)
  try {
    const { chromium } = eval("require")('playwright');
    const browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH || undefined,
    });
    const page = await browser.newPage();
    await page.setViewportSize({ width: layout.width || 1080, height: layout.height || 1080 });

    const fullHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`;
    await page.setContent(fullHtml, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: path.join(outputDir, 'instagram_ad.png'),
      type: 'png',
    });

    await browser.close();
    console.log(`[Ad Creative] PNG rendered via Playwright`);
  } catch (err) {
    console.warn(`[Ad Creative] Playwright not available: ${err.message}. HTML saved for manual rendering.`);
  }

  console.log(`[Ad Creative] Complete. Outputs saved to ${outputDir}`);
  return { status: 'complete', outputs: ['layout.json', 'ad.html', 'styles.css', 'instagram_ad.png'] };
}

function generateAdHTML(layout) {
  const elements = (layout.elements || []).map(el => {
    const style = `position:absolute;left:${el.x}px;top:${el.y}px;`;

    switch (el.type) {
      case 'headline':
        return `<div class="el-headline" style="${style}font-size:${el.fontSize || 56}px;font-weight:${el.fontWeight || 'bold'};color:${el.color || '#1A1A1A'};max-width:900px;line-height:1.2;">${el.text}</div>`;
      case 'subtext':
        return `<div class="el-subtext" style="${style}font-size:${el.fontSize || 24}px;color:${el.color || '#555'};max-width:900px;line-height:1.5;">${el.text}</div>`;
      case 'cta':
        return `<div class="el-cta" style="${style}background:${el.backgroundColor || '#2C5F8A'};color:${el.textColor || '#FFF'};font-size:${el.fontSize || 22}px;font-weight:bold;padding:16px 40px;border-radius:${el.borderRadius || 8}px;text-align:center;${el.width ? `width:${el.width}px;` : ''}">${el.text}</div>`;
      case 'badge':
        return `<div class="el-badge" style="${style}font-size:${el.fontSize || 14}px;color:${el.color || '#FFF'};background:${el.backgroundColor || 'rgba(0,0,0,0.3)'};padding:6px 16px;border-radius:20px;">${el.text}</div>`;
      case 'logo':
        return `<div class="el-logo" style="${style}width:${el.width || 100}px;height:${el.width || 100}px;background:#ddd;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">Logo</div>`;
      case 'image':
        return `<div class="el-image" style="${style}width:${el.width || 400}px;height:${el.height || 300}px;background:linear-gradient(135deg,#e0e7ff,#c4d4f5);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#8899bb;font-size:16px;">[Imagem]</div>`;
      case 'divider':
        return `<div class="el-divider" style="${style}width:${el.width || 80}px;height:4px;background:${el.color || '#08c4b0'};border-radius:2px;"></div>`;
      default:
        return '';
    }
  }).join('\n    ');

  return `<div class="ad-container" style="position:relative;width:${layout.width || 1080}px;height:${layout.height || 1080}px;background:${layout.background || '#F8F5F0'};overflow:hidden;font-family:'Inter',system-ui,sans-serif;">
    ${elements}
  </div>`;
}

function generateAdCSS(layout) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }

.ad-container {
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.el-headline { letter-spacing: -0.02em; }
.el-subtext { letter-spacing: 0.01em; }
.el-cta { letter-spacing: 0.02em; cursor: pointer; transition: transform 0.2s; }
.el-cta:hover { transform: scale(1.02); }
`;
}

module.exports = { runAdCreative };
