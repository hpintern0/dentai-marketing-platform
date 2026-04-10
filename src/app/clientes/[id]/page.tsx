'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ClientFormModal } from '@/components/client/client-form-modal';

interface ClientData {
  id: string;
  name: string;
  specialty: string;
  city: string;
  state: string;
  instagram_handle: string;
  cro_number: string;
  tone: string;
  color_palette: any;
  typography: any;
  active_platforms: string[];
  default_ctas: string[];
  created_at: string;
  updated_at?: string;
  campaigns?: any[];
}

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchClient() {
      setLoading(true);
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) throw new Error('Cliente não encontrado');
        const data = await res.json();
        setClient(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-hp-purple" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Voltar para Clientes
        </Link>
        <div className="card border-red-200 bg-red-50 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error || 'Cliente não encontrado'}</p>
        </div>
      </div>
    );
  }

  const initials = client.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const palette = client.color_palette || {};
  const colors = Object.entries(palette).map(([name, hex]) => ({ name, hex: hex as string }));
  const fonts = client.typography
    ? [
        { role: 'Títulos', family: client.typography.heading_font || '-' },
        { role: 'Corpo', family: client.typography.body_font || '-' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Nav */}
      <div>
        <Link href="/clientes" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Voltar para Clientes
        </Link>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-hp-purple-500 to-hp-purple-700 text-xl font-bold text-white">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            </div>
            <p className="text-sm text-gray-500">{client.specialty}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              <span>{client.city}, {client.state}</span>
              {client.instagram_handle && <span>{client.instagram_handle}</span>}
              <span>CRO: {client.cro_number}</span>
              <span>Tom: {client.tone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paleta de Cores */}
        {colors.length > 0 && (
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Paleta de Cores</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: c.hex }} />
                  <div>
                    <p className="text-xs font-medium text-gray-700 capitalize">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tipografia */}
        {fonts.length > 0 && (
          <div className="card">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Tipografia</h3>
            <div className="space-y-3">
              {fonts.map((f) => (
                <div key={f.role} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{f.role}</span>
                  <span className="text-sm font-medium text-gray-900">{f.family}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plataformas */}
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Plataformas Ativas</h3>
          <div className="flex flex-wrap gap-2">
            {(client.active_platforms || []).map((p) => (
              <span key={p} className="rounded-full bg-hp-purple-50 px-3 py-1 text-xs font-medium text-hp-purple-700">
                {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">CTAs Padrão</h3>
          <ul className="space-y-2">
            {(client.default_ctas || []).map((cta, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-hp-purple-400" />
                {cta}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Campanhas */}
      {client.campaigns && client.campaigns.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Campanhas ({client.campaigns.length})</h3>
          <div className="space-y-2">
            {client.campaigns.map((c: any) => (
              <Link
                key={c.id}
                href={`/campanhas/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  c.status === 'approved' ? 'bg-green-100 text-green-700' :
                  c.status === 'published' ? 'bg-hp-accent-100 text-hp-accent-700' :
                  c.status === 'generating' ? 'bg-blue-100 text-blue-700' :
                  c.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <ClientFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={async () => {
          setShowEditModal(false);
          // Refetch client data
          const res = await fetch(`/api/clients/${id}`);
          if (res.ok) setClient(await res.json());
        }}
        client={client as any}
      />
    </div>
  );
}
