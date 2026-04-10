'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface ContentItem {
  id: number;
  title: string;
  client: string;
  procedure: string;
  format: 'image' | 'carousel' | 'video' | 'copy';
  platform: string;
  date: string;
  status: 'published' | 'approved';
}

const library: ContentItem[] = [
  { id: 1, title: '5 Vantagens do Implante', client: 'Dr. Ricardo Silva', procedure: 'Implante', format: 'carousel', platform: 'Instagram', date: '2026-04-08', status: 'published' },
  { id: 2, title: 'Antes e Depois - Clareamento', client: 'Clinica Sorriso', procedure: 'Clareamento', format: 'video', platform: 'Instagram', date: '2026-04-07', status: 'published' },
  { id: 3, title: 'Dica de Higiene Bucal', client: 'Dra. Camila Mendes', procedure: 'Higiene', format: 'image', platform: 'Instagram', date: '2026-04-06', status: 'published' },
  { id: 4, title: 'Caption - Facetas Premium', client: 'Dr. Fernando Oliveira', procedure: 'Facetas', format: 'copy', platform: 'Instagram', date: '2026-04-05', status: 'approved' },
  { id: 5, title: 'Reels - Processo do Implante', client: 'Dr. Ricardo Silva', procedure: 'Implante', format: 'video', platform: 'Instagram', date: '2026-04-04', status: 'published' },
  { id: 6, title: 'Carrossel - Mitos da Ortodontia', client: 'Dra. Camila Mendes', procedure: 'Ortodontia', format: 'carousel', platform: 'Instagram', date: '2026-04-03', status: 'published' },
  { id: 7, title: 'Post - Sorriso Perfeito', client: 'Clinica Sorriso', procedure: 'Estetica', format: 'image', platform: 'Instagram', date: '2026-04-02', status: 'approved' },
  { id: 8, title: 'Caption - Protese Moderna', client: 'Clinica OdontoPlus', procedure: 'Protese', format: 'copy', platform: 'Instagram', date: '2026-04-01', status: 'published' },
  { id: 9, title: 'Reels - Depoimento Paciente', client: 'Dr. Ricardo Silva', procedure: 'Implante', format: 'video', platform: 'Instagram', date: '2026-03-30', status: 'published' },
  { id: 10, title: 'Carrossel - Cuidados Pos-Op', client: 'Dr. Fernando Oliveira', procedure: 'Facetas', format: 'carousel', platform: 'Instagram', date: '2026-03-29', status: 'published' },
  { id: 11, title: 'Post - Tecnologia 3D', client: 'Dr. Ricardo Silva', procedure: 'Implante', format: 'image', platform: 'Instagram', date: '2026-03-28', status: 'approved' },
  { id: 12, title: 'Caption - Sorriso dos Sonhos', client: 'Clinica Sorriso', procedure: 'Clareamento', format: 'copy', platform: 'Instagram', date: '2026-03-27', status: 'published' },
];

const formatConfig: Record<string, { icon: typeof Image; label: string; color: string }> = {
  image: { icon: Image, label: 'Imagem', color: 'bg-blue-100 text-blue-600' },
  carousel: { icon: Layers, label: 'Carrossel', color: 'bg-purple-100 text-purple-600' },
  video: { icon: Video, label: 'Video', color: 'bg-pink-100 text-pink-600' },
  copy: { icon: Type, label: 'Copy', color: 'bg-teal-100 text-teal-600' },
};

export default function BibliotecaPage() {
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('Todos');
  const [filterFormat, setFilterFormat] = useState('Todos');
  const [filterProcedure, setFilterProcedure] = useState('Todos');

  const clients = ['Todos', ...Array.from(new Set(library.map((i) => i.client)))];
  const procedures = ['Todos', ...Array.from(new Set(library.map((i) => i.procedure)))];
  const formats = ['Todos', 'image', 'carousel', 'video', 'copy'];

  const filtered = library.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchClient = filterClient === 'Todos' || item.client === filterClient;
    const matchFormat = filterFormat === 'Todos' || item.format === filterFormat;
    const matchProcedure = filterProcedure === 'Todos' || item.procedure === filterProcedure;
    return matchSearch && matchClient && matchFormat && matchProcedure;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
        <p className="mt-1 text-sm text-gray-500">
          {library.length} conteudos aprovados e publicados
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
            <option value="image">Imagem</option>
            <option value="carousel">Carrossel</option>
            <option value="video">Video</option>
            <option value="copy">Copy</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => {
          const fmt = formatConfig[item.format];
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
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-dental-blue truncate">
                  {item.title}
                </h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  {item.client}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {item.date}
                </div>
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
