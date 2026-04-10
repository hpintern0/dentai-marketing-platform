import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const webhookSchema = z.object({
  event: z.enum(['pipeline.completed', 'pipeline.step_completed', 'pipeline.failed', 'approval.needed']),
  campaign_id: z.string().uuid(),
  payload: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const parsed = webhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { event, campaign_id, payload } = parsed.data;

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, pipeline_status')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    switch (event) {
      case 'pipeline.step_completed': {
        const stepName = (payload as Record<string, unknown>)?.step as string | undefined;
        if (stepName && campaign.pipeline_status) {
          const pipelineStatus = campaign.pipeline_status as Record<string, unknown>;
          const steps = pipelineStatus.steps as Record<string, Record<string, unknown>> | undefined;
          if (steps && steps[stepName]) {
            steps[stepName] = {
              ...steps[stepName],
              status: 'completed',
              completed_at: new Date().toISOString(),
            };
          }

          await supabase
            .from('campaigns')
            .update({ pipeline_status: pipelineStatus, updated_at: new Date().toISOString() })
            .eq('id', campaign_id);
        }
        break;
      }

      case 'pipeline.completed': {
        await supabase
          .from('campaigns')
          .update({
            status: 'review',
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaign_id);
        break;
      }

      case 'pipeline.failed': {
        const errorMessage = (payload as Record<string, unknown>)?.error as string | undefined;
        const pipelineStatus = (campaign.pipeline_status ?? {}) as Record<string, unknown>;
        pipelineStatus.error = errorMessage ?? 'Unknown error';
        pipelineStatus.failed_at = new Date().toISOString();

        await supabase
          .from('campaigns')
          .update({
            status: 'failed',
            pipeline_status: pipelineStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaign_id);
        break;
      }

      case 'approval.needed': {
        await supabase
          .from('campaigns')
          .update({
            status: 'pending_approval',
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaign_id);
        break;
      }
    }

    return NextResponse.json({ received: true, event, campaign_id });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
