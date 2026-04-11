import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  specialty: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  instagram_handle: z.string().optional(),
  cro_number: z.string().optional(),
  tone: z.string().optional(),
  color_palette: z.record(z.unknown()).optional(),
  typography: z.record(z.unknown()).optional(),
  active_platforms: z.array(z.string()).optional(),
  default_ctas: z.array(z.string()).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name, status, created_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    const { data: reference_profiles } = await supabase
      .from('reference_profiles')
      .select('id, instagram_handle, category, analysis_status, last_analyzed_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ ...client, campaigns: campaigns ?? [], reference_profiles: reference_profiles ?? [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();
    const body = await request.json();

    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clients')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
