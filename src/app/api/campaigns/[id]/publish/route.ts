import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    // Fetch campaign with client info
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, clients(id, name, active_platforms)')
      .eq('id', id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'approved') {
      return NextResponse.json(
        { error: 'Campaign must be approved before publishing' },
        { status: 400 }
      );
    }

    // Fetch approved posts
    const { data: posts, error: postsError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('campaign_id', id)
      .eq('status', 'approved');

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: 'No approved posts found for this campaign' },
        { status: 400 }
      );
    }

    // Update campaign status to publishing
    await supabase
      .from('campaigns')
      .update({
        status: 'publishing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Update posts to queued
    await supabase
      .from('scheduled_posts')
      .update({ status: 'queued' })
      .eq('campaign_id', id)
      .eq('status', 'approved');

    // Trigger distribution agent via BullMQ
    try {
      const { enqueueJob } = require('@/../pipeline/queue');
      await enqueueJob('distribution_agent', {
        task_name: `publish_${id}_${Date.now()}`,
        campaign_id: id,
        client_id: campaign.client_id,
        ...(campaign.job_payload || {}),
      });
    } catch (enqueueErr: any) {
      console.error('[Publish API] Failed to enqueue distribution job:', enqueueErr?.message);
    }

    return NextResponse.json({
      message: 'Campaign publishing triggered',
      data: {
        campaign_id: id,
        posts_queued: posts.length,
        status: 'publishing',
      },
    }, { status: 202 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
