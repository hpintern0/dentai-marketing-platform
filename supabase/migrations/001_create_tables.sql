-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CLIENTS TABLE
-- =============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL CHECK (specialty IN ('estetica', 'ortodontia', 'implantodontia', 'clinica_geral', 'harmonizacao', 'periodontia', 'outra')),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  instagram_handle TEXT,
  youtube_channel TEXT,
  cro_number TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'educativo' CHECK (tone IN ('premium', 'popular', 'familiar', 'tecnico', 'educativo')),
  color_palette JSONB NOT NULL DEFAULT '{"primary": "#2C5F8A", "secondary": "#08c4b0", "accent": "#F59E0B", "background": "#FFFFFF", "text": "#1A1A1A"}',
  typography JSONB NOT NULL DEFAULT '{"heading_font": "Inter", "body_font": "Inter"}',
  active_platforms TEXT[] NOT NULL DEFAULT ARRAY['instagram_feed'],
  default_ctas TEXT[] NOT NULL DEFAULT ARRAY['Agende sua avaliacao'],
  logo_url TEXT,
  assets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- REFERENCE PROFILES TABLE
-- =============================================
CREATE TABLE reference_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instagram_handle TEXT NOT NULL,
  specialty TEXT NOT NULL CHECK (specialty IN ('estetica', 'ortodontia', 'implantodontia', 'clinica_geral', 'harmonizacao', 'periodontia', 'outra')),
  category TEXT NOT NULL CHECK (category IN ('benchmark_nacional', 'benchmark_regional', 'concorrente_direto', 'inspiracao_estetica', 'referencia_educativa')),
  notes TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  analysis_status TEXT NOT NULL DEFAULT 'pendente' CHECK (analysis_status IN ('pendente', 'analisando', 'analisado', 'erro')),
  last_analyzed_at TIMESTAMPTZ,
  insights JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  raw_brief TEXT,
  parsed_brief JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'briefing', 'generating', 'reviewing', 'approved', 'scheduled', 'published', 'failed')),
  job_payload JSONB,
  pipeline_status JSONB DEFAULT '{"agents": [], "overall_progress": 0, "current_phase": "idle"}',
  review_rounds JSONB DEFAULT '[]',
  outputs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CAMPAIGN PIECES (individual content pieces)
-- =============================================
CREATE TABLE campaign_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  piece_type TEXT NOT NULL CHECK (piece_type IN ('instagram_ad', 'carousel_slide', 'video', 'instagram_caption', 'threads_post', 'youtube_metadata', 'stories_copy', 'whatsapp_cta')),
  piece_index INTEGER DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}',
  media_url TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_human_review')),
  review_issues JSONB DEFAULT '[]',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SCHEDULED POSTS
-- =============================================
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  piece_id UUID REFERENCES campaign_pieces(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  caption TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  publish_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CHAT MESSAGES (for campaign brief chat)
-- =============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'brief_confirmation', 'pipeline_status', 'result_preview', 'error')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PIPELINE JOBS (tracking individual agent jobs)
-- =============================================
CREATE TABLE pipeline_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'complete', 'failed', 'skipped')),
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  attempt INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- MEDIA ASSETS (uploaded to Supabase Storage)
-- =============================================
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'photo_dentist', 'photo_clinic', 'before_after', 'ad_creative', 'carousel_slide', 'video', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  has_patient_consent BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_reference_profiles_specialty ON reference_profiles(specialty);
CREATE INDEX idx_reference_profiles_category ON reference_profiles(category);
CREATE INDEX idx_reference_profiles_client_id ON reference_profiles(client_id);
CREATE INDEX idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_pieces_campaign_id ON campaign_pieces(campaign_id);
CREATE INDEX idx_campaign_pieces_approval_status ON campaign_pieces(approval_status);
CREATE INDEX idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_client_id ON scheduled_posts(client_id);
CREATE INDEX idx_chat_messages_campaign_id ON chat_messages(campaign_id);
CREATE INDEX idx_chat_messages_client_id ON chat_messages(client_id);
CREATE INDEX idx_pipeline_jobs_campaign_id ON pipeline_jobs(campaign_id);
CREATE INDEX idx_pipeline_jobs_status ON pipeline_jobs(status);
CREATE INDEX idx_media_assets_client_id ON media_assets(client_id);
CREATE INDEX idx_media_assets_campaign_id ON media_assets(campaign_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER campaign_pieces_updated_at BEFORE UPDATE ON campaign_pieces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (agency members)
-- In production, add proper role-based policies
CREATE POLICY "Allow all for authenticated" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON reference_profiles FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON campaign_pieces FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON scheduled_posts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON pipeline_jobs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON media_assets FOR ALL USING (true);
