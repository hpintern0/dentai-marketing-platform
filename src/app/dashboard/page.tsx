'use client';

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
} from 'lucide-react';

const stats = [
  {
    label: 'Total Clientes',
    value: '24',
    change: '+3 este mes',
    icon: Users,
    color: 'bg-dental-blue-100 text-dental-blue-700',
  },
  {
    label: 'Campanhas Ativas',
    value: '8',
    change: '2 em execucao',
    icon: Megaphone,
    color: 'bg-dental-teal-100 text-dental-teal-700',
  },
  {
    label: 'Aguardando Aprovacao',
    value: '5',
    change: '3 urgentes',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    label: 'Publicadas',
    value: '142',
    change: '+18 esta semana',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700',
  },
];

const pipelineCampaigns = [
  {
    id: 1,
    name: 'Implantes Dentarios - Dr. Silva',
    status: 'complete',
    step: 'Finalizado',
    time: '12 min atras',
  },
  {
    id: 2,
    name: 'Clareamento - Clinica Sorriso',
    status: 'running',
    step: 'Gerando criativos...',
    time: 'Em andamento',
  },
  {
    id: 3,
    name: 'Ortodontia - Dra. Mendes',
    status: 'running',
    step: 'Criando copy...',
    time: 'Em andamento',
  },
  {
    id: 4,
    name: 'Facetas - Dr. Oliveira',
    status: 'queued',
    step: 'Na fila',
    time: 'Aguardando',
  },
  {
    id: 5,
    name: 'Protese - Clinica OdontoPlus',
    status: 'failed',
    step: 'Erro na geracao de imagem',
    time: '45 min atras',
  },
];

const pendingApprovals = [
  {
    id: 1,
    title: 'Carrossel: 5 Beneficios do Implante',
    client: 'Dr. Silva',
    type: 'Carrossel',
    created: '2h atras',
  },
  {
    id: 2,
    title: 'Reels: Antes e Depois Clareamento',
    client: 'Clinica Sorriso',
    type: 'Video',
    created: '4h atras',
  },
  {
    id: 3,
    title: 'Post: Dica de Higiene Bucal',
    client: 'Dra. Mendes',
    type: 'Imagem',
    created: '6h atras',
  },
];

const recentActivity = [
  {
    action: 'Campanha publicada',
    detail: 'Limpeza Dental - Dr. Costa publicada no Instagram',
    time: '30 min atras',
    type: 'success',
  },
  {
    action: 'Novo cliente adicionado',
    detail: 'Clinica DentVida cadastrada com sucesso',
    time: '1h atras',
    type: 'info',
  },
  {
    action: 'Aprovacao pendente',
    detail: 'Dr. Silva precisa aprovar 2 criativos',
    time: '2h atras',
    type: 'warning',
  },
  {
    action: 'Analise concluida',
    detail: 'Perfil @dica.odonto analisado com sucesso',
    time: '3h atras',
    type: 'info',
  },
  {
    action: 'Erro no pipeline',
    detail: 'Falha na geracao de imagem para Clinica OdontoPlus',
    time: '4h atras',
    type: 'error',
  },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string; label: string }> = {
  complete: { icon: CheckCircle2, class: 'text-green-600', label: 'Concluido' },
  running: { icon: Loader2, class: 'text-dental-blue animate-spin', label: 'Executando' },
  queued: { icon: Play, class: 'text-gray-400', label: 'Na fila' },
  failed: { icon: XCircle, class: 'text-red-500', label: 'Falhou' },
};

const activityColors: Record<string, string> = {
  success: 'bg-green-500',
  info: 'bg-dental-blue',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visao geral da plataforma de marketing
        </p>
      </div>

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
                <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
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
            <button className="text-sm font-medium text-dental-blue hover:text-dental-blue-700">
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {pipelineCampaigns.map((campaign) => {
              const config = statusConfig[campaign.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={campaign.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  <StatusIcon className={`h-5 w-5 flex-shrink-0 ${config.class}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-gray-500">{campaign.step}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {campaign.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Aguardando Aprovacao
            </h2>
            <span className="badge-warning">{pendingApprovals.length} pendentes</span>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.client} &middot; {item.type} &middot; {item.created}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                      Revisar
                    </button>
                    <button className="rounded-lg bg-dental-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-dental-blue-700 transition-colors">
                      Aprovar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Atividade Recente
          </h2>
          <button className="flex items-center gap-1 text-sm font-medium text-dental-blue hover:text-dental-blue-700">
            Ver historico <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${activityColors[activity.type]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.detail}</p>
              </div>
              <span className="whitespace-nowrap text-xs text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
