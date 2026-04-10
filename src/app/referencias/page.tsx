'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Hash,
  TrendingUp,
  MessageSquare,
  Palette,
  Calendar,
  Target,
  Loader2,
  AlertCircle,
  User,
  Eye,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  CheckCircle,
  Video,
  FileText,
} from 'lucide-react';

interface ReferenceProfile {
  id: string;
  instagram_handle: string;
  specialty: string;
  category: string;
  notes?: string;
  client_id?: string;
  analysis_status: string;
  last_analyzed_at?: string;
  insights?: {
    profile_summary?: string;
    specialty_focus?: string;
    target_audience?: string;
    tone_of_voice?: string;
    content_strategy?: {
      primary_content_types?: string[];
      posting_frequency?: string;
      content_pillars?: string[];
    };
    top_formats?: string[];
    recurring_themes?: string[];
    high_performance_hooks?: string[];
    predominant_tone?: string;
    posting_frequency?: string;
    hashtag_usage?: string[];
    cta_patterns?: string[];
    qualitative_notes?: string;
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    recommendations?: string[];
    video_strategy?: string | { [key: string]: any };
  };
  clients?: { id: string; name: string };
}

const statusBadge: Record<string, { label: string; class: string }> = {
  analisado: { label: 'Analisado', class: 'badge-success' },
  pendente: { label: 'Pendente', class: 'badge-neutral' },
  processing: { label: 'Analisando...', class: 'badge-info' },
  analisando: { label: 'Analisando...', class: 'badge-info' },
  erro: { label: 'Erro', class: 'badge-error' },
};

