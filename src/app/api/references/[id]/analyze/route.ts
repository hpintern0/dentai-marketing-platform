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

    // Run analysis in background — in-process, no Redis needed
    const handlers = eval("require")('../../../../../pipeline/agents/index');
    const job = {
      data: {
        task_name: `ref_${id}`,
        mode: 'reference_analysis',
        reference_id: id,
        instagram_handle: reference.instagram_handle,
      },
      name: 'dental_research_agent',
    };
    handlers.dental_research_agent(job).then(async () => {
      const supabaseUpdate = createServerClient();
      await supabaseUpdate.from('reference_profiles').update({
        analysis_status: 'analisado',
        last_analyzed_at: new Date().toISOString(),
      }).eq('id', id);
    }).catch(async (err: any) => {
      console.error('[Analyze API] Analysis failed:', err?.message);
      const supabaseUpdate = createServerClient();
      await supabaseUpdate.from('reference_profiles').update({
        analysis_status: 'erro',
      }).eq('id', id);
    });

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
