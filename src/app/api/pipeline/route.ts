import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    // Accept both formats: { campaign_id, ... } or { task_name, client_id, ... }
    const campaignId = body.campaign_id;
    const taskName = body.task_name || `campaign_${campaignId || Date.now()}`;

    // If campaign_id provided, verify it exists and get client info
    let clientId = body.client_id;
    if (campaignId) {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('id, client_id, job_payload, parsed_brief')
        .eq('id', campaignId)
        .single();

      if (error || !campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      clientId = clientId || campaign.client_id;

      // Update campaign status to generating
      await supabase.from('campaigns').update({
        status: 'generating',
        updated_at: new Date().toISOString(),
      }).eq('id', campaignId);
    }

    // Build pipeline payload
    const pipelinePayload = {
      task_name: taskName,
      client_id: clientId,
      campaign_id: campaignId,
      procedure_focus: body.procedure_focus || 'geral',
      campaign_objective: body.campaign_objective || 'captacao_pacientes',
      platform_targets: body.platform_targets || ['instagram_feed'],
      tone: body.tone || 'educativo',
      skip_research: body.skip_research || false,
      skip_image: body.skip_image || false,
      skip_video: body.skip_video || false,
      skip_carousel: body.skip_carousel || false,
    };

    // Start pipeline in background
    const path = eval("require")('path');
    const runnerPath = path.join(process.cwd(), 'pipeline', 'runner');
    const { runPipeline } = eval("require")(runnerPath);

    runPipeline(pipelinePayload).then(async (result: any) => {
      try {
        if (campaignId) {
          const supabaseUpdate = createServerClient();
          await supabaseUpdate.from('campaigns').update({
            status: 'reviewing',
            pipeline_status: {
              agents: result.results,
              overall_progress: 100,
              current_phase: 'complete',
            },
            updated_at: new Date().toISOString(),
          }).eq('id', campaignId);
        }
        console.log(`[Pipeline] Complete for ${taskName}`);
      } catch (err) {
        console.error('[Pipeline] Status update failed:', err);
      }
    }).catch(async (err: any) => {
      console.error(`[Pipeline] Failed for ${taskName}:`, err?.message);
      try {
        if (campaignId) {
          const supabaseUpdate = createServerClient();
          await supabaseUpdate.from('campaigns').update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          }).eq('id', campaignId);
        }
      } catch {}
    });

    return NextResponse.json({
      message: 'Pipeline iniciado',
      campaign_id: campaignId,
      task_name: taskName,
    }, { status: 202 });
  } catch (err: any) {
    console.error('[Pipeline] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
