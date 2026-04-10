'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  MapPin,
  Instagram,
  Megaphone,
  Filter,
  ChevronRight,
} from 'lucide-react';

const clients = [
  {
    id: 1,
    name: 'Dr. Ricardo Silva',
    specialty: 'Implantodontia',
    city: 'Sao Paulo, SP',
    instagram: '@dr.ricardosilva',
    activeCampaigns: 3,
    avatar: 'RS',
  },
  {
    id: 2,
    name: 'Clinica Sorriso',
    specialty: 'Odontologia Estetica',
    city: 'Rio de Janeiro, RJ',
    instagram: '@clinicasorriso',
    activeCampaigns: 2,
    avatar: 'CS',
  },
  {
    id: 3,
    name: 'Dra. Camila Mendes',
    specialty: 'Ortodontia',
    city: 'Belo Horizonte, MG',
    instagram: '@dra.camilamendes',
    activeCampaigns: 1,
    avatar: 'CM',
  },
  {
    id: 4,
    name: 'Dr. Fernando Oliveira',
    specialty: 'Facetas e Lentes',
    city: 'Curitiba, PR',
    instagram: '@dr.fernandooliv',
    activeCampaigns: 2,
    avatar: 'FO',
  },
  {
    id: 5,
    name: 'Clinica OdontoPlus',
    specialty: 'Protese Dentaria',
    city: 'Brasilia, DF',
    instagram: '@odontoplus',
    activeCampaigns: 0,
    avatar: 'OP',
  },
  {
    id: 6,
    name: 'Dr. Paulo Costa',
    specialty: 'Periodontia',
    city: 'Porto Alegre, RS',
    instagram: '@dr.paulocosta',
    activeCampaigns: 1,
    avatar: 'PC',
  },
  {
    id: 7,
    name: 'Dra. Ana Beatriz',
    specialty: 'Odontopediatria',
    city: 'Salvador, BA',
    instagram: '@dra.anabeatriz',
    activeCampaigns: 2,
    avatar: 'AB',
  },
  {
    id: 8,
    name: 'Clinica DentVida',
    specialty: 'Clinica Geral',
    city: 'Recife, PE',
    instagram: '@clinicadentvida',
    activeCampaigns: 1,
    avatar: 'DV',
  },
];

const specialties = [
  'Todas',
  'Implantodontia',
  'Odontologia Estetica',
  'Ortodontia',
  'Facetas e Lentes',
  'Protese Dentaria',
  'Periodontia',
  'Odontopediatria',
  'Clinica Geral',
];

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.instagram.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty =
      selectedSpecialty === 'Todas' || c.specialty === selectedSpecialty;
    return matchSearch && matchSpecialty;
  });

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
        <button className="btn-primary gap-2">
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
          <div
            key={client.id}
            className="card group cursor-pointer transition-all hover:border-dental-blue-200 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dental-blue-500 to-dental-teal-500 text-sm font-bold text-white">
                {client.avatar}
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
                {client.city}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Instagram className="h-3.5 w-3.5" />
                {client.instagram}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Megaphone className="h-3.5 w-3.5" />
                {client.activeCampaigns} campanha{client.activeCampaigns !== 1 ? 's' : ''} ativa{client.activeCampaigns !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">Nenhum cliente encontrado.</p>
        </div>
      )}
    </div>
  );
}
