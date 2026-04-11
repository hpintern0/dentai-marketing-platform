const fs = require('fs');
const path = require('path');

async function runVideoAd(job) {
  const { task_name, procedure_focus, platform_targets, tone, raw_brief, client_name, client_cro, client_instagram, client_city } = job.data;
  const assets = job.data.client_assets || [];
  const outputDir = path.resolve(__dirname, `../../outputs/${task_name}/video`);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const researchPath = path.resolve(__dirname, `../../outputs/${task_name}/research_results.json`);
  let research = {};
  if (fs.existsSync(researchPath)) {
    research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
  }

  const { generateJSON } = require('../../src/lib/ai-cjs');

  const platform = 'instagram_reels';
  const maxDuration = 12;

  const videoConcept = await generateJSON(
    `Você é um especialista em vídeos curtos para marketing odontológico (Reels/Shorts). Gere o conceito e scenes para um vídeo de ${maxDuration} segundos sobre "${procedure_focus}".

${raw_brief ? `BRIEF DO USUÁRIO (SIGA EXATAMENTE): ${raw_brief}\n` : ''}
Plataforma: ${platform}
Tom: ${tone || 'educativo'}
Hooks: ${JSON.stringify(research.ad_hooks?.slice(0, 3) || [])}
${assets.length > 0 ? `
IMAGENS DISPONÍVEIS (adicione "image_url" em cada scene quando fizer sentido):
${assets.slice(0, 6).map((a, i) => `- ${a.type}: ${a.url}`).join('\n')}

Para cada scene, você PODE adicionar "image_url" com uma das URLs acima.
Ex: scene de hook pode usar foto do dentista, scene de product pode usar antes/depois.
` : ''}

Gere JSON Remotion-ready:
{
  "composition": "AdVideo",
  "props": {
    "style": "problem_solution|antes_depois|educativo_rapido|apresentacao_dentista|depoimento_simulado|procedimento_showcase",
    "duration": ${maxDuration},
    "platform": "${platform}",
    "procedure": "${procedure_focus}",
    "scenes": [
      {
        "type": "hook",
        "text": "frase impactante de abertura",
        "visual": "descrição da cena visual",
        "duration": 2,
        "transition": "fade|slide|zoom",
        "image_url": "(opcional) URL de imagem do cliente"
      },
      {
        "type": "problem",
        "text": "problema/dor do paciente",
        "visual": "descrição visual",
        "duration": 3,
        "image_url": "(opcional) URL de imagem do cliente"
      },
      {
        "type": "product",
        "text": "o procedimento como solução",
        "visual": "descrição visual",
        "duration": 4,
        "image_url": "(opcional) URL de imagem do cliente"
      },
      {
        "type": "benefit",
        "text": "benefício emocional",
        "visual": "descrição visual",
        "duration": 2,
        "image_url": "(opcional) URL de imagem do cliente"
      },
      {
        "type": "cta",
        "text": "CTA claro",
        "visual": "logo_clinica",
        "duration": 1,
        "animation": "slide_up",
        "image_url": "(opcional) URL de imagem do cliente"
      }
    ]
  }
}

A soma das durações dos scenes deve ser EXATAMENTE ${maxDuration} segundos.
Nunca garantir resultados. Linguagem do paciente.`,
    `Gere o conceito de vídeo para ${procedure_focus}.`
  );

  fs.writeFileSync(path.join(outputDir, 'video_concept.json'), JSON.stringify(videoConcept, null, 2));
  fs.writeFileSync(path.join(outputDir, 'scenes.json'), JSON.stringify(videoConcept.props?.scenes || [], null, 2));

  // Render MP4 via Playwright screen recording
  try {
    const { renderVideoFromScenes } = require('./video-renderer');
    await renderVideoFromScenes(
      path.join(outputDir, 'video_concept.json'),
      path.join(outputDir, 'ad.mp4'),
      {
        procedure: procedure_focus,
        clientName: job.data.client_name || '',
        primaryColor: '#1A2744',
        accentColor: '#C9A84C',
      }
    );
    console.log(`[Video Ad] MP4 rendered via Playwright`);
  } catch (err) {
    console.warn(`[Video Ad] Video rendering failed: ${err.message}. Scene JSON saved.`);
  }

  console.log(`[Video Ad] Complete. Outputs saved to ${outputDir}`);
  return { status: 'complete', outputs: ['video_concept.json', 'scenes.json', 'ad.mp4'] };
}

module.exports = { runVideoAd };
