const fs = require('fs');
const path = require('path');

async function runCopywriter(job) {
  const { task_name, procedure_focus, client_id, platform_targets, tone } = job.data;
  const outputDir = path.resolve(__dirname, `../../outputs/${task_name}/copy`);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Load research results
  const researchPath = path.resolve(__dirname, `../../outputs/${task_name}/research_results.json`);
  let research = {};
  if (fs.existsSync(researchPath)) {
    research = JSON.parse(fs.readFileSync(researchPath, 'utf-8'));
  }

  // Load knowledge files
  const knowledgeDir = path.resolve(__dirname, '../../knowledge');
  const cfoRules = fs.existsSync(path.join(knowledgeDir, 'regulatorio/cfo_publicidade.md'))
    ? fs.readFileSync(path.join(knowledgeDir, 'regulatorio/cfo_publicidade.md'), 'utf-8').substring(0, 2000)
    : '';
  const termsProhibited = fs.existsSync(path.join(knowledgeDir, 'regulatorio/termos_proibidos.md'))
    ? fs.readFileSync(path.join(knowledgeDir, 'regulatorio/termos_proibidos.md'), 'utf-8').substring(0, 2000)
    : '';

  const { generateJSON } = require('../../src/lib/ai-cjs');

  const systemPrompt = `Você é um copywriter especializado em marketing odontológico no Brasil. Crie copy platform-native para as redes sociais de uma clínica odontológica.

REGRAS OBRIGATÓRIAS:
1. Nunca use superlativos absolutos ("o melhor", "o mais")
2. Nunca garanta resultados ("resultado garantido", "100% eficaz")
3. Nunca use termos proibidos pelo CFO
4. Sempre inclua CTA claro
5. Adapte o tom e formato para cada plataforma
6. Use linguagem do paciente, não jargão técnico
7. Hooks devem criar curiosidade ou identificação

REGRAS CFO (resumo):
${cfoRules.substring(0, 1000)}

TERMOS PROIBIDOS:
${termsProhibited.substring(0, 1000)}

Procedimento: ${procedure_focus}
Tom: ${tone || 'educativo'}
Plataformas: ${(platform_targets || ['instagram_feed']).join(', ')}

Dados de pesquisa:
- Hooks: ${JSON.stringify(research.ad_hooks || [])}
- Ângulos: ${JSON.stringify(research.marketing_angles || [])}
- Dores: ${JSON.stringify(research.patient_pain_points || [])}
- Hashtags: ${JSON.stringify(research.recommended_hashtags || [])}
- CTA patterns: ${JSON.stringify(research.benchmark_patterns?.cta_patterns || [])}

Gere JSON com esta estrutura EXATA:
{
  "campaign_angle": "frase que define o ângulo da campanha",
  "instagram_caption": "hook emocional + benefício + CTA + 5-8 hashtags. Max 2 emojis.",
  "stories_copy": "texto ultra-curto para sticker ou enquete. Max 30 palavras.",
  "whatsapp_cta": "mensagem informal e convidativa para link na bio."
}`;

  const copy = await generateJSON(systemPrompt, `Gere toda a copy para uma campanha de ${procedure_focus}.`);

  // Save individual files
  if (copy.instagram_caption) {
    fs.writeFileSync(path.join(outputDir, 'instagram_caption.txt'), copy.instagram_caption);
  }
  if (copy.stories_copy) {
    fs.writeFileSync(path.join(outputDir, 'stories_copy.txt'), copy.stories_copy);
  }
  if (copy.whatsapp_cta) {
    fs.writeFileSync(path.join(outputDir, 'whatsapp_cta.txt'), copy.whatsapp_cta);
  }
  // Save full manifest
  fs.writeFileSync(path.join(outputDir, 'copy_manifest.json'), JSON.stringify(copy, null, 2));

  console.log(`[Copywriter] Complete. Copy saved to ${outputDir}`);
  return { status: 'complete', outputs: Object.keys(copy) };
}

module.exports = { runCopywriter };
