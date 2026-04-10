'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  MapPin,
  Instagram,
  Megaphone,
  Filter,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ClientFormModal } from '@/components/client/client-form-modal';

interface ClientItem {
  id: string;
  name: string;
  specialty: string;
  city: string;
  state: string;
  instagram_handle: string;
  tone: string;
  active_platforms: string[];
  created_at: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 2 || w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [showModal, setShowModal] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Erro ao carregar clientes');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const specialties = [
    'Todas',
    ...Array.from(new Set(clients.map((c) => c.specialty).filter(Boolean))),
  ];

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.instagram_handle ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (`${c.city}, ${c.state}`).toLowerCase().includes(search.toLowerCase());
    const matchSpecialty =
      selectedSpecialty === 'Todas' || c.specialty === selectedSpecialty;
    return matchSearch && matchSpecialty;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="mt-1 text-sm text-gray-500">Carregando...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-28 rounded bg-gray-100" />
                <div className="h-3 w-24 rounded bg-gray-100" />
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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clients.length} clientes cadastrados
          </p>
        </div>
        <button className="btn-primary gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card !p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, Instagram ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 py-2 pl-10 pr-8 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            >
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((client) => (
          <Link
            key={client.id}
            href={`/clientes/${client.id}`}
            className="card group cursor-pointer transition-all hover:border-dental-blue-200 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dental-blue-500 to-dental-teal-500 text-sm font-bold text-white">
                {getInitials(client.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-dental-blue">
                  {client.name}
                </h3>
                <p className="text-xs text-gray-500">{client.specialty}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-dental-blue transition-colors" />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {client.city}{client.state ? `, ${client.state}` : ''}
              </div>
              {client.instagram_handle && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Instagram className="h-3.5 w-3.5" />
                  {client.instagram_handle}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">Nenhum cliente encontrado.</p>
        </div>
      )}

      {/* Client Form Modal */}
      <ClientFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          fetchClients();
        }}
      />
    </div>
  );
}
