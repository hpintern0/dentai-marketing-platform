const fs = require('fs');
const path = require('path');

async function runCarousel(job) {
  const { task_name, procedure_focus, tone, raw_brief, client_name, client_cro, client_instagram, client_city } = job.data;
  const assets = job.data.client_assets || [];
  const beforeAfterImages = assets.filter(a => a.type === 'before_after').map(a => a.url);
  const dentistPhotos = assets.filter(a => a.type === 'photo_dentist').map(a => a.url);
  const otherImages = assets.filter(a => a.type === 'other').map(a => a.url);
  const allImages = [...beforeAfterImages, ...dentistPhotos, ...otherImages];
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
${allImages.length > 0 ? `
IMAGENS DISPONÍVEIS DO CLIENTE (use image_url nos slides quando fizer sentido):
${allImages.slice(0, 6).map((url, i) => `- Imagem ${i+1}: ${url}`).join('\n')}
${beforeAfterImages.length > 0 ? `\nImagens de antes/depois: ${beforeAfterImages.slice(0, 3).join(', ')}` : ''}
${dentistPhotos.length > 0 ? `\nFoto do dentista: ${dentistPhotos[0]}` : ''}

Para cada slide, você PODE adicionar "image_url" com uma das URLs acima e "image_position" ("background" ou "inset").
A capa pode usar a foto do dentista como background.
Slides de antes/depois devem usar as imagens de antes/depois.
` : ''}

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
      "accent_color": "#hex",
      "image_url": "(opcional) URL de imagem do cliente",
      "image_position": "(opcional) background | inset"
    },
    {
      "slide_number": 2,
      "is_cover": false,
      "headline": "título do ponto",
      "body": "explicação em 2-3 frases curtas, linguagem do paciente",
      "background_color": "#FFFFFF",
      "text_color": "#1A1A1A",
      "accent_color": "#hex",
      "image_url": "(opcional) URL de imagem do cliente",
      "image_position": "(opcional) background | inset"
    },
    {
      "slide_number": 6,
      "is_cta": true,
      "headline": "CTA forte",
      "body": "subtexto + nome da clínica",
      "background_color": "#hex (mesma cor da capa)",
      "text_color": "#hex",
      "accent_color": "#hex",
      "image_url": "(opcional) URL de imagem do cliente",
      "image_position": "(opcional) background | inset"
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

  if (process.env.OPENAI_API_KEY) {
    // Use GPT Image to generate each slide
    try {
      const { generateImage } = require('../../src/lib/image-gen');

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideNum = String(i + 1).padStart(2, '0');

        let slidePrompt = `Crie o slide ${i + 1} de ${slides.length} de um carrossel para Instagram (1080x1080) de uma clínica odontológica.

Procedimento: ${procedure_focus}
${client_name ? `Clínica: ${client_name}` : ''}
${raw_brief ? `Brief: ${raw_brief}` : ''}

`;
        if (slide.is_cover || slide.iscover) {
          slidePrompt += `Este é o SLIDE DE CAPA. Headline grande e impactante: "${slide.headline}"
Design chamativo que faz parar o scroll. Fundo escuro ou vibrante. Texto "Deslize para saber mais" discreto no rodapé.`;
        } else if (slide.is_cta || slide.isCta) {
          slidePrompt += `Este é o SLIDE FINAL (CTA). Headline: "${slide.headline}"
Botão de CTA destacado: "${slide.body || 'Agende sua avaliação'}"
${client_name ? `Nome: ${client_name}` : ''}. Design que convida à ação.`;
        } else {
          slidePrompt += `Slide de conteúdo. Título: "${slide.headline}"
Conteúdo: "${slide.body || ''}"
Indicador de slide: ${slide.slide_number || i + 1}/${slides.length}
Design educativo, clean, com boa hierarquia de informação.`;
        }

        slidePrompt += `\n\nEstilo: profissional, moderno, para marketing odontológico. Texto legível. NÃO use fotos reais.`;

        try {
          await generateImage(slidePrompt, {
            size: '1024x1024',
            quality: 'medium',
            outputPath: path.join(outputDir, `slide_${slideNum}.png`),
          });
          console.log(`[Carousel] Slide ${i + 1}/${slides.length} generated via GPT Image`);
        } catch (slideErr) {
          console.warn(`[Carousel] Slide ${i + 1} GPT Image failed: ${slideErr.message}`);
        }
      }
    } catch (err) {
      console.warn(`[Carousel] GPT Image not available: ${err.message}`);
    }
  } else {
    // Fallback: save HTML slides
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideHtml = generateSlideHTML(slide, carouselStructure.total_slides || slides.length);
      const slideCss = generateSlideCss();
      fs.writeFileSync(path.join(outputDir, `slide_${String(i + 1).padStart(2, '0')}.html`),
        `<!DOCTYPE html><html><head><style>${slideCss}</style></head><body>${slideHtml}</body></html>`
      );
    }
  }

  console.log(`[Carousel Agent] Complete. ${slides.length} slides saved to ${outputDir}`);
  return { status: 'complete', outputs: slides.map((_, i) => `slide_${String(i + 1).padStart(2, '0')}.png`) };
}

function generateSlideHTML(slide, totalSlides) {
  const bg = slide.background_color || '#FFFFFF';
  const textColor = slide.text_color || '#1A1A1A';
  const accent = slide.accent_color || '#08c4b0';
  const hasBackgroundImage = slide.image_url && slide.image_position === 'background';

  if (hasBackgroundImage) {
    // Background image layout with dark overlay for text readability
    let textContent = '';
    if (slide.is_cover) {
      textContent = `
        <div style="font-size:64px;font-weight:800;color:#FFFFFF;text-align:center;line-height:1.2;max-width:900px;">${slide.headline}</div>
        <div style="width:80px;height:4px;background:${accent};margin-top:40px;border-radius:2px;"></div>
        <div style="font-size:22px;color:${accent};margin-top:30px;letter-spacing:2px;text-transform:uppercase;">Deslize para saber mais</div>`;
    } else if (slide.is_cta) {
      textContent = `
        <div style="font-size:52px;font-weight:800;color:#FFFFFF;text-align:center;line-height:1.3;max-width:800px;margin-bottom:40px;">${slide.headline}</div>
        <div style="background:${accent};color:#FFF;font-size:28px;font-weight:700;padding:20px 60px;border-radius:50px;">${slide.body || 'Agende sua avaliação'}</div>`;
    } else {
      textContent = `
        <div style="font-size:48px;font-weight:800;color:#FFFFFF;line-height:1.3;margin-bottom:30px;">${slide.headline}</div>
        <div style="width:60px;height:3px;background:${accent};margin-bottom:30px;border-radius:2px;"></div>
        <div style="font-size:30px;color:rgba(255,255,255,0.9);line-height:1.7;">${slide.body}</div>`;
    }

    return `<div style="width:1080px;height:1080px;position:relative;overflow:hidden;">
      <img src="${slide.image_url}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" />
      <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.7) 40%, transparent);"></div>
      <div style="position:relative;z-index:1;padding:80px;display:flex;flex-direction:column;justify-content:flex-end;height:100%;font-family:'Inter',system-ui,sans-serif;align-items:center;">
        ${textContent}
      </div>
    </div>`;
  }

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
