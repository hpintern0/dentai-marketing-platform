// Client types
export interface Client {
  id: string;
  name: string;           // nome do consultório
  specialty: DentalSpecialty;
  city: string;
  state: string;
  instagram_handle: string;
  cro_number: string;
  tone: ToneOfVoice;
  color_palette: ColorPalette;
  typography: Typography;
  active_platforms: Platform[];
  default_ctas: string[];
  drive_folder_url?: string;
  created_at: string;
  updated_at: string;
}

export type DentalSpecialty = 'estetica' | 'ortodontia' | 'implantodontia' | 'clinica_geral' | 'harmonizacao' | 'periodontia' | 'outra';

export type ToneOfVoice = 'premium' | 'popular' | 'familiar' | 'tecnico' | 'educativo';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Typography {
  heading_font: string;
  body_font: string;
}

export type Platform = 'instagram_feed' | 'instagram_reels' | 'instagram_stories';

// Reference Profile types
export interface ReferenceProfile {
  id: string;
  instagram_handle: string;
  specialty: DentalSpecialty;
  category: ReferenceCategory;
  notes?: string;
  client_id?: string;     // null = global reference
  analysis_status: AnalysisStatus;
  last_analyzed_at?: string;
  insights?: ReferenceInsights;
  created_at: string;
}

export type ReferenceCategory = 'benchmark_nacional' | 'benchmark_regional' | 'concorrente_direto' | 'inspiracao_estetica' | 'referencia_educativa';

export type AnalysisStatus = 'pendente' | 'analisando' | 'analisado' | 'erro';

export interface ReferenceInsights {
  top_formats: string[];
  recurring_themes: string[];
  high_performance_hooks: string[];
  predominant_tone: string;
  posting_frequency: string;
  hashtag_usage: string[];
  cta_patterns: string[];
  qualitative_notes: string;
}

// Campaign types
export interface Campaign {
  id: string;
  client_id: string;
  client?: Client;
  name: string;
  raw_brief: string;
  parsed_brief: ParsedBrief;
  status: CampaignStatus;
  job_payload: JobPayload;
  pipeline_status: PipelineStatus;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = 'draft' | 'briefing' | 'generating' | 'reviewing' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface ParsedBrief {
  format: ContentFormat[];
  slides?: number;
  procedure_focus: string;
  campaign_objective: string;
  tone: string;
  restrictions: string[];
  platform_targets: Platform[];
  visual_notes?: string;
  seasonal_context?: string;
  reference_campaign?: string;
}

export type ContentFormat = 'carousel' | 'feed_static' | 'reels' | 'stories' | 'copy_only' | 'multi_format';

export interface JobPayload {
  task_name: string;
  task_date: string;
  client_id: string;
  procedure_focus: string;
  campaign_objective: string;
  platform_targets: Platform[];
  tone: string;
  skip_research: boolean;
  skip_image: boolean;
  skip_video: boolean;
  skip_carousel: boolean;
  visual_notes?: string;
  restrictions?: string[];
}

export interface PipelineStatus {
  agents: AgentStatus[];
  overall_progress: number;
  current_phase: string;
}

export interface AgentStatus {
  job_name: string;
  status: 'queued' | 'running' | 'complete' | 'failed' | 'skipped';
  dependencies: string[];
  duration_ms?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
}

// Review types
export interface ReviewRound {
  attempt: number;
  max_attempts: number;
  pieces: ReviewPiece[];
  campaign_score: number;
}

export interface ReviewPiece {
  piece_id: string;
  score: number;
  status: 'aprovado' | 'reprovado' | 'requer_revisao_humana';
  reviewers_passed: string[];
  issues_by_reviewer: Record<string, ReviewIssue[]>;
  responsible_agent?: string;
  correction_summary?: string;
}

export interface ReviewIssue {
  severity: 'bloqueante';
  dimension?: string;
  rule?: string;
  excerpt: string;
  correction_instruction: string;
}

// Research types
export interface ResearchResults {
  procedure_focus: string;
  content_topics: string[];
  marketing_angles: string[];
  keywords: string[];
  ad_hooks: string[];
  video_concepts: string[];
  patient_pain_points: string[];
  trending_formats: string[];
  recommended_hashtags: string[];
  benchmark_patterns: BenchmarkPatterns;
  scheduling_insights: SchedulingInsights;
}

export interface BenchmarkPatterns {
  top_formats: string[];
  reference_hooks: string[];
  tone_patterns: string;
  cta_patterns: string[];
}

export interface SchedulingInsights {
  best_days: string[];
  best_times: string[];
  engagement_patterns: string;
}

// Layout/Creative types
export interface LayoutSpec {
  format: string;
  width: number;
  height: number;
  template: string;
  background: string;
  elements: LayoutElement[];
}

export interface LayoutElement {
  type: 'headline' | 'subtext' | 'image' | 'cta' | 'logo' | 'badge' | 'divider';
  text?: string;
  src?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  animation?: string;
}

// Chat/Brief Parser types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'brief_confirmation' | 'pipeline_status' | 'result_preview';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BriefParserOutput {
  client_id: string;
  raw_brief: string;
  parsed: ParsedBrief;
  inferred_fields: string[];
  ambiguities: string[];
  confirmation_required: boolean;
}

// Scheduling types
export interface ScheduledPost {
  id: string;
  campaign_id: string;
  client_id: string;
  platform: Platform;
  scheduled_at: string;
  media_urls: string[];
  caption: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
}

// Video types
export interface VideoScene {
  type: 'hook' | 'problem' | 'product' | 'benefit' | 'cta';
  text: string;
  visual: string;
  duration: number;
  transition?: string;
  animation?: string;
}

export interface VideoConcept {
  composition: string;
  props: {
    style: string;
    duration: number;
    platform: string;
    client: string;
    procedure: string;
    scenes: VideoScene[];
  };
}
