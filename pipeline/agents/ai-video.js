const fs = require('fs');
const path = require('path');

async function runVideoAd(job) {
  const { task_name, procedure_focus, platform_targets, tone } = job.data;
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

Plataforma: ${platform}
Tom: ${tone || 'educativo'}
Hooks: ${JSON.stringify(research.ad_hooks?.slice(0, 3) || [])}

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
        "transition": "fade|slide|zoom"
      },
      {
        "type": "problem",
        "text": "problema/dor do paciente",
        "visual": "descrição visual",
        "duration": 3
      },
      {
        "type": "product",
        "text": "o procedimento como solução",
        "visual": "descrição visual",
        "duration": 4
      },
      {
        "type": "benefit",
        "text": "benefício emocional",
        "visual": "descrição visual",
        "duration": 2
      },
      {
        "type": "cta",
        "text": "CTA claro",
        "visual": "logo_clinica",
        "duration": 1,
        "animation": "slide_up"
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

  // Try to render with Remotion
  try {
    const { renderVideo } = eval("require")('../../remotion/render');
    await renderVideo(
      path.join(outputDir, 'video_concept.json'),
      path.join(outputDir, 'ad.mp4'),
      'AdVideo'
    );
    console.log(`[Video Ad] MP4 rendered via Remotion`);
  } catch (err) {
    console.warn(`[Video Ad] Remotion not available: ${err.message}. Scene JSON saved.`);
  }

  console.log(`[Video Ad] Complete. Outputs saved to ${outputDir}`);
  return { status: 'complete', outputs: ['video_concept.json', 'scenes.json'] };
}

module.exports = { runVideoAd };
