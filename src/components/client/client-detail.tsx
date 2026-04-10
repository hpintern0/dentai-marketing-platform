'use client';

import {
  MapPin,
  Instagram,
  Shield,
  Palette,
  Type,
  Megaphone,
  MousePointerClick,
  Calendar,
  ChevronRight,
  Image,
} from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  postsCount: number;
}

interface ReferenceProfile {
  id: string;
  name: string;
  handle: string;
  platform: string;
}

interface ClientData {
  id: string;
  name: string;
  specialty: string;
  city: string;
  state: string;
  instagram: string;

  cro: string;
  tone: string;
  avatar: string;
  colors: { name: string; hex: string }[];
  fonts: { role: string; family: string }[];
  platforms: string[];
  ctas: string[];
  campaigns: Campaign[];
  references: ReferenceProfile[];
}

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Rascunho', class: 'badge-neutral' },
  generating: { label: 'Gerando', class: 'badge-info' },
  review: { label: 'Em revisao', class: 'badge-warning' },
  approved: { label: 'Aprovado', class: 'badge-success' },
  published: { label: 'Publicado', class: 'badge-success' },
};

export default function ClientDetail({ client }: { client: ClientData }) {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dental-blue-500 to-dental-teal-500 text-xl font-bold text-white">
            {client.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
            <p className="text-sm text-gray-500">{client.specialty}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {client.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {client.city}, {client.state}
                </span>
              )}
              {client.instagram && (
                <span className="flex items-center gap-1">
                  <Instagram className="h-3.5 w-3.5" />
                  {client.instagram}
                </span>
              )}
              {client.cro && (
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  CRO: {client.cro}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Config */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Color Palette */}
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Palette className="h-4 w-4 text-dental-blue" />
            Paleta de Cores
          </h3>
          <div className="flex flex-wrap gap-3">
            {client.colors.map((color) => (
              <div key={color.hex} className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <p className="text-xs font-medium text-gray-700">{color.name}</p>
                  <p className="text-[10px] uppercase text-gray-400">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Type className="h-4 w-4 text-dental-blue" />
            Tipografia
          </h3>
          <div className="space-y-3">
            {client.fonts.map((font) => (
              <div
                key={font.role}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <span className="text-xs font-medium text-gray-500 capitalize">
                  {font.role}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {font.family}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platforms & CTAs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Platforms */}
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Megaphone className="h-4 w-4 text-dental-blue" />
            Plataformas Ativas
          </h3>
          <div className="flex flex-wrap gap-2">
            {client.platforms.map((platform) => (
              <span
                key={platform}
                className="badge bg-dental-blue-50 text-dental-blue-700"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MousePointerClick className="h-4 w-4 text-dental-blue" />
            CTAs Padrao
          </h3>
          <ul className="space-y-2">
            {client.ctas.map((cta, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-dental-teal-50 text-[10px] font-bold text-dental-teal-700">
                  {idx + 1}
                </span>
                {cta}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tone */}
      {client.tone && (
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Tom de Voz
          </h3>
          <p className="text-sm text-gray-600">{client.tone}</p>
        </div>
      )}

      {/* Campaign History */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Calendar className="h-4 w-4 text-dental-blue" />
            Historico de Campanhas
          </h3>
          <span className="text-xs text-gray-400">
            {client.campaigns.length} campanha{client.campaigns.length !== 1 ? 's' : ''}
          </span>
        </div>
        {client.campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-400">
                  <th className="pb-3 pr-4">Nome</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Data</th>
                  <th className="pb-3 pr-4">Posts</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {client.campaigns.map((campaign) => {
                  const badge = statusConfig[campaign.status] ?? {
                    label: campaign.status,
                    class: 'badge-neutral',
                  };
                  return (
                    <tr key={campaign.id} className="group">
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {campaign.name}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={badge.class}>{badge.label}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {campaign.createdAt}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {campaign.postsCount}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/campanhas/${campaign.id}`}
                          className="text-dental-blue opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-gray-400">
            Nenhuma campanha registrada.
          </p>
        )}
      </div>

      {/* Reference Profiles */}
      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Instagram className="h-4 w-4 text-dental-blue" />
          Perfis de Referencia
        </h3>
        {client.references.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {client.references.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dental-blue-50 text-xs font-bold text-dental-blue-700">
                  {ref.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ref.name}</p>
                  <p className="text-xs text-gray-500">{ref.handle}</p>
                </div>
                <span className="badge bg-dental-teal-50 text-dental-teal-700 ml-2">
                  {ref.platform}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">
            Nenhum perfil de referencia associado.
          </p>
        )}
      </div>

      {/* Assets Gallery Placeholder */}
      <div className="card">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Image className="h-4 w-4 text-dental-blue" />
          Galeria de Assets
        </h3>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
          <Image className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Nenhum asset carregado
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Logos, fotos do consultorio e materiais de marca aparecerao aqui.
          </p>
          <button className="btn-secondary mt-4 text-xs">
            Fazer Upload
          </button>
        </div>
      </div>
    </div>
  );
}
