-- =============================================
-- SEED DATA: Example Dental Clinics
-- =============================================

-- Client 1: Clinica Sorriso Perfeito - Estetica - Sao Paulo
INSERT INTO clients (id, name, specialty, city, state, instagram_handle, youtube_channel, cro_number, tone, color_palette, typography, active_platforms, default_ctas, logo_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Clinica Sorriso Perfeito - Dra. Ana Paula',
  'estetica',
  'Sao Paulo',
  'SP',
  '@clinicasorrisoperfeito',
  'youtube.com/@clinicasorrisoperfeito',
  'CRO-SP 123456',
  'premium',
  '{"primary": "#1A3C5E", "secondary": "#D4AF37", "accent": "#FFFFFF", "background": "#F8F6F0", "text": "#1A1A1A"}',
  '{"heading_font": "Playfair Display", "body_font": "Lato"}',
  ARRAY['instagram_feed', 'instagram_stories', 'instagram_reels', 'youtube'],
  ARRAY['Agende sua avaliacao', 'Transforme seu sorriso', 'Marque sua consulta'],
  NULL
);

-- Client 2: OrthoSmile - Ortodontia - Rio de Janeiro
INSERT INTO clients (id, name, specialty, city, state, instagram_handle, youtube_channel, cro_number, tone, color_palette, typography, active_platforms, default_ctas, logo_url)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'OrthoSmile - Dr. Ricardo Mendes',
  'ortodontia',
  'Rio de Janeiro',
  'RJ',
  '@orthosmile_rj',
  NULL,
  'CRO-RJ 789012',
  'familiar',
  '{"primary": "#4A90D9", "secondary": "#7BC67E", "accent": "#FF6B6B", "background": "#FFFFFF", "text": "#333333"}',
  '{"heading_font": "Nunito", "body_font": "Open Sans"}',
  ARRAY['instagram_feed', 'instagram_stories', 'threads'],
  ARRAY['Agende sua avaliacao', 'Sorriso alinhado e voce feliz', 'Venha nos conhecer'],
  NULL
);

-- Client 3: ImplantCenter - Implantodontia - Belo Horizonte
INSERT INTO clients (id, name, specialty, city, state, instagram_handle, youtube_channel, cro_number, tone, color_palette, typography, active_platforms, default_ctas, logo_url)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'ImplantCenter - Dr. Carlos Eduardo',
  'implantodontia',
  'Belo Horizonte',
  'MG',
  '@implantcenter_bh',
  'youtube.com/@implantcenterbh',
  'CRO-MG 345678',
  'tecnico',
  '{"primary": "#0D4F4F", "secondary": "#2196F3", "accent": "#FF9800", "background": "#FAFAFA", "text": "#212121"}',
  '{"heading_font": "Montserrat", "body_font": "Roboto"}',
  ARRAY['instagram_feed', 'instagram_reels', 'youtube', 'whatsapp'],
  ARRAY['Agende sua avaliacao', 'Recupere seu sorriso', 'Fale com nosso especialista'],
  NULL
);

-- =============================================
-- SEED DATA: Reference Profiles
-- =============================================

