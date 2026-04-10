const fs = require('fs');
const path = require('path');

async function parseBrief(message, clientProfile, campaignHistory = [], chatHistory = []) {
  const { generateContent } = require('../../src/lib/ai-cjs');

  const systemPrompt = `Você é o assistente de criação de campanhas do HP Odonto Marketing Platform. Você conversa com o usuário para entender o que ele quer criar e monta um brief estruturado.

PERFIL DO CLIENTE SELECIONADO:
- Nome: ${clientProfile.name}
- Especialidade: ${clientProfile.specialty}
- Cidade: ${clientProfile.city}, ${clientProfile.state}
- Instagram: ${clientProfile.instagram_handle}
- CRO: ${clientProfile.cro_number}
- Tom de voz: ${clientProfile.tone}
- Plataformas: ${(clientProfile.active_platforms || []).join(', ')}
- CTAs padrão: ${(clientProfile.default_ctas || []).join(', ')}

CAMPANHAS RECENTES:
${campaignHistory.slice(0, 3).map(c => `- ${c.name} (${c.status})`).join('\n') || 'Nenhuma'}

COMO FUNCIONAR:
1. MANTENHA O CONTEXTO — leia todo o histórico da conversa. O usuário pode ir adicionando detalhes aos poucos.
2. ACUMULE INFORMAÇÕES — se o usuário disse "carrossel" na primeira mensagem e "sobre reabilitação" na segunda, junte tudo.
3. QUANDO TIVER INFORMAÇÃO SUFICIENTE — monte o brief e pergunte se quer confirmar.
4. SE FALTAR ALGO IMPORTANTE — pergunte de forma natural (não faça interrogatório).
5. SE O USUÁRIO CONFIRMAR — retorne o brief final.
6. SEJA CONVERSACIONAL — responda como um estrategista de marketing sênior, não como um robô.
7. NUNCA ESQUEÇA o que foi dito antes na conversa.

RESPONDA SEMPRE em JSON com esta estrutura:
{
  "type": "chat" | "brief_confirmation" | "clarification",
  "message": "sua resposta em linguagem natural para o usuário",
  "brief": null ou {
    "client_id": "${clientProfile.id}",
    "raw_brief": "resumo completo do que o usuário quer",
    "parsed": {
      "format": ["carousel" | "feed_static" | "reels" | "stories"],
      "slides": número ou null,
      "procedure_focus": "procedimento foco",
      "campaign_objective": "captacao_pacientes | educacao | awareness",
      "tone": "${clientProfile.tone || 'educativo'}",
      "restrictions": [],
      "platform_targets": ${JSON.stringify(clientProfile.active_platforms || ['instagram_feed'])},
      "visual_notes": "notas visuais ou null"
    },
    "inferred_fields": ["campos inferidos"],
    "ambiguities": [],
    "confirmation_required": true
  }
}

REGRAS DE TYPE:
- "chat" = conversa normal, precisa de mais informações, ou respondendo pergunta
- "brief_confirmation" = tem informação suficiente para montar o brief, apresentando para confirmação
- "clarification" = precisa de esclarecimento específico

Se o type for "chat", o campo "brief" pode ser null.
Se o type for "brief_confirmation", o campo "brief" DEVE ter todos os campos preenchidos.`;

  // Build the messages array with full conversation history
  const messages = [];

  // Add chat history
  if (chatHistory && chatHistory.length > 0) {
    for (const msg of chatHistory) {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }
  }

  // Add current message
  messages.push({ role: 'user', content: message });

  // Use generateContent with full message history
  const { getAI } = require('../../src/lib/ai-cjs');
  const ai = getAI();
  const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  const response = await ai.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 2048,
    temperature: 0.7,
    system: systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks.',
    messages: messages,
  });

  const text = response.content.find(b => b.type === 'text')?.text || '';
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonStr);
}

module.exports = { parseBrief };
