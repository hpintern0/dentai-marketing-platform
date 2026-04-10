'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Instagram, Megaphone, Eye, Pencil, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DENTAL_SPECIALTIES } from '@/lib/constants';
import type { Client } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClientCardProps {
  client: Client;
  activeCampaigns?: number;
  onEdit?: (client: Client) => void;
  onNewCampaign?: (client: Client) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function specialtyLabel(value: string): string {
  const found = DENTAL_SPECIALTIES.find((s) => s.value === value);
  return found ? found.label : value;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientCard({
  client,
  activeCampaigns = 0,
  onEdit,
  onNewCampaign,
}: ClientCardProps) {
  const primaryColor = client.color_palette?.primary ?? '#1E40AF';

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      {/* Color accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="p-5 pt-4">
        {/* Header: avatar + name */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${client.color_palette?.secondary ?? '#0D9488'})`,
            }}
          >
            {getInitials(client.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-hp-purple">
              {client.name}
            </h3>
            <Badge variant="queued" className="mt-1">
              {specialtyLabel(client.specialty)}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {client.city}, {client.state}
            </span>
          </div>

          {client.instagram_handle && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Instagram className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{client.instagram_handle}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Megaphone className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {activeCampaigns} campanha{activeCampaigns !== 1 ? 's' : ''} ativa
              {activeCampaigns !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
          <Link href={`/clientes/${client.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              iconLeft={<Eye className="h-3.5 w-3.5" />}
            >
              Ver
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            iconLeft={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => onEdit?.(client)}
          >
            Editar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            iconLeft={<PlusCircle className="h-3.5 w-3.5" />}
            onClick={() => onNewCampaign?.(client)}
          >
            Nova Campanha
          </Button>
        </div>
      </div>
    </Card>
  );
}
