import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Fetch all campaigns that are currently processing
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name, client_id, status, pipeline_status, job_payload, updated_at')
      .eq('status', 'processing')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const jobs = (data ?? []).map((campaign) => ({
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      client_id: campaign.client_id,
      status: campaign.status,
      pipeline_status: campaign.pipeline_status,
      job_payload: campaign.job_payload,
      updated_at: campaign.updated_at,
    }));

    return NextResponse.json({ jobs, active_count: jobs.length });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
