import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaign_id = searchParams.get('campaign_id');
  const client_id = searchParams.get('client_id');

  const supabase = createServerClient();
  let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
  if (campaign_id) query = query.eq('campaign_id', campaign_id);
  if (client_id) query = query.eq('client_id', client_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const { client_id, message, campaign_id, history } = await request.json();

    if (!client_id || !message) {
      return NextResponse.json({ error: 'client_id and message are required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Load client profile
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Load recent campaigns for this client
    const { data: recentCampaigns } = await supabase
      .from('campaigns')
      .select('name, parsed_brief, status, created_at')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Parse brief using AI
    // Dynamic import for the brief parser
    const { parseBrief } = eval("require")('../../../../pipeline/agents/ai-brief-parser');
    const result = await parseBrief(message, client, recentCampaigns || []);

    // Save chat message
    await supabase.from('chat_messages').insert([
      { client_id, campaign_id, role: 'user', content: message },
      { client_id, campaign_id, role: 'assistant', content: result.message, message_type: result.type, metadata: result.brief || {} },
    ]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
