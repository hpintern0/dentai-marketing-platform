'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface ReferenceProfile {
  id: number;
  handle: string;
  specialty: string;
  category: string;
  client: string;
  status: 'analyzed' | 'pending' | 'analyzing';
  lastAnalyzed: string;
  insights?: {
    topFormats: string[];
    themes: string[];
    hooks: string[];
    tone: string;
    frequency: string;
    hashtags: string[];
    ctaPatterns: string[];
  };
}

const profiles: ReferenceProfile[] = [
  {
    id: 1,
    handle: '@dica.odonto',
    specialty: 'Odontologia Geral',
    category: 'Educacional',
    client: 'Dr. Ricardo Silva',
    status: 'analyzed',
    lastAnalyzed: '2026-04-08',
    insights: {
      topFormats: ['Carrossel (45%)', 'Reels (35%)', 'Post unico (20%)'],
      themes: ['Higiene bucal', 'Mitos vs Verdades', 'Dicas pos-procedimento', 'Prevencao'],
      hooks: ['Voce sabia que...', 'O erro mais comum...', 'Pare de fazer isso!', 'Dentista revela...'],
      tone: 'Educativo e acessivel, tom conversacional com autoridade profissional',
      frequency: '5x por semana (Seg-Sex)',
      hashtags: ['#odontologia', '#saudebucal', '#dentista', '#dicasdedentista', '#sorriso'],
      ctaPatterns: ['Salve para lembrar!', 'Marque alguem que precisa ver isso', 'Agende sua consulta pelo link na bio'],
    },
  },
  {
    id: 2,
    handle: '@implantes.expert',
    specialty: 'Implantodontia',
    category: 'Antes e Depois',
    client: 'Dr. Ricardo Silva',
    status: 'analyzed',
    lastAnalyzed: '2026-04-07',
    insights: {
      topFormats: ['Reels (55%)', 'Carrossel (30%)', 'Stories destaque (15%)'],
      themes: ['Transformacao de sorriso', 'Processo do implante', 'Depoimentos', 'Tecnologia'],
      hooks: ['Resultado incrivel!', 'Veja a transformacao...', 'Paciente emocionado(a)...'],
      tone: 'Inspiracional e tecnico, misturando resultados emocionais com credibilidade',
      frequency: '4x por semana',
      hashtags: ['#implantedentario', '#implantes', '#sorrisonovo', '#antesedepois'],
      ctaPatterns: ['Agende sua avaliacao', 'Link na bio para saber mais', 'Comente SIM para receber informacoes'],
    },
  },
  {
    id: 3,
    handle: '@estetica.dental',
    specialty: 'Odontologia Estetica',
    category: 'Lifestyle',
    client: 'Clinica Sorriso',
    status: 'pending',
    lastAnalyzed: '-',
  },
  {
    id: 4,
    handle: '@orto.moderna',
    specialty: 'Ortodontia',
    category: 'Educacional',
    client: 'Dra. Camila Mendes',
    status: 'analyzing',
    lastAnalyzed: '-',
  },
  {
    id: 5,
    handle: '@facetas.perfeitas',
    specialty: 'Facetas e Lentes',
    category: 'Antes e Depois',
    client: 'Dr. Fernando Oliveira',
    status: 'analyzed',
    lastAnalyzed: '2026-04-05',
    insights: {
      topFormats: ['Reels (60%)', 'Carrossel (25%)', 'Post unico (15%)'],
      themes: ['Harmonizacao', 'Casos clinicos', 'Materiais premium', 'FAQ pacientes'],
      hooks: ['Sorriso dos sonhos!', 'Facetas ou lentes?', 'O investimento que muda sua vida'],
      tone: 'Aspiracional e premium, enfatizando qualidade e resultado',
      frequency: '3x por semana',
      hashtags: ['#facetas', '#lentesdecontato', '#odontologiaestetica', '#sorrisoperfeito'],
      ctaPatterns: ['Agende sua simulacao digital', 'Envie DM para orcamento', 'Clique no link da bio'],
    },
  },
];

