export const DENTAL_SPECIALTIES = [
  { value: 'estetica', label: 'Estética' },
  { value: 'ortodontia', label: 'Ortodontia' },
  { value: 'implantodontia', label: 'Implantodontia' },
  { value: 'clinica_geral', label: 'Clínica Geral' },
  { value: 'harmonizacao', label: 'Harmonização' },
  { value: 'periodontia', label: 'Periodontia' },
  { value: 'outra', label: 'Outra' },
] as const;

export const REFERENCE_CATEGORIES = [
  { value: 'benchmark_nacional', label: 'Benchmark Nacional' },
  { value: 'benchmark_regional', label: 'Benchmark Regional' },
  { value: 'concorrente_direto', label: 'Concorrente Direto' },
  { value: 'inspiracao_estetica', label: 'Inspiração Estética' },
  { value: 'referencia_educativa', label: 'Referência Educativa' },
] as const;

export const TONE_OPTIONS = [
  { value: 'premium', label: 'Premium' },
  { value: 'popular', label: 'Popular' },
  { value: 'familiar', label: 'Familiar' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'educativo', label: 'Educativo' },
] as const;

export const PLATFORM_OPTIONS = [
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'instagram_stories', label: 'Instagram Stories' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
  { value: 'threads', label: 'Threads' },
] as const;

export const CAMPAIGN_OBJECTIVES = [
  { value: 'captacao_pacientes', label: 'Captação de Pacientes' },
  { value: 'educacao', label: 'Educação' },
  { value: 'awareness', label: 'Awareness / Marca' },
  { value: 'sazonalidade', label: 'Sazonalidade' },
  { value: 'marca_pessoal', label: 'Marca Pessoal' },
  { value: 'reducao_de_objecao', label: 'Redução de Objeção' },
] as const;

export const CONTENT_FORMATS = [
  { value: 'carousel', label: 'Carrossel' },
  { value: 'feed_static', label: 'Feed Estático' },
  { value: 'reels', label: 'Reels' },
  { value: 'stories', label: 'Stories' },
  { value: 'copy_only', label: 'Apenas Copy' },
  { value: 'multi_format', label: 'Multi-formato' },
] as const;

export const AGENT_NAMES: Record<string, string> = {
  dental_research_agent: 'Dental Research Agent',
  dental_intelligence_agent: 'Dental Intelligence Agent',
  ad_creative_designer: 'Ad Creative Designer',
  carousel_agent: 'Carousel Agent',
  video_ad_specialist: 'Video Ad Specialist',
  copywriter_agent: 'Copywriter Agent',
  review_orchestrator: 'Review Orchestrator',
  cfo_compliance_reviewer: 'CFO Compliance Reviewer',
  copy_reviewer: 'Copy Reviewer',
  visual_reviewer: 'Visual Reviewer',
  dental_expert_reviewer: 'Dental Expert Reviewer',
  issue_consolidator: 'Issue Consolidator',
  correction_agent: 'Correction Agent',
  distribution_agent: 'Distribution Agent',
};

export const PIPELINE_PHASES = [
  'research',
  'creation',
  'review',
  'approval',
  'distribution',
] as const;
