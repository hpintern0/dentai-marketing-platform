import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; message?: string }> = {};

  // Check Supabase
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      checks.supabase = { status: 'ok' };
    } else {
      checks.supabase = { status: 'warning', message: 'URL not configured' };
    }
  } catch (err: any) {
    checks.supabase = { status: 'error', message: err.message };
  }

  // Check Redis
  try {
    if (process.env.UPSTASH_REDIS_URL) {
      checks.redis = { status: 'ok' };
    } else {
      checks.redis = { status: 'warning', message: 'URL not configured' };
    }
  } catch (err: any) {
    checks.redis = { status: 'error', message: err.message };
  }

  // Check AI
  checks.ai = process.env.ANTHROPIC_API_KEY
    ? { status: 'ok' }
    : { status: 'warning', message: 'API key not configured' };

  // Check Tavily
  checks.tavily = process.env.TAVILY_API_KEY
    ? { status: 'ok' }
    : { status: 'warning', message: 'API key not configured (research will use AI-only mode)' };

  const allOk = Object.values(checks).every(c => c.status !== 'error');

  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks,
  }, { status: allOk ? 200 : 503 });
}
