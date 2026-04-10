const fs = require('fs');
const path = require('path');

async function runReviewLoop(job) {
  const { task_name } = job.data;
  const outputDir = path.resolve(__dirname, `../../outputs/${task_name}`);
  const reviewDir = path.join(outputDir, 'review');
  if (!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir, { recursive: true });

  const { generateJSON } = require('../../src/lib/ai-cjs');

  // Load knowledge for CFO compliance
  const knowledgeDir = path.resolve(__dirname, '../../knowledge');
  const cfoRules = fs.existsSync(path.join(knowledgeDir, 'regulatorio/cfo_publicidade.md'))
    ? fs.readFileSync(path.join(knowledgeDir, 'regulatorio/cfo_publicidade.md'), 'utf-8').substring(0, 3000)
    : '';
  const termsProhibited = fs.existsSync(path.join(knowledgeDir, 'regulatorio/termos_proibidos.md'))
    ? fs.readFileSync(path.join(knowledgeDir, 'regulatorio/termos_proibidos.md'), 'utf-8').substring(0, 2000)
    : '';

  // Collect all content pieces
  const pieces = [];

  // Copy pieces
  const copyDir = path.join(outputDir, 'copy');
  if (fs.existsSync(copyDir)) {
    for (const file of fs.readdirSync(copyDir)) {
      if (file.endsWith('.txt') || file.endsWith('.json')) {
        pieces.push({
          piece_id: file.replace(/\.\w+$/, ''),
          type: 'copy',
          content: fs.readFileSync(path.join(copyDir, file), 'utf-8'),
        });
      }
    }
  }

  // Ad pieces
  const adsDir = path.join(outputDir, 'ads');
  if (fs.existsSync(adsDir) && fs.existsSync(path.join(adsDir, 'layout.json'))) {
    pieces.push({
      piece_id: 'instagram_ad',
      type: 'visual',
      content: fs.readFileSync(path.join(adsDir, 'layout.json'), 'utf-8'),
    });
  }

  // Carousel pieces
  const carouselDir = path.join(outputDir, 'carousel');
  if (fs.existsSync(carouselDir) && fs.existsSync(path.join(carouselDir, 'carousel_structure.json'))) {
    pieces.push({
      piece_id: 'carousel',
      type: 'visual',
      content: fs.readFileSync(path.join(carouselDir, 'carousel_structure.json'), 'utf-8'),
    });
  }

  if (pieces.length === 0) {
    console.log('[Review] No pieces to review');
    return { status: 'complete', campaign_score: 100 };
  }

  // Run review (up to 3 attempts)
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[Review] Round ${attempt}/${MAX_ATTEMPTS}`);

    const reviewResult = await generateJSON(
      `Você é um sistema de revisão de conteúdo odontológico. Revise TODAS as peças abaixo sob 4 perspectivas:

1. CFO COMPLIANCE: Verifique contra regras do CFO:
${cfoRules.substring(0, 1500)}

Termos proibidos:
${termsProhibited.substring(0, 1000)}

2. COPY QUALITY: Tom, CTA, estrutura narrativa, aderência à plataforma
3. VISUAL: Identidade visual, hierarquia, legibilidade (para peças visuais)
4. DENTAL EXPERT: Precisão técnica, linguagem do paciente, expectativas realistas

Para cada peça, dê score 0 (tem issues) ou 100 (aprovado).

Gere JSON:
{
  "campaign_score": number (0-100, percentual de peças com score 100),
  "attempt": ${attempt},
  "pieces": [
    {
      "piece_id": "string",
      "score": 0 ou 100,
      "status": "aprovado" ou "reprovado",
      "issues": [
        {
          "reviewer": "cfo_compliance|copy_reviewer|visual_reviewer|dental_expert",
          "severity": "bloqueante",
          "excerpt": "trecho problemático",
          "correction_instruction": "instrução precisa de como corrigir"
        }
      ]
    }
  ]
}`,
      `Revise estas peças:\n${JSON.stringify(pieces, null, 2)}`,
      { maxTokens: 4096 }
    );

    fs.writeFileSync(
      path.join(reviewDir, `review_round_${attempt}.json`),
      JSON.stringify(reviewResult, null, 2)
    );

    // Check if all approved
    const allApproved = (reviewResult.pieces || []).every(p => p.score === 100);

    if (allApproved || attempt === MAX_ATTEMPTS) {
      fs.writeFileSync(
        path.join(reviewDir, 'consolidated_issues.json'),
        JSON.stringify(reviewResult, null, 2)
      );

      // Generate readable report
      const { generateContent } = require('../../src/lib/ai-cjs');
      const report = await generateContent(
        'Gere um relatório de revisão em Markdown legível para a equipe.',
        `Gere relatório baseado nestes dados de revisão:\n${JSON.stringify(reviewResult, null, 2)}`,
        { maxTokens: 2048 }
      );
      fs.writeFileSync(path.join(reviewDir, 'review_report.md'), report);

      if (!allApproved) {
        // Mark for human review
        const failedPieces = (reviewResult.pieces || []).filter(p => p.score !== 100);
        failedPieces.forEach(p => { p.status = 'requer_revisao_humana'; });
      }

      console.log(`[Review] Complete. Campaign score: ${reviewResult.campaign_score}%`);
      return { status: 'complete', campaign_score: reviewResult.campaign_score };
    }

    // Attempt correction for failed pieces
    console.log(`[Review] Score: ${reviewResult.campaign_score}% — running corrections...`);
    const failedPieces = (reviewResult.pieces || []).filter(p => p.score !== 100);

    for (const piece of failedPieces) {
      const originalPiece = pieces.find(p => p.piece_id === piece.piece_id);
      if (!originalPiece) continue;

      const corrected = await generateContent(
        `Você é o Correction Agent. Corrija SOMENTE os issues indicados, preservando todo o restante do conteúdo original. Aplique EXATAMENTE as instruções de correção.`,
        `Conteúdo original:\n${originalPiece.content}\n\nIssues a corrigir:\n${JSON.stringify(piece.issues, null, 2)}\n\nRetorne o conteúdo corrigido (apenas o conteúdo, sem explicação).`,
        { maxTokens: 2048 }
      );

      // Update the piece content for next round
      originalPiece.content = corrected;

      // Save corrected file
      if (piece.piece_id.includes('caption') || piece.piece_id.includes('stories') || piece.piece_id.includes('whatsapp')) {
        fs.writeFileSync(path.join(copyDir, `${piece.piece_id}.txt`), corrected);
      }
    }
  }

  return { status: 'complete' };
}

module.exports = { runReviewLoop };
