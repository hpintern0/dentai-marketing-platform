'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Megaphone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface ClientData {
  id: string;
  name: string;
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  created_at: string;
  clients?: { id: string; name: string };
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string; label: string }> = {
  complete: { icon: CheckCircle2, class: 'text-green-600', label: 'Concluído' },
  generating: { icon: Loader2, class: 'text-hp-purple animate-spin', label: 'Executando' },
  draft: { icon: Play, class: 'text-gray-400', label: 'Rascunho' },
  failed: { icon: XCircle, class: 'text-red-500', label: 'Falhou' },
  reviewing: { icon: Clock, class: 'text-yellow-500', label: 'Em revisão' },
  approved: { icon: CheckCircle2, class: 'text-green-500', label: 'Aprovado' },
  published: { icon: CheckCircle2, class: 'text-green-600', label: 'Publicado' },
  scheduled: { icon: Clock, class: 'text-blue-500', label: 'Agendado' },
  briefing: { icon: Loader2, class: 'text-hp-purple animate-spin', label: 'Briefing' },
};

const activityColors: Record<string, string> = {
  success: 'bg-green-500',
  info: 'bg-hp-purple',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

function getStatusType(status: string): string {
  if (status === 'published' || status === 'approved') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'reviewing') return 'warning';
  return 'info';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsRes, campaignsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/campaigns'),
      ]);

      if (!clientsRes.ok || !campaignsRes.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const clientsData = await clientsRes.json();
      const campaignsJson = await campaignsRes.json();
      const campaignsData = campaignsJson.data ?? campaignsJson;

      setClients(Array.isArray(clientsData) ? clientsData : []);
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeCampaigns = campaigns.filter(
    (c) => c.status === 'generating' || c.status === 'reviewing' || c.status === 'approved' || c.status === 'scheduled',
  );
  const pendingApprovals = campaigns.filter((c) => c.status === 'reviewing');
  const publishedCampaigns = campaigns.filter((c) => c.status === 'published');
  const pipelineCampaigns = campaigns
    .filter((c) => ['generating', 'reviewing', 'approved', 'draft', 'failed'].includes(c.status))
    .slice(0, 5);
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Clientes',
      value: String(clients.length),
      change: '',
      icon: Users,
      color: 'bg-hp-purple-100 text-hp-purple-700',
    },
    {
      label: 'Campanhas Ativas',
      value: String(activeCampaigns.length),
      change: `${campaigns.filter((c) => c.status === 'generating').length} em execução`,
      icon: Megaphone,
      color: 'bg-hp-accent-100 text-hp-accent-700',
    },
    {
      label: 'Aguardando Aprovação',
      value: String(pendingApprovals.length),
      change: '',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Publicadas',
      value: String(publishedCampaigns.length),
      change: '',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral da plataforma de marketing
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 w-40 rounded bg-gray-200 mb-4" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 rounded bg-gray-100 mb-3" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visão geral da plataforma de marketing
            </p>
            {lastUpdated && (
              <p className="mt-0.5 text-xs text-gray-400">
                Atualizado {timeAgo(lastUpdated.toISOString())}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <Link
              href="/nova-campanha"
              className="btn-primary gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Campanha
            </Link>
          </div>
        </div>
      </div>

      {/* Empty state when no campaigns */}
      {campaigns.length === 0 && (
        <div className="card py-12 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Bem-vindo ao HP AUT!
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Comece criando sua primeira campanha de marketing. Nossa IA vai ajudar a gerar conteúdo personalizado para seus clientes.
          </p>
          <Link
            href="/nova-campanha"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Primeira Campanha
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.change && (
                  <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                )}
              </div>
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Status */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Status do Pipeline
            </h2>
            <Link href="/campanhas" className="text-sm font-medium text-hp-purple hover:text-hp-purple-700">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {pipelineCampaigns.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Nenhuma campanha no pipeline.
              </p>
            ) : (
              pipelineCampaigns.map((campaign) => {
                const config = statusConfig[campaign.status] ?? statusConfig.draft;
                const StatusIcon = config.icon;
                return (
                  <Link
                    key={campaign.id}
                    href={`/campanhas/${campaign.id}`}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <StatusIcon className={`h-5 w-5 flex-shrink-0 ${config.class}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {campaign.name}
                        {campaign.clients?.name ? ` - ${campaign.clients.name}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">{config.label}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(campaign.created_at)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Aguardando Aprovação
            </h2>
            <span className="badge-warning">{pendingApprovals.length} pendentes</span>
          </div>
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Nenhuma campanha aguardando aprovação.
              </p>
            ) : (
              pendingApprovals.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.clients?.name ?? 'Cliente'} &middot; {timeAgo(item.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/campanhas/${item.id}`}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Revisar
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Atividade Recente
          </h2>
          <Link
            href="/campanhas"
            className="flex items-center gap-1 text-sm font-medium text-hp-purple hover:text-hp-purple-700"
          >
            Ver histórico <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentCampaigns.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              Nenhuma atividade recente.
            </p>
          ) : (
            recentCampaigns.map((campaign) => {
              const type = getStatusType(campaign.status);
              const config = statusConfig[campaign.status] ?? statusConfig.draft;
              return (
                <Link
                  key={campaign.id}
                  href={`/campanhas/${campaign.id}`}
                  className="flex items-start gap-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                >
                  <div
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${activityColors[type]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {config.label}: {campaign.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {campaign.clients?.name ?? 'Cliente'}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-400">
                    {timeAgo(campaign.created_at)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
