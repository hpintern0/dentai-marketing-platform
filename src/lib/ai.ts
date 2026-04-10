import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAI(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

export async function generateContent(systemPrompt: string, userPrompt: string, options?: {
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const ai = getAI();
  const response = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text || '';
}

export async function generateJSON<T = any>(systemPrompt: string, userPrompt: string, options?: {
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const text = await generateContent(
    systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.',
    userPrompt,
    options,
  );

  // Extract JSON from response (handle cases where model wraps in ```json)
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(jsonStr);
}
