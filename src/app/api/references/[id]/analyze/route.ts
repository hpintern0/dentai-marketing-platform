import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    // Verify the reference profile exists
    const { data: reference, error: fetchError } = await supabase
      .from('reference_profiles')
      .select('id, instagram_handle, analysis_status')
      .eq('id', id)
      .single();

    if (fetchError || !reference) {
      return NextResponse.json({ error: 'Reference profile not found' }, { status: 404 });
    }

    if (reference.analysis_status === 'processing') {
      return NextResponse.json(
        { error: 'Analysis is already in progress for this reference' },
        { status: 409 }
      );
    }

    // Update status to processing
    const { error: updateError } = await supabase
      .from('reference_profiles')
      .update({ analysis_status: 'processing' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Enqueue analysis job to BullMQ
    try {
      const { enqueueJob } = require('@/../pipeline/queue');
      await enqueueJob('dental_research_agent', {
        task_name: `analyze_ref_${id}_${Date.now()}`,
        reference_id: id,
        instagram_handle: reference.instagram_handle,
        mode: 'reference_analysis',
      });
    } catch (enqueueErr: any) {
      console.error('[Analyze API] Failed to enqueue analysis job:', enqueueErr?.message);
    }

    return NextResponse.json({
      message: 'Analysis job queued',
      data: {
        reference_id: id,
        instagram_handle: reference.instagram_handle,
        status: 'processing',
      },
    }, { status: 202 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
