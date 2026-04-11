'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Image,
  Video,
  Type,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Layers,
  FileCheck,
  Shield,
  AlertCircle,
  Film,
} from 'lucide-react';
import Link from 'next/link';
import { VideoPreview } from '@/components/campaign/video-preview';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  created_at: string;
  raw_brief?: string;
  parsed_brief?: any;
  pipeline_status?: any;
  clients?: { id: string; name: string; specialty?: string };
  scheduled_posts?: any[];
  campaign_pieces?: any[];
}

const tabs = [
  { id: 'overview', label: 'Visão Geral', icon: FileCheck },
  { id: 'criativos', label: 'Criativos', icon: Image },
  { id: 'carrossel', label: 'Carrossel', icon: Layers },
  { id: 'video', label: 'Vídeo', icon: Video },
  { id: 'copy', label: 'Copy', icon: Type },
  { id: 'aprovacao', label: 'Aprovação', icon: Shield },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  complete: { icon: CheckCircle2, class: 'text-green-500' },
  running: { icon: Loader2, class: 'text-hp-purple animate-spin' },
  pending: { icon: Clock, class: 'text-gray-300' },
  queued: { icon: Clock, class: 'text-gray-300' },
  failed: { icon: XCircle, class: 'text-red-500' },
  skipped: { icon: Clock, class: 'text-gray-300' },
};

const campaignStatusBadge: Record<string, { label: string; class: string }> = {
  draft: { label: 'Rascunho', class: 'badge-neutral' },
  briefing: { label: 'Briefing', class: 'badge-info' },
  generating: { label: 'Gerando', class: 'badge-info' },
  reviewing: { label: 'Em revisão', class: 'badge-warning' },
  approved: { label: 'Aprovado', class: 'badge-success' },
  scheduled: { label: 'Agendado', class: 'badge-info' },
  published: { label: 'Publicado', class: 'badge-success' },
  failed: { label: 'Falhou', class: 'badge-error' },
};

const AGENT_LABELS: Record<string, string> = {
  dental_research_agent: 'Pesquisa de Tendencias',
  dental_intelligence_agent: 'Inteligencia Dental',
  ad_creative_designer: 'Design de Criativos',
  carousel_agent: 'Geracao de Carrossel',
  video_ad_specialist: 'Geracao de Video',
  copywriter_agent: 'Redacao de Copy',
  review_orchestrator: 'Revisao de Qualidade',
  cfo_compliance_reviewer: 'Revisao CFO',
  copy_reviewer: 'Revisao de Copy',
  visual_reviewer: 'Revisao Visual',
  dental_expert_reviewer: 'Revisao Especialista',
  issue_consolidator: 'Consolidacao de Issues',
  correction_agent: 'Correcoes',
  distribution_agent: 'Distribuicao',
};

