// CommonJS wrapper for AI functions used by pipeline agents
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

let Anthropic;

function getAI() {
  if (!Anthropic) {
    const mod = eval("require")('@anthropic-ai/sdk');
    Anthropic = mod.default || mod;
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateContent(systemPrompt, userPrompt, options = {}) {
  const ai = getAI();
  const maxRetries = options.maxRetries || MAX_RETRIES;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.messages.create({
        model: options.model || DEFAULT_MODEL,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const textBlock = response.content.find(b => b.type === 'text');
      return textBlock?.text || '';
    } catch (err) {
      const status = err?.status || err?.statusCode || 0;
      const isRetryable = status === 529 || status === 502 || status === 503 || status === 408 || err?.message?.includes('overloaded');

      if (isRetryable && attempt < maxRetries) {
        const delay = RETRY_DELAY_MS * attempt;
        console.warn(`[AI] Attempt ${attempt}/${maxRetries} failed (${status}). Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
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
