-- Many-to-many: reference profiles can serve multiple clients
CREATE TABLE IF NOT EXISTS reference_client_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id UUID NOT NULL REFERENCES reference_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reference_id, client_id)
);

CREATE INDEX idx_ref_client_links_ref ON reference_client_links(reference_id);
CREATE INDEX idx_ref_client_links_client ON reference_client_links(client_id);

-- RLS
ALTER TABLE reference_client_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON reference_client_links FOR ALL USING (true);

-- Migrate existing client_id references to the junction table
INSERT INTO reference_client_links (reference_id, client_id)
SELECT id, client_id FROM reference_profiles WHERE client_id IS NOT NULL
ON CONFLICT DO NOTHING;
