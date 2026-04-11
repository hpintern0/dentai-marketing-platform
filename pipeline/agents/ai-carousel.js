const fs = require('fs');
const path = require('path');

async function runCarousel(job) {
  const { task_name, procedure_focus, tone, raw_brief } = job.data;
  const outputDir = path.resolve(__dirname, `../../outputs/${task_name}/carousel`);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const researchPath = path.resolve(__dirname, `../../outputs/${task_name}/research_results.json`);
  let research = {};
  if (fs.existsSync(researchPath)) {
    research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
  }

  const { generateJSON } = require('../../src/lib/ai-cjs');

  const carouselStructure = await generateJSON(
    `Você é um especialista em carrosséis educativos para Instagram de clínicas odontológicas. Gere a estrutura completa de um carrossel de 6 slides sobre "${procedure_focus}".

${raw_brief ? `BRIEF DO USUÁRIO (SIGA EXATAMENTE): ${raw_brief}\n` : ''}
Tom: ${tone || 'educativo'}
Hooks: ${JSON.stringify(research.ad_hooks?.slice(0, 3) || [])}
Dores: ${JSON.stringify(research.patient_pain_points?.slice(0, 3) || [])}

Gere JSON com esta estrutura:
{
  "type": "educativo|mitos_verdades|passo_a_passo|beneficios|comparativo",
  "total_slides": 6,
  "slides": [
    {
      "slide_number": 1,
      "is_cover": true,
      "headline": "headline impactante max 8 palavras",
      "body": "",
      "background_color": "#hex (escuro para capa)",
      "text_color": "#hex",
      "accent_color": "#hex"
    },
    {
      "slide_number": 2,
      "is_cover": false,
      "headline": "título do ponto",
      "body": "explicação em 2-3 frases curtas, linguagem do paciente",
      "background_color": "#FFFFFF",
      "text_color": "#1A1A1A",
      "accent_color": "#hex"
    },
    {
      "slide_number": 6,
      "is_cta": true,
      "headline": "CTA forte",
      "body": "subtexto + nome da clínica",
      "background_color": "#hex (mesma cor da capa)",
      "text_color": "#hex",
      "accent_color": "#hex"
    }
  ]
}

REGRAS:
- Capa deve ter headline provocativa ou com pergunta
- Cada slide intermediário aborda UM ponto
- Último slide é CTA claro
- Nunca garantir resultados
- Linguagem do paciente, não jargão`,
    `Gere o carrossel sobre ${procedure_focus}.`
  );

  fs.writeFileSync(
    path.join(outputDir, 'carousel_structure.json'),
    JSON.stringify(carouselStructure, null, 2)
  );

  // Generate and render each slide
  const slides = carouselStructure.slides || [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideHtml = generateSlideHTML(slide, carouselStructure.total_slides || slides.length);
    const slideCss = generateSlideCss();

    fs.writeFileSync(path.join(outputDir, `slide_${String(i + 1).padStart(2, '0')}.html`),
      `<!DOCTYPE html><html><head><style>${slideCss}</style></head><body>${slideHtml}</body></html>`
    );

    // Playwright render
    try {
      const { chromium } = eval("require")('playwright');
      const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1080, height: 1080 });
      const fullHtml = `<!DOCTYPE html><html><head><style>${slideCss}</style></head><body>${slideHtml}</body></html>`;
      await page.setContent(fullHtml, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(outputDir, `slide_${String(i + 1).padStart(2, '0')}.png`), type: 'png' });
      await browser.close();
    } catch (err) {
      // Playwright not available, HTML saved for manual rendering
    }
  }

  console.log(`[Carousel Agent] Complete. ${slides.length} slides saved to ${outputDir}`);
  return { status: 'complete', outputs: slides.map((_, i) => `slide_${String(i + 1).padStart(2, '0')}.png`) };
}

function generateSlideHTML(slide, totalSlides) {
  const bg = slide.background_color || '#FFFFFF';
  const textColor = slide.text_color || '#1A1A1A';
  const accent = slide.accent_color || '#08c4b0';

  if (slide.is_cover) {
    return `<div style="width:1080px;height:1080px;background:${bg};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px;font-family:'Inter',system-ui,sans-serif;">
      <div style="font-size:64px;font-weight:800;color:${textColor};text-align:center;line-height:1.2;max-width:900px;">${slide.headline}</div>
      <div style="width:80px;height:4px;background:${accent};margin-top:40px;border-radius:2px;"></div>
      <div style="font-size:22px;color:${accent};margin-top:30px;letter-spacing:2px;text-transform:uppercase;">Deslize para saber mais</div>
    </div>`;
  }

  if (slide.is_cta) {
    return `<div style="width:1080px;height:1080px;background:${bg};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px;font-family:'Inter',system-ui,sans-serif;">
      <div style="font-size:52px;font-weight:800;color:${textColor};text-align:center;line-height:1.3;max-width:800px;margin-bottom:40px;">${slide.headline}</div>
      <div style="background:${accent};color:#FFF;font-size:28px;font-weight:700;padding:20px 60px;border-radius:50px;">${slide.body || 'Agende sua avaliação'}</div>
    </div>`;
  }

  return `<div style="width:1080px;height:1080px;background:${bg};display:flex;flex-direction:column;justify-content:flex-start;padding:80px;font-family:'Inter',system-ui,sans-serif;">
    <div style="display:flex;align-items:center;margin-bottom:40px;">
      <div style="width:52px;height:52px;border-radius:26px;background:${accent};color:#FFF;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;">${slide.slide_number}</div>
      <div style="font-size:18px;color:#999;margin-left:16px;">${slide.slide_number}/${totalSlides}</div>
    </div>
    <div style="font-size:48px;font-weight:800;color:${textColor};line-height:1.3;margin-bottom:30px;">${slide.headline}</div>
    <div style="width:60px;height:3px;background:${accent};margin-bottom:30px;border-radius:2px;"></div>
    <div style="font-size:30px;color:#555;line-height:1.7;">${slide.body}</div>
  </div>`;
}

function generateSlideCss() {
  return `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { margin: 0; padding: 0; }`;
}

module.exports = { runCarousel };
