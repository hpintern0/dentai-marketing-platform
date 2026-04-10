'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

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
}

const tabs = [
  { id: 'overview', label: 'Visao Geral', icon: FileCheck },
  { id: 'criativos', label: 'Criativos', icon: Image },
  { id: 'carrossel', label: 'Carrossel', icon: Layers },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'copy', label: 'Copy', icon: Type },
  { id: 'aprovacao', label: 'Aprovacao', icon: Shield },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  complete: { icon: CheckCircle2, class: 'text-green-500' },
  running: { icon: Loader2, class: 'text-dental-blue animate-spin' },
  pending: { icon: Clock, class: 'text-gray-300' },
  queued: { icon: Clock, class: 'text-gray-300' },
  failed: { icon: XCircle, class: 'text-red-500' },
  skipped: { icon: Clock, class: 'text-gray-300' },
};

const campaignStatusBadge: Record<string, { label: string; class: string }> = {
  draft: { label: 'Rascunho', class: 'badge-neutral' },
  briefing: { label: 'Briefing', class: 'badge-info' },
  generating: { label: 'Gerando', class: 'badge-info' },
  reviewing: { label: 'Em revisao', class: 'badge-warning' },
  approved: { label: 'Aprovado', class: 'badge-success' },
  scheduled: { label: 'Agendado', class: 'badge-info' },
  published: { label: 'Publicado', class: 'badge-success' },
  failed: { label: 'Falhou', class: 'badge-error' },
};

const AGENT_LABELS: Record<string, string> = {
  dental_research_agent: 'Pesquisa de tendencias',
  dental_intelligence_agent: 'Inteligencia dental',
  ad_creative_designer: 'Design de criativos',
  carousel_agent: 'Geracao de carrossel',
  video_ad_specialist: 'Criacao de video',
  copywriter_agent: 'Redacao de copy',
  review_orchestrator: 'Orquestracao de review',
  cfo_compliance_reviewer: 'Revisao CFO',
  copy_reviewer: 'Revisao de copy',
  visual_reviewer: 'Revisao visual',
  dental_expert_reviewer: 'Revisao especialista',
  issue_consolidator: 'Consolidacao de issues',
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

  useEffect(() => {
    async function fetchCampaign() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (!res.ok) throw new Error('Campanha nao encontrada');
        const json = await res.json();
        setCampaign(json.data ?? json);
      } catch (err: any) {
        setError(err.message ?? 'Erro ao carregar campanha');
      } finally {
        setLoading(false);
      }
    }
    if (campaignId) fetchCampaign();
  }, [campaignId]);

  const handleApprove = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/approve`, { method: 'POST' });
      if (res.ok) {
        setCampaign((prev) => prev ? { ...prev, status: 'approved' } : prev);
      }
    } catch {
      // silently fail
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/publish`, { method: 'POST' });
      if (res.ok) {
        setCampaign((prev) => prev ? { ...prev, status: 'published' } : prev);
      }
    } catch {
      // silently fail
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
            <p className="text-sm font-medium">{error ?? 'Campanha nao encontrada'}</p>
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
                className="btn-primary gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar
              </button>
            )}
            {campaign.status === 'approved' && (
              <button
                onClick={handlePublish}
                className="btn-primary gap-2 bg-dental-teal hover:bg-dental-teal-700"
              >
                <Send className="h-4 w-4" />
                Publicar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Timeline */}
      {pipelineAgents.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Timeline de Execucao
          </h2>
          <div className="space-y-3">
            {pipelineAgents.map((agent: any, idx: number) => {
              const agentStatus = agent.status ?? 'queued';
              const config = statusConfig[agentStatus] ?? statusConfig.queued;
              const StepIcon = config.icon;
              const label = AGENT_LABELS[agent.job_name] ?? agent.job_name;
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
                    ? 'border-dental-blue text-dental-blue'
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
            Informacoes da Campanha
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
            Resumo de Aprovacao
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
                Esta campanha esta aguardando sua revisao e aprovacao.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="btn-primary gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprovar Campanha
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 py-6">
              Aguardando geracao de conteudo para revisao.
            </p>
          )}
        </div>
      )}

      {['criativos', 'carrossel', 'video', 'copy'].includes(activeTab) && (
        <div className="card">
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              {activeTab === 'criativos' && <Image className="h-8 w-8 text-gray-400" />}
              {activeTab === 'carrossel' && <Layers className="h-8 w-8 text-gray-400" />}
              {activeTab === 'video' && <Video className="h-8 w-8 text-gray-400" />}
              {activeTab === 'copy' && <Type className="h-8 w-8 text-gray-400" />}
            </div>
            <p className="text-sm font-medium text-gray-900">
              {campaign.status === 'generating'
                ? 'Gerando conteudo...'
                : campaign.status === 'draft' || campaign.status === 'briefing'
                ? 'Aguardando geracao...'
                : 'Conteudo gerado'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {campaign.status === 'generating'
                ? 'O pipeline esta processando esta secao. Aguarde.'
                : campaign.status === 'draft' || campaign.status === 'briefing'
                ? 'Inicie o pipeline para gerar o conteudo desta secao.'
                : 'Os arquivos gerados estao disponiveis no armazenamento da campanha.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
