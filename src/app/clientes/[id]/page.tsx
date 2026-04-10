'use client';

import { useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import ClientDetail from '@/components/client/client-detail';

// Mock data — will be replaced with API fetch by client id
const mockClient = {
  id: '1',
  name: 'Dr. Ricardo Silva',
  specialty: 'Implantodontia',
  city: 'Sao Paulo',
  state: 'SP',
  instagram: '@dr.ricardosilva',
  cro: 'SP-123456',
  tone: 'Profissional e acolhedor. Usa linguagem acessivel para explicar procedimentos complexos, transmitindo confianca e empatia.',
  avatar: 'RS',
  colors: [
    { name: 'Primaria', hex: '#1e5aeb' },
    { name: 'Secundaria', hex: '#08c4b0' },
    { name: 'Acento', hex: '#f59e0b' },
    { name: 'Fundo', hex: '#fdf9ec' },
    { name: 'Texto', hex: '#1f2937' },
  ],
  fonts: [
    { role: 'Titulos', family: 'Montserrat Bold' },
    { role: 'Corpo', family: 'Inter Regular' },
    { role: 'Destaque', family: 'Playfair Display' },
  ],
  platforms: ['Instagram Feed', 'Instagram Reels', 'Instagram Stories'],
  ctas: [
    'Agende sua avaliacao gratuita!',
    'Link na bio para mais informacoes',
    'Comente "QUERO" para receber detalhes',
    'Salve este post para consultar depois',
  ],
  campaigns: [
    {
      id: '1',
      name: 'Implantes Dentarios - Campanha Abril',
      status: 'review',
      createdAt: '2026-04-08',
      postsCount: 12,
    },
    {
      id: '4',
      name: 'Implantes Premium - Marco',
      status: 'published',
      createdAt: '2026-03-10',
      postsCount: 10,
    },
    {
      id: '7',
      name: 'Carga Imediata - Fevereiro',
      status: 'approved',
      createdAt: '2026-02-15',
      postsCount: 8,
    },
  ],
  references: [
    {
      id: 'r1',
      name: 'Dr. Eduardo Munhoz',
      handle: '@dr.eduardomz',
      platform: 'Instagram',
    },
    {
      id: 'r2',
      name: 'Clinica Ideal Smile',
      handle: '@idealsmile.br',
      platform: 'Instagram',
    },
    {
      id: 'r3',
      name: 'Dental Hub',
      handle: '@dentalhub',
      platform: 'Instagram',
    },
  ],
};

export default function ClienteDetailPage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Navigation & Actions */}
      <div>
        <Link
          href="/clientes"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Clientes
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Perfil do Cliente
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary gap-2 text-sm"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? 'Cancelar Edicao' : 'Editar'}
          </button>
        </div>
      </div>

      {/* Client Detail Component */}
      <ClientDetail client={mockClient} />
    </div>
  );
}
