import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.instagram_handle) {
      return NextResponse.json({ error: 'Cliente não tem Instagram configurado' }, { status: 400 });
    }

    // Clean handle
    let handle = client.instagram_handle;
    const urlMatch = handle.match(/instagram\.com\/([^/?]+)/);
    if (urlMatch) handle = urlMatch[1];
    handle = handle.replace('@', '');

    // Run analysis in background
    const path = eval("require")('path');
    const analyzePath = path.join(process.cwd(), 'pipeline', 'instagram', 'analyze-profile');
    const { analyzeInstagramProfile } = eval("require")(analyzePath);

    analyzeInstagramProfile(handle, undefined, id).then(async (insights: any) => {
      try {
        const supabaseUpdate = createServerClient();
        // Save intelligence directly on the client record
        await supabaseUpdate.from('clients').update({
          assets: {
            ...(client.assets || {}),
            instagram_intelligence: insights,
            instagram_analyzed_at: new Date().toISOString(),
          },
        }).eq('id', id);
        console.log(`[Client Analysis] Complete for ${client.name}`);
      } catch (err: any) {
        console.error(`[Client Analysis] Save failed: ${err.message}`);
      }
    }).catch((err: any) => {
      console.error(`[Client Analysis] Failed for ${client.name}: ${err.message}`);
    });

    return NextResponse.json({
      message: 'Análise do Instagram iniciada',
      handle: `@${handle}`,
    }, { status: 202 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