INSERT INTO reference_profiles (instagram_handle, specialty, category, notes, client_id, analysis_status, insights)
VALUES
(
  '@drapaula_odonto',
  'estetica',
  'benchmark_nacional',
  'Referencia nacional em estetica dental. Conteudo premium com foco em lentes de contato e clareamento.',
  NULL,
  'analisado',
  '{"avg_likes": 2500, "avg_comments": 180, "posting_frequency": "daily", "top_formats": ["carrossel", "reels"], "top_topics": ["lentes_de_contato", "clareamento", "facetas"], "engagement_rate": 4.2, "audience_size": 120000, "content_style": "premium_educativo", "best_posting_times": ["10:00", "19:00"]}'
),
(
  '@dr.sorriso',
  'clinica_geral',
  'benchmark_nacional',
  'Perfil educativo com linguagem acessivel. Forte presenca em Reels com dicas rapidas.',
  NULL,
  'analisado',
  '{"avg_likes": 5000, "avg_comments": 350, "posting_frequency": "daily", "top_formats": ["reels", "stories"], "top_topics": ["dicas_saude_bucal", "prevencao", "tratamentos_comuns"], "engagement_rate": 5.8, "audience_size": 250000, "content_style": "educativo_popular", "best_posting_times": ["08:00", "12:00", "20:00"]}'
),
(
  '@ortodontista.top',
  'ortodontia',
  'benchmark_regional',
  'Forte no Rio de Janeiro. Conteudo focado em antes/depois e depoimentos de pacientes.',
  '22222222-2222-2222-2222-222222222222',
  'analisado',
  '{"avg_likes": 800, "avg_comments": 60, "posting_frequency": "3x_week", "top_formats": ["carrossel", "reels"], "top_topics": ["antes_depois", "invisalign", "aparelho_fixo"], "engagement_rate": 3.5, "audience_size": 35000, "content_style": "familiar_descontraido", "best_posting_times": ["11:00", "18:00"]}'
),
(
  '@implantes.br',
  'implantodontia',
  'referencia_educativa',
  'Canal educativo sobre implantes. Explica procedimentos de forma clara e tecnica.',
  '33333333-3333-3333-3333-333333333333',
  'pendente',
  NULL
),
(
  '@estetica.dental',
  'estetica',
  'inspiracao_estetica',
  'Perfil com identidade visual impecavel. Referencia em design de posts para odontologia.',
  '11111111-1111-1111-1111-111111111111',
  'analisado',
  '{"avg_likes": 1200, "avg_comments": 90, "posting_frequency": "4x_week", "top_formats": ["carrossel", "feed_image"], "top_topics": ["estetica_dental", "harmonizacao", "design_do_sorriso"], "engagement_rate": 3.8, "audience_size": 55000, "content_style": "premium_visual", "best_posting_times": ["09:00", "17:00"]}'
);

-- =============================================
-- SEED DATA: Sample Campaign
-- =============================================

INSERT INTO campaigns (id, client_id, name, raw_brief, parsed_brief, status, pipeline_status)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Campanha Clareamento Dental - Junho 2026',
  'Quero uma campanha de clareamento dental para o mes de junho. O foco e atrair pacientes que querem clarear os dentes para o inverno. Publico-alvo: mulheres 25-45 anos, classe A/B, Sao Paulo. Quero posts no Instagram (feed e stories) e um video curto para Reels. Tom premium e sofisticado. Mencionar que usamos a tecnologia Philips Zoom. CTA principal: agendar avaliacao gratuita.',
  '{
    "objective": "Atrair pacientes para clareamento dental",
    "target_audience": {
      "gender": "feminino",
      "age_range": "25-45",
      "socioeconomic": "A/B",
      "location": "Sao Paulo/SP",
      "interests": ["estetica", "beleza", "saude"]
    },
    "platforms": ["instagram_feed", "instagram_stories", "instagram_reels"],
    "content_types": ["carousel", "stories_sequence", "reels_video"],
    "key_messages": [
      "Clareamento com tecnologia Philips Zoom",
      "Resultados visiveis em uma sessao",
      "Avaliacao gratuita"
    ],
    "tone": "premium",
    "cta": "Agende sua avaliacao gratuita",
    "timeline": "Junho 2026",
    "differentials": ["Philips Zoom", "resultado imediato", "equipe especializada"],
    "restrictions": ["Nao prometer resultados absolutos", "Incluir CRO no material", "Seguir normas CFO"]
  }',
  'draft',
  '{"agents": [], "overall_progress": 0, "current_phase": "idle"}'
);

-- Sample chat messages for the campaign
INSERT INTO chat_messages (campaign_id, client_id, role, content, message_type)
VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'Quero uma campanha de clareamento dental para junho. Foco em mulheres 25-45, classe A/B, SP. Tom premium. Usamos Philips Zoom.',
  'text'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'assistant',
  'Entendi! Vou criar uma campanha premium de clareamento dental para junho. Aqui esta o resumo do briefing:

- Objetivo: Atrair pacientes para clareamento dental
- Publico: Mulheres, 25-45 anos, classe A/B, Sao Paulo
- Plataformas: Instagram Feed, Stories e Reels
- Diferencial: Tecnologia Philips Zoom
- Tom: Premium e sofisticado
- CTA: Agende sua avaliacao gratuita

Posso prosseguir com a geracao do conteudo?',
  'brief_confirmation'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'user',
  'Sim, pode prosseguir!',
  'text'
);
