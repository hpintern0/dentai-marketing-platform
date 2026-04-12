import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase';

type RouteContext = { params: Promise<{ id: string }> };

// GET — list clients linked to this reference
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('reference_client_links')
      .select('*, clients(id, name, instagram_handle, specialty)')
      .eq('reference_id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — link a client to this reference
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { client_id } = await request.json();
    const supabase = createServerClient();

    if (!client_id) {
      return NextResponse.json({ error: 'client_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reference_client_links')
      .insert({ reference_id: id, client_id })
      .select('*, clients(id, name)')
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: 'Cliente já vinculado a esta referência' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — unlink a client from this reference
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const supabase = createServerClient();

    if (!clientId) {
      return NextResponse.json({ error: 'client_id query param required' }, { status: 400 });
    }

    await supabase
      .from('reference_client_links')
      .delete()
      .eq('reference_id', id)
      .eq('client_id', clientId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
