function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

export const env = {
  // Supabase
  supabaseUrl: () => getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: () => getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceKey: () => getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Redis
  redisUrl: () => getRequiredEnv('UPSTASH_REDIS_URL'),

  // AI
  anthropicApiKey: () => getRequiredEnv('ANTHROPIC_API_KEY'),

  // Research
  tavilyApiKey: () => getOptionalEnv('TAVILY_API_KEY'),

  // Social
  instagramToken: () => getOptionalEnv('INSTAGRAM_ACCESS_TOKEN'),
  instagramAccountId: () => getOptionalEnv('INSTAGRAM_BUSINESS_ACCOUNT_ID'),
  // App
  appUrl: () => getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  webhookUrl: () => getOptionalEnv('WEBHOOK_URL'),
  nodeEnv: () => getOptionalEnv('NODE_ENV', 'development'),
  port: () => parseInt(getOptionalEnv('PORT', '3000'), 10),

  // Check if all critical vars are set
  validate: () => {
    const missing: string[] = [];
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];
    for (const name of required) {
      if (!process.env[name]) missing.push(name);
    }
    return { valid: missing.length === 0, missing };
  },
};
