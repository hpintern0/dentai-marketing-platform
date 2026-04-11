import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    // Get reference profile
    const { data: reference, error } = await supabase
      .from('reference_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !reference) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 });
    }

    if (reference.analysis_status === 'analisando') {
      return NextResponse.json(
        { error: 'Analysis is already in progress for this reference' },
        { status: 409 },
      );
    }

    // Set status to analyzing immediately
    await supabase
      .from('reference_profiles')
      .update({ analysis_status: 'analisando' })
      .eq('id', id);

    // Run analysis in background (don't await)
    const { analyzeInstagramProfile } = eval("require")(require('path').join(process.cwd(), 'pipeline', 'instagram', 'analyze-profile'));

    analyzeInstagramProfile(reference.instagram_handle).then(async (insights: any) => {
      const supabaseUpdate = createServerClient();
      await supabaseUpdate
        .from('reference_profiles')
        .update({
          insights,
          analysis_status: 'analisado',
          last_analyzed_at: new Date().toISOString(),
        })
        .eq('id', id);
      console.log(`[Reference] Analysis complete for ${reference.instagram_handle}`);
    }).catch(async (err: any) => {
      console.error(`[Reference] Analysis failed for ${reference.instagram_handle}:`, err.message);
      const supabaseUpdate = createServerClient();
      await supabaseUpdate
        .from('reference_profiles')
        .update({ analysis_status: 'erro' })
        .eq('id', id);
    });

    return NextResponse.json(
      { status: 'analyzing', message: 'Analise iniciada' },
      { status: 202 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
