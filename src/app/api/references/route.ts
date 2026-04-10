import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const createReferenceSchema = z.object({
  instagram_handle: z.string().min(1, 'Instagram handle is required'),
  specialty: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  client_id: z.string().uuid().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const category = searchParams.get('category');
    const clientId = searchParams.get('client_id');

    let query = supabase.from('reference_profiles').select('*').order('created_at', { ascending: false });

    if (specialty) {
      query = query.eq('specialty', specialty);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const parsed = createReferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reference_profiles')
      .insert({ ...parsed.data, analysis_status: 'pending' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
