const fs = require('fs');
const path = require('path');

async function runDentalResearch(job) {
  const { task_name, procedure_focus, client_id, platform_targets, tone } = job.data;
  const outputDir = path.resolve(__dirname, `../../outputs/${task_name}`);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`[Research Agent] Starting research for: ${procedure_focus}`);

  // Dynamic import for ESM module
  let tavilyResults = [];
  try {
    const { tavily } = await import('@tavily/core');
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

    const queries = [
      `dentistas mais seguidos Instagram Brasil ${procedure_focus} 2025 2026`,
      `conteúdo viral odontologia Instagram ${procedure_focus}`,
      `tendências ${procedure_focus} odontologia ${new Date().getFullYear()}`,
      `linguagem marketing odontológico pacientes ${procedure_focus}`,
      `dores objeções pacientes ${procedure_focus} dentista`,
    ];

    console.log(`[Research Agent] Executing ${queries.length} Tavily searches...`);

    for (const query of queries) {
      try {
        const result = await tvly.search(query, { maxResults: 5 });
        tavilyResults.push({
          query,
          results: result.results.map(r => ({
            title: r.title,
            url: r.url,
            content: r.content?.substring(0, 500),
          })),
        });
        console.log(`[Research Agent] Search complete: "${query.substring(0, 50)}..."`);
      } catch (err) {
        console.warn(`[Research Agent] Search failed for: ${query}`, err.message);
      }
    }
  } catch (err) {
    console.warn('[Research Agent] Tavily not available, using AI-only research');
  }

  // Use Claude to synthesize research
  const { generateJSON } = require('../../src/lib/ai-cjs');

  const systemPrompt = `Você é um especialista em pesquisa de marketing odontológico. Sua tarefa é sintetizar dados de pesquisa em um formato estruturado para alimentar agentes criativos de conteúdo.

Procedimento foco: ${procedure_focus}
Plataformas: ${platform_targets?.join(', ') || 'Instagram'}
Tom desejado: ${tone || 'educativo'}

Gere um JSON com a seguinte estrutura EXATA:
{
  "procedure_focus": "string",
  "content_topics": ["array de 5-8 tópicos de conteúdo relevantes"],
  "marketing_angles": ["array de 3-5 ângulos de marketing"],
  "keywords": ["array de 10-15 palavras-chave SEO"],
  "ad_hooks": ["array de 5-8 hooks de abertura para ads"],
  "video_concepts": ["array de 3-5 conceitos de vídeo curto"],
  "patient_pain_points": ["array de 5-8 dores/objeções do paciente"],
  "trending_formats": ["array de 3-5 formatos em tendência"],
  "recommended_hashtags": ["array de 10-15 hashtags relevantes"],
  "benchmark_patterns": {
    "top_formats": ["array de formatos que mais performam"],
    "reference_hooks": ["array de hooks de referência"],
    "tone_patterns": "string descrevendo padrões de tom",
    "cta_patterns": ["array de CTAs eficazes"]
  },
  "scheduling_insights": {
    "best_days": ["array de melhores dias"],
    "best_times": ["array de melhores horários"],
    "engagement_patterns": "string com padrões de engajamento"
  }
}`;

  const userPrompt = tavilyResults.length > 0
    ? `Baseado nestas pesquisas reais, sintetize os dados:\n\n${JSON.stringify(tavilyResults, null, 2)}`
    : `Gere dados de pesquisa de marketing para o procedimento "${procedure_focus}" baseado no seu conhecimento de marketing odontológico no Brasil.`;

  const researchResults = await generateJSON(systemPrompt, userPrompt, { maxTokens: 4096 });

  // Save outputs
  fs.writeFileSync(
    path.join(outputDir, 'research_results.json'),
    JSON.stringify(researchResults, null, 2)
  );

  // Generate research brief
  const { generateContent } = require('../../src/lib/ai-cjs');
  const brief = await generateContent(
    'Você é um analista de marketing odontológico. Gere um relatório em Markdown com insights de pesquisa, benchmarks e recomendações.',
    `Gere um research brief em Markdown baseado nestes dados:\n${JSON.stringify(researchResults, null, 2)}\n\nInclua seções: Resumo Executivo, Tendências, Benchmarks, Recomendações, Hashtags.`,
    { maxTokens: 2048 }
  );

  fs.writeFileSync(path.join(outputDir, 'research_brief.md'), brief);

  console.log(`[Research Agent] Complete. Outputs saved to ${outputDir}`);
  return { status: 'complete', outputs: ['research_results.json', 'research_brief.md'] };
}

module.exports = { runDentalResearch };
