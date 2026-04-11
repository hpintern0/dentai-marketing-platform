import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createServerClient } from '@/lib/supabase';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    // Get client
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, name, drive_folder_url')
      .eq('id', id)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.drive_folder_url) {
      return NextResponse.json({ error: 'No Google Drive folder URL configured for this client' }, { status: 400 });
    }

    // Run sync in background
    const path = eval("require")('path');
    const syncPath = path.join(process.cwd(), 'pipeline', 'drive', 'sync');
    const { syncDriveFolder } = eval("require")(syncPath);

    // Fire and forget
    syncDriveFolder(client.drive_folder_url, id).then((result: any) => {
      console.log(`[Drive Sync] Complete for ${client.name}: ${result.uploaded} files`);
    }).catch((err: any) => {
      console.error(`[Drive Sync] Failed for ${client.name}: ${err.message}`);
    });

    return NextResponse.json({
      message: 'Sincronizacao iniciada',
      drive_url: client.drive_folder_url
    }, { status: 202 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
