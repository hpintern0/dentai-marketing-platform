import { createServerClient } from './supabase';

// Client operations
export async function getClients(search?: string) {
  const supabase = createServerClient();
  let query = supabase.from('clients').select('*, campaigns(count)').order('created_at', { ascending: false });
  if (search) {
    query = query.or(`name.ilike.%${search}%,instagram_handle.ilike.%${search}%,city.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getClientById(id: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*, campaigns(id, name, status, created_at), reference_profiles(id, instagram_handle, category)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createClient(client: any) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('clients').insert(client).select().single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: any) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Campaign operations
export async function getCampaigns(filters?: { client_id?: string; status?: string }) {
  const supabase = createServerClient();
  let query = supabase.from('campaigns').select('*, clients(id, name, instagram_handle)').order('created_at', { ascending: false });
  if (filters?.client_id) query = query.eq('client_id', filters.client_id);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCampaignById(id: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, clients(*), campaign_pieces(*), pipeline_jobs(*), scheduled_posts(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCampaign(campaign: any) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaignStatus(id: string, status: string, updates?: any) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status, ...updates })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Reference operations
export async function getReferenceProfiles(filters?: { specialty?: string; category?: string; client_id?: string }) {
  const supabase = createServerClient();
  let query = supabase.from('reference_profiles').select('*, clients(id, name)').order('created_at', { ascending: false });
  if (filters?.specialty) query = query.eq('specialty', filters.specialty);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.client_id) query = query.eq('client_id', filters.client_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Pipeline operations
export async function getPipelineJobs(campaignId: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('pipeline_jobs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updatePipelineJob(id: string, updates: any) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('pipeline_jobs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Chat messages
export async function getChatMessages(campaignId?: string, clientId?: string) {
  const supabase = createServerClient();
  let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
  if (campaignId) query = query.eq('campaign_id', campaignId);
  if (clientId) query = query.eq('client_id', clientId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Scheduled posts
export async function getScheduledPosts(filters?: { client_id?: string; month?: number; year?: number }) {
  const supabase = createServerClient();
  let query = supabase.from('scheduled_posts').select('*, campaigns(name), clients(name)').order('scheduled_at', { ascending: true });
  if (filters?.client_id) query = query.eq('client_id', filters.client_id);
  if (filters?.month && filters?.year) {
    const start = new Date(filters.year, filters.month - 1, 1).toISOString();
    const end = new Date(filters.year, filters.month, 0).toISOString();
    query = query.gte('scheduled_at', start).lte('scheduled_at', end);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Campaign pieces
export async function getCampaignPieces(campaignId: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaign_pieces')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('piece_type', { ascending: true });
  if (error) throw error;
  return data;
}

export async function approvePiece(pieceId: string, approvedBy: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaign_pieces')
    .update({ approval_status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString() })
    .eq('id', pieceId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function rejectPiece(pieceId: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('campaign_pieces')
    .update({ approval_status: 'rejected' })
    .eq('id', pieceId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
