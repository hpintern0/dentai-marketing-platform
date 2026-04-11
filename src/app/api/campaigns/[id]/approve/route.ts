import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const approveSchema = z.union([
  z.object({ piece_ids: z.array(z.string().uuid()).min(1), approve_all: z.undefined() }),
  z.object({ approve_all: z.literal(true), piece_ids: z.undefined() }),
]);

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();
    const body = await request.json();

    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Provide either { piece_ids: string[] } or { approve_all: true }', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const payload = parsed.data;

    if ('approve_all' in payload && payload.approve_all) {
      // Approve all scheduled posts for this campaign
      const { data: updated, error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'approved' })
        .eq('campaign_id', id)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update campaign status
      await supabase
        .from('campaigns')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', id);

      return NextResponse.json({
        message: 'All pieces approved',
        data: { approved_count: updated?.length ?? 0 },
      });
    } else if ('piece_ids' in payload && payload.piece_ids) {
      // Approve specific pieces
      const { data: updated, error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'approved' })
        .eq('campaign_id', id)
        .in('id', payload.piece_ids)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Check if all pieces are now approved
      const { count } = await supabase
        .from('scheduled_posts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id)
        .neq('status', 'approved');

      if (count === 0) {
        await supabase
          .from('campaigns')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', id);
      }

      return NextResponse.json({
        message: 'Pieces approved',
        data: { approved_count: updated?.length ?? 0 },
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
