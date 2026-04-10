'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Clock,
  FileText,
  Image,
  Video,
  Type,
  Instagram,
  AlertCircle,
  X,
} from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { usePipelineStatus } from '@/hooks/use-pipeline-status';
import Link from 'next/link';

interface ClientOption {
  id: string;
  name: string;
  specialty: string;
  city: string;
  state: string;
  instagram_handle: string;
  tone: string;
}

const suggestionChips = [
  'Criar campanha de implantes para Instagram',
  'Campanha de clareamento com antes/depois',
  'Serie educativa sobre higiene bucal',
  'Lancamento de novo procedimento',
];

const AGENT_LABELS: Record<string, { label: string; icon: typeof FileText }> = {
  dental_research_agent: { label: 'Pesquisa de tendências', icon: FileText },
  dental_intelligence_agent: { label: 'Inteligência dental', icon: FileText },
  ad_creative_designer: { label: 'Design de criativos', icon: Image },
  carousel_agent: { label: 'Geração de carrossel', icon: Image },
  video_ad_specialist: { label: 'Criação de vídeo', icon: Video },
  copywriter_agent: { label: 'Redação de copy', icon: Type },
  review_orchestrator: { label: 'Orquestração de review', icon: FileText },
  cfo_compliance_reviewer: { label: 'Revisão CFO', icon: FileText },
  copy_reviewer: { label: 'Revisão de copy', icon: Type },
  visual_reviewer: { label: 'Revisão visual', icon: Image },
  dental_expert_reviewer: { label: 'Revisão especialista', icon: FileText },
  issue_consolidator: { label: 'Consolidação de issues', icon: FileText },
  correction_agent: { label: 'Correções', icon: FileText },
  distribution_agent: { label: 'Distribuição', icon: Instagram },
};