const statusBadge: Record<string, { label: string; class: string }> = {
  analyzed: { label: 'Analisado', class: 'badge-success' },
  pending: { label: 'Pendente', class: 'badge-neutral' },
  analyzing: { label: 'Analisando...', class: 'badge-info' },
};

export default function ReferenciasPage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState('Todas');
  const [filterCategory, setFilterCategory] = useState('Todas');

  const specialties = ['Todas', ...Array.from(new Set(profiles.map((p) => p.specialty)))];
  const categories = ['Todas', ...Array.from(new Set(profiles.map((p) => p.category)))];

  const filtered = profiles.filter((p) => {
    const matchSearch =
      p.handle.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty =
      filterSpecialty === 'Todas' || p.specialty === filterSpecialty;
    const matchCategory =
      filterCategory === 'Todas' || p.category === filterCategory;
    return matchSearch && matchSpecialty && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Perfis de Referencia
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Analise perfis de referencia para gerar conteudo inspirado
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
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            />
          </div>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
          >
            {specialties.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
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
                Ultima Analise
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((profile) => {
              const isExpanded = expandedId === profile.id;
              const badge = statusBadge[profile.status];
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
                        <td className="px-6 py-4 text-sm font-medium text-dental-blue">
                          {profile.handle}
                        </td>
                        <td className="hidden px-6 py-4 text-sm text-gray-600 md:table-cell">
                          {profile.specialty}
                        </td>
                        <td className="hidden px-6 py-4 text-sm text-gray-600 lg:table-cell">
                          {profile.category}
                        </td>
                        <td className="hidden px-6 py-4 text-sm text-gray-600 sm:table-cell">
                          {profile.client}
                        </td>
                        <td className="px-6 py-4">
                          <span className={badge.class}>{badge.label}</span>
                        </td>
                        <td className="hidden px-6 py-4 text-sm text-gray-500 lg:table-cell">
                          {profile.lastAnalyzed}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <RefreshCw className="h-3.5 w-3.5 inline mr-1" />
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
                        <div className="border-t border-gray-100 bg-gradient-to-b from-dental-blue-50/30 to-white px-6 py-5">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <InsightCard
                              icon={Palette}
                              title="Top Formatos"
                              items={profile.insights.topFormats}
                            />
                            <InsightCard
                              icon={TrendingUp}
                              title="Temas Recorrentes"
                              items={profile.insights.themes}
                            />
                            <InsightCard
                              icon={MessageSquare}
                              title="Hooks"
                              items={profile.insights.hooks}
                            />
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <Palette className="h-4 w-4 text-dental-teal" />
                                Tom de Voz
                              </div>
                              <p className="text-sm text-gray-600">
                                {profile.insights.tone}
                              </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <Calendar className="h-4 w-4 text-dental-teal" />
                                Frequencia
                              </div>
                              <p className="text-sm text-gray-600">
                                {profile.insights.frequency}
                              </p>
                            </div>
                            <InsightCard
                              icon={Hash}
                              title="Hashtags"
                              items={profile.insights.hashtags}
                            />
                            <InsightCard
                              icon={Target}
                              title="Padroes de CTA"
                              items={profile.insights.ctaPatterns}
                              className="md:col-span-2 lg:col-span-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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
                  Handle do Instagram
                </label>
                <input
                  type="text"
                  placeholder="@perfil"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidade
                </label>
                <select className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue">
                  <option>Selecione...</option>
                  <option>Implantodontia</option>
                  <option>Odontologia Estetica</option>
                  <option>Ortodontia</option>
                  <option>Facetas e Lentes</option>
                  <option>Clinica Geral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue">
                  <option>Selecione...</option>
                  <option>Educacional</option>
                  <option>Antes e Depois</option>
                  <option>Lifestyle</option>
                  <option>Tecnico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente Associado
                </label>
                <select className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue">
                  <option>Selecione...</option>
                  <option>Dr. Ricardo Silva</option>
                  <option>Clinica Sorriso</option>
                  <option>Dra. Camila Mendes</option>
                  <option>Dr. Fernando Oliveira</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-primary flex-1"
                >
                  Adicionar e Analisar
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
        <Icon className="h-4 w-4 text-dental-teal" />
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
