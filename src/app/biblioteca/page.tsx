'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Image,
  Video,
  Type,
  Layers,
  RefreshCw,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface CampaignItem {
  id: string;
  client_id: string;
  name: string;
  status: string;
  created_at: string;
  parsed_brief?: {
    procedure_focus?: string;
    format?: string[];
  };
  clients?: { id: string; name: string };
}

const formatConfig: Record<string, { icon: typeof Image; label: string; color: string }> = {
  image: { icon: Image, label: 'Imagem', color: 'bg-blue-100 text-blue-600' },
  feed_static: { icon: Image, label: 'Imagem', color: 'bg-blue-100 text-blue-600' },
  carousel: { icon: Layers, label: 'Carrossel', color: 'bg-purple-100 text-purple-600' },
  video: { icon: Video, label: 'Video', color: 'bg-pink-100 text-pink-600' },
  reels: { icon: Video, label: 'Reels', color: 'bg-pink-100 text-pink-600' },
  copy: { icon: Type, label: 'Copy', color: 'bg-teal-100 text-teal-600' },
  copy_only: { icon: Type, label: 'Copy', color: 'bg-teal-100 text-teal-600' },
  stories: { icon: Image, label: 'Stories', color: 'bg-orange-100 text-orange-600' },
  multi_format: { icon: Layers, label: 'Multi-formato', color: 'bg-indigo-100 text-indigo-600' },
};

function getPrimaryFormat(campaign: CampaignItem): string {
  const formats = campaign.parsed_brief?.format;
  if (formats && formats.length > 0) return formats[0];
  return 'multi_format';
}

export default function BibliotecaPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('Todos');
  const [filterFormat, setFilterFormat] = useState('Todos');
  const [filterProcedure, setFilterProcedure] = useState('Todos');

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setError(null);
      try {
        // Fetch approved and published campaigns
        const res = await fetch('/api/campaigns');
        if (!res.ok) throw new Error('Erro ao carregar biblioteca');
        const json = await res.json();
        const all: CampaignItem[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        // Filter to only approved/published
        setCampaigns(all.filter((c) => c.status === 'approved' || c.status === 'published'));
      } catch (err: any) {
        setError(err.message ?? 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const clients = useMemo(
    () => ['Todos', ...Array.from(new Set(campaigns.map((c) => c.clients?.name).filter(Boolean) as string[]))],
    [campaigns],
  );
  const procedures = useMemo(
    () => ['Todos', ...Array.from(new Set(campaigns.map((c) => c.parsed_brief?.procedure_focus).filter(Boolean) as string[]))],
    [campaigns],
  );

  const filtered = campaigns.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchClient = filterClient === 'Todos' || item.clients?.name === filterClient;
    const matchFormat =
      filterFormat === 'Todos' ||
      (item.parsed_brief?.format ?? []).some((f) => f === filterFormat);
    const matchProcedure =
      filterProcedure === 'Todos' || item.parsed_brief?.procedure_focus === filterProcedure;
    return matchSearch && matchClient && matchFormat && matchProcedure;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
          <p className="mt-1 text-sm text-gray-500">Carregando...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse !p-0 overflow-hidden">
              <div className="h-40 bg-gray-100" />
              <div className="p-4">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
              </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
        <p className="mt-1 text-sm text-gray-500">
          {campaigns.length} conteudos aprovados e publicados
        </p>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conteudos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            />
          </div>
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
          >
            {clients.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterProcedure}
            onChange={(e) => setFilterProcedure(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
          >
            {procedures.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
          >
            <option value="Todos">Todos os formatos</option>
            <option value="feed_static">Imagem</option>
            <option value="carousel">Carrossel</option>
            <option value="reels">Reels / Video</option>
            <option value="copy_only">Copy</option>
            <option value="stories">Stories</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => {
          const format = getPrimaryFormat(item);
          const fmt = formatConfig[format] ?? formatConfig.multi_format;
          const FmtIcon = fmt.icon;
          return (
            <div
              key={item.id}
              className="card group cursor-pointer transition-all hover:border-dental-blue-200 hover:shadow-md !p-0 overflow-hidden"
            >
              {/* Preview */}
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-dental-blue-50 to-dental-teal-50">
                <FmtIcon className="h-12 w-12 text-dental-blue-200" />
                <div className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${fmt.color}`}>
                  <FmtIcon className="h-3 w-3" />
                  {fmt.label}
                </div>
                {item.status === 'published' && (
                  <div className="absolute top-3 right-3 badge-success text-[10px]">
                    Publicado
                  </div>
                )}
                {item.status === 'approved' && (
                  <div className="absolute top-3 right-3 badge-warning text-[10px]">
                    Aprovado
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-dental-blue truncate">
                  {item.name}
                </h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  {item.clients?.name ?? 'Cliente'}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </div>
                {item.parsed_brief?.procedure_focus && (
                  <div className="mt-1 text-xs text-gray-400">
                    {item.parsed_brief.procedure_focus}
                  </div>
                )}
                <div className="mt-3">
                  <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dental-blue-200 py-1.5 text-xs font-medium text-dental-blue hover:bg-dental-blue-50 transition-colors">
                    <RefreshCw className="h-3 w-3" />
                    Reutilizar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">
          Nenhum conteudo encontrado.
        </div>
      )}
    </div>
  );
}
