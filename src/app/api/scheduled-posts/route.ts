import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const createScheduledPostSchema = z.object({
  campaign_id: z.string().uuid('Valid campaign ID is required'),
  client_id: z.string().uuid('Valid client ID is required'),
  platform: z.string().min(1, 'Platform is required'),
  content_type: z.enum(['image', 'carousel', 'video', 'reels', 'stories', 'text']),
  caption: z.string().optional(),
  media_urls: z.array(z.string().url()).optional(),
  scheduled_at: z.string().datetime('Valid ISO datetime is required'),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).default('scheduled'),
  metadata: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// GET — list scheduled posts with filters
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const clientId = searchParams.get('client_id');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaign_id');

    let query = supabase
      .from('scheduled_posts')
      .select('*, campaigns(id, name), clients(id, name)')
      .order('scheduled_at', { ascending: true });

    // Filter by client
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    // Filter by campaign
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by month/year range
    if (year) {
      const y = parseInt(year, 10);
      if (month) {
        const m = parseInt(month, 10);
        const startDate = new Date(y, m - 1, 1).toISOString();
        const endDate = new Date(y, m, 1).toISOString();
        query = query.gte('scheduled_at', startDate).lt('scheduled_at', endDate);
      } else {
        const startDate = new Date(y, 0, 1).toISOString();
        const endDate = new Date(y + 1, 0, 1).toISOString();
        query = query.gte('scheduled_at', startDate).lt('scheduled_at', endDate);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new scheduled post
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const parsed = createScheduledPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', parsed.data.campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', parsed.data.client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