export default function NovaCampanhaPage() {
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsList, setClientsList] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading: chatLoading,
    currentBrief,
    campaignId,
    sendMessage,
    confirmBrief,
    cancelBrief,
  } = useChat(selectedClientId);

  const pipelineStatus = usePipelineStatus(campaignId);

  const client = clientsList.find((c) => c.id === selectedClientId);

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      setClientsLoading(true);
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClientsList(Array.isArray(data) ? data : []);
        }
      } catch {
        // silently fail
      } finally {
        setClientsLoading(false);
      }
    }
    fetchClients();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleChip = (chip: string) => {
    sendMessage(chip);
  };

  const pipelineActive = campaignId !== null;
  const pipelineComplete = pipelineStatus.is_complete;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Campanha</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crie campanhas de marketing conversando com a IA
        </p>
      </div>

      {/* Client Selector */}
      <div className="card !p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione o Cliente
        </label>
        <div className="relative">
          {clientsLoading ? (
            <div className="flex items-center gap-2 py-2.5 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando clientes...
            </div>
          ) : (
            <>
              <select
                value={selectedClientId ?? ''}
                onChange={(e) =>
                  setSelectedClientId(e.target.value || null)
                }
                className="w-full appearance-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
              >
                <option value="">Selecione um cliente...</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.specialty}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </>
          )}
        </div>

        {/* Client Summary Card */}
        {client && (
          <div className="mt-3 rounded-lg border border-hp-purple-100 bg-hp-purple-50/50 p-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Especialidade:</span>{' '}
                <span className="text-gray-600">{client.specialty}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cidade:</span>{' '}
                <span className="text-gray-600">{client.city}{client.state ? `, ${client.state}` : ''}</span>
              </div>
              {client.instagram_handle && (
                <div>
                  <span className="font-medium text-gray-700">Instagram:</span>{' '}
                  <span className="text-hp-purple">{client.instagram_handle}</span>
                </div>
              )}
              {client.tone && (
                <div>
                  <span className="font-medium text-gray-700">Tom:</span>{' '}
                  <span className="text-gray-600">{client.tone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Brief Confirmation Card */}
      {currentBrief && (
        <div className="card border-hp-accent-200 bg-hp-accent-50/30">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-hp-accent" />
              <h3 className="font-semibold text-gray-900">Confirmar Brief</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-gray-700">Procedimento:</span>{' '}
              <span className="text-gray-600">{currentBrief.parsed.procedure_focus}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Objetivo:</span>{' '}
              <span className="text-gray-600">{currentBrief.parsed.campaign_objective}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tom:</span>{' '}
              <span className="text-gray-600">{currentBrief.parsed.tone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Plataformas:</span>{' '}
              <span className="text-gray-600">
                {currentBrief.parsed.platform_targets.join(', ')}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700">Formatos:</span>{' '}
              <span className="text-gray-600">
                {currentBrief.parsed.format.join(', ')}
              </span>
            </div>
            {currentBrief.parsed.restrictions.length > 0 && (
              <div className="sm:col-span-2">
                <span className="font-medium text-gray-700">Restrições:</span>{' '}
                <span className="text-gray-600">
                  {currentBrief.parsed.restrictions.join(', ')}
                </span>
              </div>
            )}
          </div>
          {currentBrief.ambiguities.length > 0 && (
            <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs font-medium text-yellow-800">Ambiguidades detectadas:</p>
              <ul className="mt-1 space-y-1">
                {currentBrief.ambiguities.map((a, i) => (
                  <li key={i} className="text-xs text-yellow-700">&bull; {a}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button
              onClick={cancelBrief}
              className="btn-secondary flex-1"
              disabled={chatLoading}
            >
              Cancelar
            </button>
            <button
              onClick={confirmBrief}
              className="btn-primary flex-1 gap-2"
              disabled={chatLoading}
            >
              {chatLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirmar e Iniciar Pipeline
            </button>
          </div>
        </div>
      )}

      {/* Pipeline Status */}
      {pipelineActive && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Pipeline de Geração
            </h3>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-hp-purple transition-all duration-500"
                  style={{ width: `${pipelineStatus.overall_progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{pipelineStatus.overall_progress}%</span>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pipelineStatus.agents.map((agent) => {
              const label = AGENT_LABELS[agent.job_name]?.label ?? agent.job_name;
              const AgentIcon = AGENT_LABELS[agent.job_name]?.icon ?? FileText;
              const isDone = agent.status === 'complete';
              const isRunning = agent.status === 'running';
              const isFailed = agent.status === 'failed';
              const isSkipped = agent.status === 'skipped';

              return (
                <div
                  key={agent.job_name}
                  className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                    isDone
                      ? 'border-green-100 bg-green-50/50'
                      : isRunning
                      ? 'border-hp-purple-100 bg-hp-purple-50/50'
                      : isFailed
                      ? 'border-red-100 bg-red-50/50'
                      : 'border-gray-100'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                      isDone
                        ? 'bg-green-100 text-green-600'
                        : isRunning
                        ? 'bg-hp-purple-100 text-hp-purple'
                        : isFailed
                        ? 'bg-red-100 text-red-500'
                        : isSkipped
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : isRunning ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isFailed ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <AgentIcon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium ${
                        isDone
                          ? 'text-green-700'
                          : isRunning
                          ? 'text-hp-purple'
                          : isFailed
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </p>
                    {agent.notes && (
                      <p className="text-[10px] text-gray-500 truncate">{agent.notes}</p>
                    )}
                  </div>
                  {agent.duration_ms != null && (
                    <span className="text-[10px] text-gray-400">
                      {(agent.duration_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                  {isFailed && (
                    <button
                      onClick={() => pipelineStatus.retry(agent.job_name)}
                      className="rounded border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-600 hover:bg-red-50"
                    >
                      Retry
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {pipelineStatus.has_errors && (
            <p className="mt-3 text-xs text-red-500">
              Pipeline encontrou erros. Tente novamente os agentes com falha.
            </p>
          )}
        </div>
      )}

      {/* Results Preview */}
      {pipelineComplete && campaignId && (
        <div className="card border-green-200 bg-green-50/30">
          <h3 className="mb-3 font-semibold text-gray-900">
            Conteúdo Gerado
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            O pipeline foi concluído com sucesso. Veja a campanha completa para revisar e aprovar o conteúdo gerado.
          </p>
          <div className="flex justify-end">
            <Link href={`/campanhas/${campaignId}`} className="btn-primary">
              Ver Campanha Completa
            </Link>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="card flex flex-col !p-0" style={{ height: '480px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-hp-purple-100 text-hp-purple-700">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[75%] rounded-xl px-4 py-3 text-sm bg-gray-100 text-gray-800">
                <p>
                  Olá! Sou o assistente de criação de campanhas da HP Odonto. Selecione um cliente acima e me diga que tipo de campanha você gostaria de criar. Posso ajudar com posts, carrosséis, reels e muito mais!
                </p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'user'
                    ? 'bg-gray-200 text-gray-600'
                    : msg.role === 'system'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-hp-purple-100 text-hp-purple-700'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-hp-purple text-white'
                    : msg.role === 'system'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-hp-purple-100 text-hp-purple-700">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-xl px-4 py-3 bg-gray-100">
                <Loader2 className="h-4 w-4 animate-spin text-hp-purple" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 0 && selectedClientId && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className="rounded-full border border-hp-purple-200 bg-hp-purple-50 px-3 py-1.5 text-xs font-medium text-hp-purple-700 hover:bg-hp-purple-100 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={
                !selectedClientId
                  ? 'Selecione um cliente primeiro...'
                  : 'Descreva a campanha que deseja criar...'
              }
              disabled={!selectedClientId || chatLoading}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!selectedClientId || chatLoading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-hp-purple text-white hover:bg-hp-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
