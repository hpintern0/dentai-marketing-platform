import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const updateCampaignSchema = z.object({
  name: z.string().optional(),
  raw_brief: z.string().optional(),
  parsed_brief: z.record(z.unknown()).optional(),
  status: z.string().optional(),
  job_payload: z.record(z.unknown()).optional(),
  pipeline_status: z.record(z.unknown()).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, clients(id, name, specialty), campaign_pieces(*)')
      .eq('id', id)
      .single();

    if (campaignError) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch associated scheduled posts
    const { data: posts } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('campaign_id', id)
      .order('scheduled_at', { ascending: true });

    return NextResponse.json({
      ...campaign,
      scheduled_posts: posts ?? [],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();
    const body = await request.json();

    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