export default function CampanhaDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [approving, setApproving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCampaign = useCallback(async (isPolling = false) => {
    if (!isPolling) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (!res.ok) throw new Error('Campanha não encontrada');
      const json = await res.json();
      setCampaign(json.data ?? json);
    } catch (err: any) {
      if (!isPolling) {
        setError(err.message ?? 'Erro ao carregar campanha');
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [campaignId]);

  // Initial fetch
  useEffect(() => {
    if (campaignId) fetchCampaign(false);
  }, [campaignId, fetchCampaign]);

  // Auto-poll every 5s while status is "generating"
  useEffect(() => {
    if (!campaign || campaign.status !== 'generating') return;

    const interval = setInterval(() => {
      fetchCampaign(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [campaign?.status, fetchCampaign]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/approve`, { method: 'POST' });
      if (res.ok) {
        setCampaign((prev) => prev ? { ...prev, status: 'approved' } : prev);
        setToast({ message: 'Campanha aprovada com sucesso!', type: 'success' });
      } else {
        setToast({ message: 'Erro ao aprovar campanha. Tente novamente.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Erro ao aprovar campanha. Tente novamente.', type: 'error' });
    } finally {
      setApproving(false);
    }
  };

  const handlePublish = async () => {
    setShowPublishConfirm(false);
    setPublishing(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/publish`, { method: 'POST' });
      if (res.ok) {
        setCampaign((prev) => prev ? { ...prev, status: 'published' } : prev);
        setToast({ message: 'Campanha publicada com sucesso!', type: 'success' });
      } else {
        setToast({ message: 'Erro ao publicar campanha. Tente novamente.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Erro ao publicar campanha. Tente novamente.', type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/campanhas"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Campanhas
          </Link>
        </div>
        <div className="card animate-pulse">
          <div className="h-6 w-64 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-40 rounded bg-gray-200" />
        </div>
        <div className="card animate-pulse">
          <div className="h-5 w-48 rounded bg-gray-200 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="h-5 w-5 rounded-full bg-gray-200" />
              <div className="h-4 w-40 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/campanhas"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Campanhas
          </Link>
        </div>
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error ?? 'Campanha não encontrada'}</p>
          </div>
        </div>
      </div>
    );
  }

  const badge = campaignStatusBadge[campaign.status] ?? campaignStatusBadge.draft;
  const pipelineAgents: any[] = campaign.pipeline_status?.agents ?? [];
  const parsedBrief = campaign.parsed_brief;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Publish Confirmation Dialog */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirmar publicação</h2>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja publicar esta campanha? Esta ação distribuirá o conteúdo para as plataformas configuradas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                className="btn-primary flex-1 gap-2 bg-hp-accent hover:bg-hp-accent-700"
              >
                <Send className="h-4 w-4" />
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back + Header */}
      <div>
        <Link
          href="/campanhas"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Campanhas
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {campaign.name}
              </h1>
              <span className={badge.class}>{badge.label}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {campaign.clients?.name ?? 'Cliente'} &middot; Criada em{' '}
              {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            {campaign.status === 'reviewing' && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="btn-primary gap-2"
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {approving ? 'Aprovando...' : 'Aprovar'}
              </button>
            )}
            {campaign.status === 'approved' && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                disabled={publishing}
                className="btn-primary gap-2 bg-hp-accent hover:bg-hp-accent-700"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {publishing ? 'Publicando...' : 'Publicar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Timeline */}
      {pipelineAgents.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Timeline de Execução
          </h2>
          <div className="space-y-3">
            {pipelineAgents.map((agent: any, idx: number) => {
              const agentStatus = agent.status ?? 'queued';
              const config = statusConfig[agentStatus] ?? statusConfig.queued;
              const StepIcon = config.icon;
              const agentKey = agent.agent || agent.job_name || '';
              const label = AGENT_LABELS[agentKey] ?? agentKey;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="relative flex flex-col items-center">
                    <StepIcon className={`h-5 w-5 ${config.class}`} />
                    {idx < pipelineAgents.length - 1 && (
                      <div
                        className={`mt-1 h-8 w-px ${
                          agentStatus === 'complete'
                            ? 'bg-green-300'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {label}
                      </p>
                      {agent.duration_ms != null && (
                        <span className="text-xs text-gray-400">
                          {(agent.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    {agent.notes && (
                      <p className="text-xs text-gray-500">{agent.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brief info if no pipeline data */}
      {pipelineAgents.length === 0 && parsedBrief && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Brief</h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {parsedBrief.procedure_focus && (
              <div>
                <span className="font-medium text-gray-700">Procedimento:</span>{' '}
                <span className="text-gray-600">{parsedBrief.procedure_focus}</span>
              </div>
            )}
            {parsedBrief.campaign_objective && (
              <div>
                <span className="font-medium text-gray-700">Objetivo:</span>{' '}
                <span className="text-gray-600">{parsedBrief.campaign_objective}</span>
              </div>
            )}
            {parsedBrief.tone && (
              <div>
                <span className="font-medium text-gray-700">Tom:</span>{' '}
                <span className="text-gray-600">{parsedBrief.tone}</span>
              </div>
            )}
            {parsedBrief.format && (
              <div>
                <span className="font-medium text-gray-700">Formatos:</span>{' '}
                <span className="text-gray-600">
                  {Array.isArray(parsedBrief.format) ? parsedBrief.format.join(', ') : parsedBrief.format}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-hp-purple text-hp-purple'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Informações da Campanha
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Status:</span>{' '}
              <span className={badge.class}>{badge.label}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cliente:</span>{' '}
              <span className="text-gray-600">{campaign.clients?.name ?? '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Criada em:</span>{' '}
              <span className="text-gray-600">{new Date(campaign.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {campaign.raw_brief && (
              <div>
                <span className="font-medium text-gray-700">Brief:</span>{' '}
                <p className="mt-1 text-gray-600 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100">
                  {campaign.raw_brief}
                </p>
              </div>
            )}
            {campaign.scheduled_posts && campaign.scheduled_posts.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Posts Agendados:</span>{' '}
                <span className="text-gray-600">{campaign.scheduled_posts.length} posts</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'aprovacao' && (
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Resumo de Aprovação
          </h3>
          {campaign.status === 'approved' || campaign.status === 'published' ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-2 text-sm font-medium text-green-800">
                Campanha {campaign.status === 'published' ? 'publicada' : 'aprovada'}!
              </p>
            </div>
          ) : campaign.status === 'reviewing' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Esta campanha está aguardando sua revisão e aprovação.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="btn-primary gap-2"
                >
                  {approving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {approving ? 'Aprovando...' : 'Aprovar Campanha'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 py-6">
              Aguardando geração de conteúdo para revisão.
            </p>
          )}
        </div>
      )}

      {/* Criativos / Carrossel Tab — show actual images */}
      {(activeTab === 'criativos' || activeTab === 'carrossel') && (
        <div className="card">
          {(() => {
            const isCarrossel = activeTab === 'carrossel';
            const CREATIVE_TYPES = isCarrossel
              ? ['carousel_slide']
              : ['instagram_ad', 'carousel_slide', 'creative', 'static_image'];
            const slides = (campaign.campaign_pieces || [])
              .filter((p: any) => CREATIVE_TYPES.includes(p.piece_type))
              .sort((a: any, b: any) => (a.piece_index || 0) - (b.piece_index || 0));

            // Fallback: if carrossel tab has no slides, try to extract slide data from copy_manifest
            let manifestSlides: any[] = [];
            if (isCarrossel && slides.length === 0) {
              const manifest = (campaign.campaign_pieces || []).find((p: any) => p.piece_type === 'copy_manifest');
              if (manifest) {
                const content = typeof manifest.content === 'string'
                  ? (() => { try { return JSON.parse(manifest.content); } catch { return null; } })()
                  : manifest.content;
                if (content?.slides && Array.isArray(content.slides)) {
                  manifestSlides = content.slides;
                } else if (content?.carousel_slides && Array.isArray(content.carousel_slides)) {
                  manifestSlides = content.carousel_slides;
                }
              }
            }

            if (slides.length === 0 && manifestSlides.length === 0) {
              return (
                <div className="py-12 text-center">
                  <Layers className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">
                    {campaign.status === 'generating'
                      ? 'Gerando criativos...'
                      : isCarrossel
                      ? 'Os slides foram gerados. Faca download dos arquivos HTML para visualizar.'
                      : 'Nenhum criativo gerado ainda.'}
                  </p>
                </div>
              );
            }

            // If we only have manifest slides (no actual pieces), show them as cards
            if (slides.length === 0 && manifestSlides.length > 0) {
              return (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Slides do Carrossel ({manifestSlides.length})
                  </h3>
                  <p className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Renderizacao visual nao disponivel neste ambiente. Exibindo estrutura dos slides.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {manifestSlides.map((slide: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-hp-purple text-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {slide.title || slide.headline || `Slide ${idx + 1}`}
                          </span>
                        </div>
                        {(slide.text || slide.body || slide.description) && (
                          <p className="text-sm text-gray-600 mt-1">{slide.text || slide.body || slide.description}</p>
                        )}
                        {slide.cta && (
                          <span className="mt-2 inline-block rounded-full bg-hp-purple/10 px-2 py-0.5 text-xs font-medium text-hp-purple">
                            CTA: {slide.cta}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {isCarrossel ? 'Slides do Carrossel' : 'Criativos'} ({slides.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slides.map((piece: any, idx: number) => (
                    <div key={piece.id} className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                      {piece.media_url ? (
                        <img
                          src={piece.media_url}
                          alt={piece.content?.title || `Slide ${idx + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                      ) : piece.content?.html ? (
                        <div
                          className="w-full aspect-square overflow-auto bg-white p-2"
                          dangerouslySetInnerHTML={{ __html: piece.content.html }}
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                          <Image className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-500 font-medium">Criativo gerado</p>
                          <p className="text-[10px] text-gray-400 mt-1">Renderizacao visual disponivel via download</p>
                          {piece.content?.title && (
                            <p className="text-sm text-gray-700 font-medium mt-2">{piece.content.title}</p>
                          )}
                          {piece.content?.description && (
                            <p className="text-xs text-gray-500 mt-1">{piece.content.description}</p>
                          )}
                        </div>
                      )}
                      <div className={`${piece.media_url ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent' : 'bg-gray-100 border-t border-gray-200'} p-4`}>
                        <p className={`text-sm font-medium ${piece.media_url ? 'text-white' : 'text-gray-900'}`}>
                          {piece.content?.title || `Slide ${idx + 1}`}
                        </p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          piece.media_url ? 'bg-green-500/90 text-white' : 'bg-green-100 text-green-700'
                        }`}>
                          {piece.approval_status === 'approved' ? 'Aprovado' : piece.approval_status}
                        </span>
                      </div>
                      {piece.media_url && (
                        <a
                          href={piece.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white"
                        >
                          Abrir
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Copy Tab — show captions */}
      {activeTab === 'copy' && (
        <div className="card">
          {(() => {
            const COPY_TYPES = ['instagram_caption', 'stories_copy', 'whatsapp_cta', 'copy_manifest'];
            const COPY_LABELS: Record<string, string> = {
              instagram_caption: 'Instagram Caption',
              stories_copy: 'Stories Copy',
              whatsapp_cta: 'WhatsApp CTA',
              copy_manifest: 'Copy Completa',
            };
            const copies = (campaign.campaign_pieces || [])
              .filter((p: any) => COPY_TYPES.includes(p.piece_type));
            if (copies.length === 0) {
              return (
                <div className="py-12 text-center">
                  <Type className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Nenhuma copy gerada ainda.</p>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Copy ({copies.length})</h3>
                {copies.map((piece: any) => (
                  <div key={piece.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {COPY_LABELS[piece.piece_type] ?? piece.piece_type}
                      </span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                        {piece.approval_status === 'approved' ? 'Aprovado' : piece.approval_status}
                      </span>
                    </div>
                    {piece.piece_type === 'copy_manifest' ? (
                      <div className="space-y-3">
                        {(() => {
                          const manifest = typeof piece.content === 'string' ? (() => { try { return JSON.parse(piece.content); } catch { return null; } })() : piece.content;
                          if (!manifest || typeof manifest !== 'object') {
                            return <p className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(piece.content, null, 2)}</p>;
                          }
                          const sections: { label: string; value: string }[] = [];
                          if (manifest.campaign_angle) sections.push({ label: 'Angulo da Campanha', value: manifest.campaign_angle });
                          if (manifest.instagram_caption) sections.push({ label: 'Instagram Caption', value: manifest.instagram_caption });
                          if (manifest.stories_copy) sections.push({ label: 'Stories Copy', value: manifest.stories_copy });
                          if (manifest.whatsapp_cta) sections.push({ label: 'WhatsApp CTA', value: manifest.whatsapp_cta });
                          if (manifest.headline) sections.push({ label: 'Headline', value: manifest.headline });
                          if (manifest.subheadline) sections.push({ label: 'Subheadline', value: manifest.subheadline });
                          if (manifest.cta) sections.push({ label: 'CTA', value: manifest.cta });
                          // fallback: show all remaining top-level string keys
                          if (sections.length === 0) {
                            Object.entries(manifest).forEach(([k, v]) => {
                              if (typeof v === 'string') sections.push({ label: k, value: v as string });
                            });
                          }
                          if (sections.length === 0) {
                            return <p className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(manifest, null, 2)}</p>;
                          }
                          return sections.map((s, i) => (
                            <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                              <span className="text-xs font-semibold text-hp-purple uppercase">{s.label}</span>
                              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.value}</p>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {piece.content?.text ?? piece.content?.caption ?? piece.content?.body ?? (typeof piece.content === 'string' ? piece.content : JSON.stringify(piece.content, null, 2))}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        const textToCopy = piece.content?.text ?? piece.content?.caption ?? piece.content?.body ?? (typeof piece.content === 'string' ? piece.content : JSON.stringify(piece.content, null, 2));
                        navigator.clipboard.writeText(textToCopy);
                      }}
                      className="mt-3 text-xs text-hp-purple hover:text-hp-purple-700 font-medium"
                    >
                      Copiar texto
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Video Tab */}
      {activeTab === 'video' && (
        <div className="card">
          {(() => {
            const VIDEO_TYPES = ['video', 'video_concept', 'video_script', 'video_ad'];
            const videos = (campaign.campaign_pieces || []).filter((p: any) => VIDEO_TYPES.includes(p.piece_type));
            if (videos.length === 0) {
              return (
                <div className="py-12 text-center">
                  <Video className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">
                    {campaign.status === 'generating' ? 'Gerando vídeo...' : 'Nenhum vídeo gerado nesta campanha.'}
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Vídeos ({videos.length})</h3>
                {videos.map((v: any) => {
                  const scenes: any[] = v.content?.scenes || v.content?.script?.scenes || [];
                  const hasVideo = !!v.media_url;

                  return (
                    <div key={v.id} className="rounded-xl border border-gray-200 overflow-hidden">
                      {hasVideo ? (
                        <>
                          <video
                            src={v.media_url}
                            controls
                            className="w-full max-h-[600px] bg-black"
                            poster=""
                          />
                          <div className="p-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{v.content?.title || 'Vídeo'}</span>
                            <a
                              href={v.media_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-hp-purple hover:text-hp-purple-700"
                            >
                              Download
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Film className="h-5 w-5 text-hp-purple" />
                            <span className="text-sm font-semibold text-gray-900">
                              {v.content?.title || 'Conceito do Vídeo'}
                            </span>
                            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              Sem MP4 - Preview do roteiro
                            </span>
                          </div>
                          {v.content?.hook && (
                            <p className="text-sm text-gray-600 italic border-l-2 border-hp-purple pl-3">
                              Hook: &ldquo;{v.content.hook}&rdquo;
                            </p>
                          )}
                          <VideoPreview
                            scenes={v.content?.props?.scenes || v.content?.scenes || v.content?.script?.scenes || []}
                            clientName={campaign.clients?.name}
                            procedure={campaign.parsed_brief?.procedure_focus}
                            primaryColor="#1A2744"
                            accentColor="#C9A84C"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
