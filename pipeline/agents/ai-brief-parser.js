const fs = require('fs');
const path = require('path');

async function parseBrief(message, clientProfile, campaignHistory = []) {
  const { generateJSON } = require('../../src/lib/ai-cjs');

  const systemPrompt = `Você é o Brief Parser Agent do HP Odonto Marketing Platform. Sua função é interpretar pedidos em linguagem natural para criação de campanhas de marketing odontológico e convertê-los em payloads estruturados.

PERFIL DO CLIENTE:
${JSON.stringify(clientProfile, null, 2)}

HISTÓRICO DE CAMPANHAS RECENTES:
${JSON.stringify(campaignHistory.slice(0, 5), null, 2)}

REGRAS:
1. NUNCA PERGUNTE O ÓBVIO — se o cliente tem Instagram ativo, assuma Instagram como plataforma. Se o histórico mostra preferência por carrosséis, assuma esse formato para pedidos vagos.
2. ESPECIFICIDADE DO USUÁRIO É LEI — "8 slides" são 8 slides, nunca arredonde.
3. INFERÊNCIA COM TRANSPARÊNCIA — declare campos inferidos no output.
4. MEMÓRIA DE CAMPANHA — "parecido com o do mês passado" carrega o payload anterior.
5. MULTI-FORMATO EM PARALELO — pedidos com múltiplos formatos geram sub-pipelines paralelos.

Se o pedido for ambíguo a ponto de não conseguir montar um brief mínimo, retorne type: "clarification" com uma pergunta específica.

Gere JSON:
{
  "type": "brief_confirmation" ou "clarification",
  "message": "mensagem para o usuário (resumo do brief ou pergunta de esclarecimento)",
  "brief": {
    "client_id": "string",
    "raw_brief": "string (mensagem original do usuário)",
    "parsed": {
      "format": ["carousel"|"feed_static"|"reels"|"stories"|"copy_only"|"multi_format"],
      "slides": number ou null,
      "procedure_focus": "string",
      "campaign_objective": "string",
      "tone": "string",
      "restrictions": ["array de restrições"],
      "platform_targets": ["array de plataformas"],
      "visual_notes": "string ou null",
      "seasonal_context": "string ou null"
    },
    "inferred_fields": ["array de campos que foram inferidos"],
    "ambiguities": [],
    "confirmation_required": true
  }
}`;

  const result = await generateJSON(systemPrompt, message, { maxTokens: 2048 });
  return result;
}

module.exports = { parseBrief };