export default function ReferenciasPage() {
  const [references, setReferences] = useState<ReferenceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState('Todas');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  // Form state for add modal
  const [formHandle, setFormHandle] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchReferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterSpecialty !== 'Todas') params.set('specialty', filterSpecialty);
      if (filterCategory !== 'Todas') params.set('category', filterCategory);

      const res = await fetch(`/api/references?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar referências');
      const json = await res.json();
      setReferences(Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []);
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, [filterSpecialty, filterCategory]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Fetch clients for the add modal
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(Array.isArray(data) ? data.map((c: any) => ({ id: c.id, name: c.name })) : []);
        }
      } catch {
        // silently fail
      }
    }
    fetchClients();
  }, []);

  const specialties = ['Todas', ...Array.from(new Set(references.map((p) => p.specialty).filter(Boolean)))];
  const categories = ['Todas', ...Array.from(new Set(references.map((p) => p.category).filter(Boolean)))];

  const filtered = references.filter((p) => {
    const matchSearch =
      p.instagram_handle.toLowerCase().includes(search.toLowerCase()) ||
      (p.clients?.name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleAnalyze = async (id: string) => {
    try {
      await fetch(`/api/references/${id}/analyze`, { method: 'POST' });
      // Optimistically update status
      setReferences((prev) =>
        prev.map((r) => (r.id === id ? { ...r, analysis_status: 'analisando' } : r)),
      );
    } catch {
      // silently fail
    }
  };

  const handleAddReference = async () => {
    if (!formHandle.trim()) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagram_handle: formHandle,
          specialty: formSpecialty || undefined,
          category: formCategory || undefined,
          client_id: formClientId || undefined,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormHandle('');
        setFormSpecialty('');
        setFormCategory('');
        setFormClientId('');
        fetchReferences();
      }
    } catch {
      // silently fail
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && references.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfis de Referência</h1>
          <p className="mt-1 text-sm text-gray-500">Carregando...</p>
        </div>
        <div className="card animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfis de Referência</h1>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Perfis de Referência
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Analise perfis de referência para gerar conteúdo inspirado
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Perfil
        </button>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por handle ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
            />
          </div>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
          >
            {specialties.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Handle
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
                Especialidade
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
                Categoria
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
                Última Análise
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-500">
                  Nenhum perfil de referência encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((profile) => {
                const isExpanded = expandedId === profile.id;
                const badge = statusBadge[profile.analysis_status] ?? statusBadge.pendente;
                return (
                  <tr key={profile.id} className="group">
                    <td colSpan={7} className="p-0">
                      <div>
                        <div
                          className="flex cursor-pointer items-center hover:bg-gray-50 transition-colors"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : profile.id)
                          }
                        >
                          <td className="px-6 py-4 text-sm font-medium text-hp-purple">
                            {profile.instagram_handle}
                          </td>
                          <td className="hidden px-6 py-4 text-sm text-gray-600 md:table-cell">
                            {profile.specialty || '-'}
                          </td>
                          <td className="hidden px-6 py-4 text-sm text-gray-600 lg:table-cell">
                            {profile.category || '-'}
                          </td>
                          <td className="hidden px-6 py-4 text-sm text-gray-600 sm:table-cell">
                            {profile.clients?.name ?? '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={badge.class}>{badge.label}</span>
                          </td>
                          <td className="hidden px-6 py-4 text-sm text-gray-500 lg:table-cell">
                            {profile.last_analyzed_at
                              ? new Date(profile.last_analyzed_at).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyze(profile.id);
                                }}
                                disabled={profile.analysis_status === 'processing' || profile.analysis_status === 'analisando'}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 inline mr-1 ${(profile.analysis_status === 'processing' || profile.analysis_status === 'analisando') ? 'animate-spin' : ''}`} />
                                Analisar agora
                              </button>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </td>
                        </div>

                        {/* Expanded Insights Panel */}
                        {isExpanded && profile.insights && (
                          <div className="border-t border-gray-100 bg-gradient-to-b from-hp-purple-50/30 to-white px-6 py-5 space-y-6">
                            {/* Summary Section */}
                            {(profile.insights.profile_summary || profile.insights.specialty_focus || profile.insights.target_audience || profile.insights.tone_of_voice) && (
                              <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Resumo do Perfil</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  {profile.insights.profile_summary && (
                                    <InsightText icon={User} title="Resumo" text={profile.insights.profile_summary} className="md:col-span-2" />
                                  )}
                                  {profile.insights.specialty_focus && (
                                    <InsightText icon={Target} title="Foco de Especialidade" text={profile.insights.specialty_focus} />
                                  )}
                                  {profile.insights.target_audience && (
                                    <InsightText icon={Eye} title="Público-Alvo" text={profile.insights.target_audience} />
                                  )}
                                  {(profile.insights.tone_of_voice || profile.insights.predominant_tone) && (
                                    <InsightText icon={Palette} title="Tom de Voz" text={profile.insights.tone_of_voice || profile.insights.predominant_tone || ''} />
                                  )}
                                  {profile.insights.posting_frequency && (
                                    <InsightText icon={Calendar} title="Frequência" text={
                                      profile.insights.content_strategy?.posting_frequency || profile.insights.posting_frequency || ''
                                    } />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Content Strategy Section */}
                            {profile.insights.content_strategy && (
                              <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Estratégia de Conteúdo</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                  {profile.insights.content_strategy.primary_content_types && profile.insights.content_strategy.primary_content_types.length > 0 && (
                                    <InsightCard icon={FileText} title="Tipos de Conteúdo" items={profile.insights.content_strategy.primary_content_types} />
                                  )}
                                  {profile.insights.content_strategy.content_pillars && profile.insights.content_strategy.content_pillars.length > 0 && (
                                    <InsightCard icon={Zap} title="Pilares de Conteúdo" items={profile.insights.content_strategy.content_pillars} />
                                  )}
                                  {profile.insights.content_strategy.posting_frequency && (
                                    <InsightText icon={Calendar} title="Frequência de Postagem" text={profile.insights.content_strategy.posting_frequency} />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Formats & Themes */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {profile.insights.top_formats && profile.insights.top_formats.length > 0 && (
                                <InsightCard icon={Palette} title="Top Formatos" items={profile.insights.top_formats} />
                              )}
                              {profile.insights.recurring_themes && profile.insights.recurring_themes.length > 0 && (
                                <InsightCard icon={TrendingUp} title="Temas Recorrentes" items={profile.insights.recurring_themes} />
                              )}
                              {profile.insights.high_performance_hooks && profile.insights.high_performance_hooks.length > 0 && (
                                <InsightCard icon={MessageSquare} title="Hooks de Alta Performance" items={profile.insights.high_performance_hooks} />
                              )}
                              {profile.insights.hashtag_usage && profile.insights.hashtag_usage.length > 0 && (
                                <InsightCard icon={Hash} title="Hashtags" items={profile.insights.hashtag_usage} />
                              )}
                              {profile.insights.cta_patterns && profile.insights.cta_patterns.length > 0 && (
                                <InsightCard icon={Target} title="Padrões de CTA" items={profile.insights.cta_patterns} />
                              )}
                            </div>

                            {/* SWOT-like Section */}
                            {(profile.insights.strengths || profile.insights.weaknesses || profile.insights.opportunities || profile.insights.recommendations) && (
                              <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Análise Estratégica</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  {profile.insights.strengths && profile.insights.strengths.length > 0 && (
                                    <InsightCard icon={ThumbsUp} title="Pontos Fortes" items={profile.insights.strengths} />
                                  )}
                                  {profile.insights.weaknesses && profile.insights.weaknesses.length > 0 && (
                                    <InsightCard icon={ThumbsDown} title="Pontos Fracos" items={profile.insights.weaknesses} />
                                  )}
                                  {profile.insights.opportunities && profile.insights.opportunities.length > 0 && (
                                    <InsightCard icon={Lightbulb} title="Oportunidades" items={profile.insights.opportunities} />
                                  )}
                                  {profile.insights.recommendations && profile.insights.recommendations.length > 0 && (
                                    <InsightCard icon={CheckCircle} title="Recomendações" items={profile.insights.recommendations} />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Video Strategy */}
                            {profile.insights.video_strategy && (
                              <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Estratégia de Vídeo</h3>
                                {typeof profile.insights.video_strategy === 'string' ? (
                                  <InsightText icon={Video} title="Video" text={profile.insights.video_strategy} />
                                ) : (
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(profile.insights.video_strategy).map(([key, value]) => {
                                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                      if (Array.isArray(value)) {
                                        return <InsightCard key={key} icon={Video} title={label} items={value.map(String)} />;
                                      }
                                      return <InsightText key={key} icon={Video} title={label} text={String(value)} />;
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Qualitative Notes */}
                            {profile.insights.qualitative_notes && (
                              <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Notas Qualitativas</p>
                                <p className="text-sm text-gray-600">{profile.insights.qualitative_notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {isExpanded && !profile.insights && (
                          <div className="border-t border-gray-100 px-6 py-8 text-center">
                            <p className="text-sm text-gray-500">
                              {(profile.analysis_status === 'processing' || profile.analysis_status === 'analisando')
                                ? 'Análise em andamento...'
                                : 'Nenhuma análise disponível. Clique em "Analisar agora" para iniciar.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Adicionar Perfil de Referencia
              </h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Handle do Instagram *
                </label>
                <input
                  type="text"
                  placeholder="@perfil"
                  value={formHandle}
                  onChange={(e) => setFormHandle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidade
                </label>
                <select
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
                >
                  <option value="">Selecione...</option>
                  <option value="estetica">Odontologia Estética</option>
                  <option value="ortodontia">Ortodontia</option>
                  <option value="implantodontia">Implantodontia</option>
                  <option value="clinica_geral">Clínica Geral</option>
                  <option value="harmonizacao">Harmonização</option>
                  <option value="periodontia">Periodontia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
                >
                  <option value="">Selecione...</option>
                  <option value="benchmark_nacional">Benchmark Nacional</option>
                  <option value="benchmark_regional">Benchmark Regional</option>
                  <option value="concorrente_direto">Concorrente Direto</option>
                  <option value="inspiracao_estetica">Inspiração Estética</option>
                  <option value="referencia_educativa">Referência Educativa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente Associado
                </label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-hp-purple focus:outline-none focus:ring-1 focus:ring-hp-purple"
                >
                  <option value="">Selecione...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddReference}
                  className="btn-primary flex-1"
                  disabled={formLoading || !formHandle.trim()}
                >
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Adicionar e Analisar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  items,
  className = '',
}: {
  icon: typeof Hash;
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Icon className="h-4 w-4 text-hp-accent" />
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-600">
            &bull; {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightText({
  icon: Icon,
  title,
  text,
  className = '',
}: {
  icon: typeof Hash;
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Icon className="h-4 w-4 text-hp-accent" />
        {title}
      </div>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
