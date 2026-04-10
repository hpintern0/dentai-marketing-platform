import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { mkdir } from 'fs/promises';
import path from 'path';

const pipelinePayloadSchema = z.object({
  campaign_id: z.string().uuid('Valid campaign ID is required'),
  steps: z.array(z.string()).min(1, 'At least one pipeline step is required'),
  options: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const parsed = pipelinePayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { campaign_id, steps, options } = parsed.data;

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, client_id, status')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Create output directories for pipeline artifacts
    const outputBase = path.join(process.cwd(), 'output', 'pipelines', campaign_id);
    for (const step of steps) {
      await mkdir(path.join(outputBase, step), { recursive: true });
    }

    // Build initial pipeline status
    const pipelineStatus: Record<string, unknown> = {
      started_at: new Date().toISOString(),
      steps: steps.reduce((acc, step) => {
        acc[step] = { status: 'queued', started_at: null, completed_at: null };
        return acc;
      }, {} as Record<string, unknown>),
    };

    // Update campaign with job payload and pipeline status
    const { data: updated, error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'processing',
        job_payload: { steps, options: options ?? {} },
        pipeline_status: pipelineStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaign_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Start pipeline in background (don't await) — in-process runner, no Redis needed
    const { runPipeline } = eval("require")(require('path').join(process.cwd(), 'pipeline', 'runner'));
    const pipelinePayload = {
      task_name: `campaign_${campaign_id}_${Date.now()}`,
      client_id: campaign.client_id,
      campaign_id,
      steps,
      ...options,
    };

    // Fire and forget — pipeline runs in background
    runPipeline(pipelinePayload).then(async (result: any) => {
      // Update campaign status when done
      try {
        const supabaseUpdate = createServerClient();
        await supabaseUpdate.from('campaigns').update({
          status: 'reviewing',
          pipeline_status: {
            agents: result.results,
            overall_progress: 100,
            current_phase: 'complete',
          },
          updated_at: new Date().toISOString(),
        }).eq('id', campaign_id);
      } catch (err) {
        console.error('[Pipeline] Failed to update campaign status:', err);
      }
    }).catch(async (err: any) => {
      console.error('[Pipeline] Pipeline failed:', err?.message);
      try {
        const supabaseUpdate = createServerClient();
        await supabaseUpdate.from('campaigns').update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        }).eq('id', campaign_id);
      } catch {}
    });

    return NextResponse.json({
      message: 'Pipeline started',
      data: {
        campaign_id,
        steps,
        output_directory: outputBase,
        pipeline_status: pipelineStatus,
      },
    }, { status: 202 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
