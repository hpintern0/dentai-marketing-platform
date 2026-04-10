// CommonJS wrapper for AI functions used by pipeline agents
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

let Anthropic;

function getAI() {
  if (!Anthropic) {
    const mod = eval("require")('@anthropic-ai/sdk');
    Anthropic = mod.default || mod;
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function generateContent(systemPrompt, userPrompt, options = {}) {
  const ai = getAI();
  const response = await ai.messages.create({
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature ?? 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text || '';
}

async function generateJSON(systemPrompt, userPrompt, options = {}) {
  const text = await generateContent(
    systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.',
    userPrompt,
    options,
  );

  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonStr);
}

module.exports = { getAI, generateContent, generateJSON };
