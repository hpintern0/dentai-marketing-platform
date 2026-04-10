'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Loader2,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Campaign, CampaignStatus, Client } from '@/types';

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; classes: string }
> = {
  draft: {
    label: 'Rascunho',
    classes: 'bg-gray-100 text-gray-600',
  },
  briefing: {
    label: 'Briefing',
    classes: 'bg-gray-100 text-gray-600',
  },
  generating: {
    label: 'Gerando',
    classes: 'bg-blue-100 text-blue-700 animate-pulse',
  },
  reviewing: {
    label: 'Em Revisao',
    classes: 'bg-yellow-100 text-yellow-700',
  },
  approved: {
    label: 'Aprovado',
    classes: 'bg-green-100 text-green-700',
  },
  scheduled: {
    label: 'Agendado',
    classes: 'bg-teal-100 text-teal-700',
  },
  published: {
    label: 'Publicado',
    classes: 'bg-dental-teal-100 text-dental-teal-700',
  },
  failed: {
    label: 'Falhou',
    classes: 'bg-red-100 text-red-700',
  },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Format labels
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<string, string> = {
  carousel: 'Carrossel',
  feed_static: 'Feed Estatico',
  reels: 'Reels',
  stories: 'Stories',
  copy_only: 'Apenas Copy',
  multi_format: 'Multi-formato',
};

function formatLabels(formats: string[]): string {
  if (!formats || formats.length === 0) return '-';
  return formats.map((f) => FORMAT_LABELS[f] ?? f).join(', ');
}

// ---------------------------------------------------------------------------
// Status filter options
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'briefing', label: 'Briefing' },
  { value: 'generating', label: 'Gerando' },
  { value: 'reviewing', label: 'Em Revisao' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'published', label: 'Publicado' },
  { value: 'failed', label: 'Falhou' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CampanhasPage() {
  // Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ------ fetch data ------

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [campRes, clientRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/clients'),
        ]);

        const campData: Campaign[] = campRes.ok ? await campRes.json() : [];
        const clientData: Client[] = clientRes.ok ? await clientRes.json() : [];

        setCampaigns(campData);
        setClients(clientData);
      } catch {
        // silently fall back to empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ------ client lookup ------

  const clientMap = useMemo(() => {
    const map: Record<string, Client> = {};
    clients.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [clients]);

  function clientName(campaign: Campaign): string {
    if (campaign.client?.name) return campaign.client.name;
    const c = clientMap[campaign.client_id];
    return c?.name ?? campaign.client_id;
  }

  // ------ filtered list ------

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      // text search
      if (search) {
        const q = search.toLowerCase();
        const name = c.name.toLowerCase();
        const cName = clientName(c).toLowerCase();
        if (!name.includes(q) && !cName.includes(q)) return false;
      }
      // status
      if (statusFilter && c.status !== statusFilter) return false;
      // client
      if (clientFilter && c.client_id !== clientFilter) return false;
      // date range
      if (dateFrom) {
        const created = c.created_at.slice(0, 10);
        if (created < dateFrom) return false;
      }
      if (dateTo) {
        const created = c.created_at.slice(0, 10);
        if (created > dateTo) return false;
      }
      return true;
    });
  }, [campaigns, search, statusFilter, clientFilter, dateFrom, dateTo, clientMap]);

  // ------ render ------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {campaigns.length} campanha{campaigns.length !== 1 ? 's' : ''} no
            total
          </p>
        </div>
        <Link href="/nova-campanha">
          <Button iconLeft={<Plus className="h-4 w-4" />}>
            Nova Campanha
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            />
          </div>

          {/* Client dropdown */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 py-2 pl-10 pr-8 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            >
              <option value="">Todos os clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status dropdown */}
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 py-2 pl-10 pr-8 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
              />
            </div>
            <span className="text-xs text-gray-400">ate</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-dental-blue" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Nenhuma campanha encontrada.
          </p>
          <Link href="/nova-campanha" className="mt-4 inline-block">
            <Button size="sm" iconLeft={<Plus className="h-4 w-4" />}>
              Criar Campanha
            </Button>
          </Link>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((campaign) => (
                <TableRow key={campaign.id} className="group">
                  <TableCell>
                    <Link
                      href={`/campanhas/${campaign.id}`}
                      className="font-medium text-gray-900 hover:text-dental-blue transition-colors"
                    >
                      {campaign.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {clientName(campaign)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatLabels(campaign.parsed_brief?.format ?? [])}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(campaign.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/campanhas/${campaign.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconRight={<ChevronRight className="h-4 w-4" />}
                      >
                        Ver
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
