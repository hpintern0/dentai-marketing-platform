'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Image,
  Video,
  Type,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Layers,
  FileCheck,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

const campaign = {
  id: 1,
  name: 'Implantes Dentarios - Campanha Abril',
  client: 'Dr. Ricardo Silva',
  status: 'review',
  createdAt: '2026-04-08',
};

const timeline = [
  {
    step: 'Brief recebido',
    status: 'complete',
    time: '10:00',
    detail: 'Brief parseado e validado',
  },
  {
    step: 'Pesquisa de tendencias',
    status: 'complete',
    time: '10:02',
    detail: '12 tendencias identificadas',
  },
  {
    step: 'Geracao de imagens',
    status: 'complete',
    time: '10:08',
    detail: '6 imagens geradas com DALL-E',
  },
  {
    step: 'Criacao de carrossel',
    status: 'complete',
    time: '10:12',
    detail: 'Carrossel de 5 slides montado',
  },
  {
    step: 'Criacao de video',
    status: 'complete',
    time: '10:18',
    detail: 'Reels de 30s renderizado',
  },
  {
    step: 'Redacao de copy',
    status: 'complete',
    time: '10:20',
    detail: '3 variacoes de copy criadas',
  },
  {
    step: 'Revisao de qualidade',
    status: 'running',
    time: '10:22',
    detail: 'Verificando conformidade...',
  },
  {
    step: 'Aprovacao do cliente',
    status: 'pending',
    time: '-',
    detail: 'Aguardando revisao',
  },
];

const tabs = [
  { id: 'criativos', label: 'Criativos', icon: Image },
  { id: 'carrossel', label: 'Carrossel', icon: Layers },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'copy', label: 'Copy', icon: Type },
  { id: 'review', label: 'Review', icon: FileCheck },
  { id: 'aprovacao', label: 'Aprovacao', icon: Shield },
];

interface ContentPiece {
  id: number;
  title: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  preview: string;
}

const contentPieces: Record<string, ContentPiece[]> = {
  criativos: [
    { id: 1, title: 'Imagem principal - Sorriso', type: 'image', status: 'approved', preview: 'Imagem de alta qualidade mostrando sorriso com implante' },
    { id: 2, title: 'Imagem - Processo', type: 'image', status: 'approved', preview: 'Infografico do processo de implante' },
    { id: 3, title: 'Imagem - Consultorio', type: 'image', status: 'pending', preview: 'Foto do consultorio com tecnologia' },
  ],
  carrossel: [
    { id: 4, title: 'Slide 1 - Capa', type: 'slide', status: 'approved', preview: '"5 Vantagens do Implante Dentario" - Titulo com design moderno' },
    { id: 5, title: 'Slide 2 - Vantagem 1', type: 'slide', status: 'approved', preview: 'Mastigacao natural - Texto com icone ilustrativo' },
    { id: 6, title: 'Slide 3 - Vantagem 2', type: 'slide', status: 'pending', preview: 'Durabilidade - Comparativo com outras opcoes' },
    { id: 7, title: 'Slide 4 - Vantagem 3', type: 'slide', status: 'pending', preview: 'Estetica - Antes e depois' },
    { id: 8, title: 'Slide 5 - CTA', type: 'slide', status: 'pending', preview: 'Agende sua avaliacao - Link na bio' },
  ],
  video: [
    { id: 9, title: 'Reels - Antes e Depois', type: 'video', status: 'pending', preview: 'Video de 30s com transicao before/after e musica trending' },
  ],
  copy: [
    { id: 10, title: 'Caption - Carrossel', type: 'text', status: 'approved', preview: 'Voce sabia que o implante dentario tem taxa de sucesso de 98%? Descubra as 5 principais vantagens...' },
    { id: 11, title: 'Caption - Reels', type: 'text', status: 'pending', preview: 'Transformacao real! Veja como o implante devolveu o sorriso deste paciente...' },
    { id: 12, title: 'Caption - Stories', type: 'text', status: 'pending', preview: 'Swipe up para agendar sua avaliacao gratuita! Link na bio...' },
  ],
  review: [
    { id: 13, title: 'Checklist de qualidade', type: 'review', status: 'pending', preview: 'Verificacao de conformidade com CFO, ortografia, tom de voz e identidade visual' },
  ],
  aprovacao: [],
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  complete: { icon: CheckCircle2, class: 'text-green-500' },
  running: { icon: Loader2, class: 'text-dental-blue animate-spin' },
  pending: { icon: Clock, class: 'text-gray-300' },
  failed: { icon: XCircle, class: 'text-red-500' },
};

const contentStatusBadge: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendente', class: 'badge-warning' },
  approved: { label: 'Aprovado', class: 'badge-success' },
  rejected: { label: 'Rejeitado', class: 'badge-error' },
};

const campaignStatusBadge: Record<string, { label: string; class: string }> = {
  draft: { label: 'Rascunho', class: 'badge-neutral' },
  generating: { label: 'Gerando', class: 'badge-info' },
  review: { label: 'Em revisao', class: 'badge-warning' },
  approved: { label: 'Aprovado', class: 'badge-success' },
  published: { label: 'Publicado', class: 'badge-success' },
};

export default function CampanhaDetailPage() {
  const [activeTab, setActiveTab] = useState('criativos');
  const [pieces, setPieces] = useState(contentPieces);

  const updateStatus = (tabId: string, pieceId: number, status: 'approved' | 'rejected') => {
    setPieces((prev) => ({
      ...prev,
      [tabId]: prev[tabId].map((p) =>
        p.id === pieceId ? { ...p, status } : p
      ),
    }));
  };

  const allApproved = Object.values(pieces)
    .flat()
    .filter((p) => p.type !== 'review')
    .every((p) => p.status === 'approved');

  const currentPieces = pieces[activeTab] || [];
  const badge = campaignStatusBadge[campaign.status];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/campanhas"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Campanhas
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {campaign.name}
              </h1>
              <span className={badge.class}>{badge.label}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {campaign.client} &middot; Criada em {campaign.createdAt}
            </p>
          </div>
          {allApproved && (
            <button className="btn-primary gap-2 bg-dental-teal hover:bg-dental-teal-700">
              <Send className="h-4 w-4" />
              Publicar
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Timeline de Execucao
        </h2>
        <div className="space-y-3">
          {timeline.map((step, idx) => {
            const config = statusConfig[step.status];
            const StepIcon = config.icon;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <StepIcon className={`h-5 w-5 ${config.class}`} />
                  {idx < timeline.length - 1 && (
                    <div
                      className={`mt-1 h-8 w-px ${
                        step.status === 'complete'
                          ? 'bg-green-300'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {step.step}
                    </p>
                    <span className="text-xs text-gray-400">{step.time}</span>
                  </div>
                  <p className="text-xs text-gray-500">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-dental-blue text-dental-blue'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'aprovacao' ? (
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Resumo de Aprovacao
          </h3>
          <div className="space-y-3">
            {Object.entries(pieces).map(([tabId, tabPieces]) =>
              tabPieces.map((piece) => {
                const pBadge = contentStatusBadge[piece.status];
                return (
                  <div
                    key={piece.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {piece.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {tabId}
                      </p>
                    </div>
                    <span className={pBadge.class}>{pBadge.label}</span>
                  </div>
                );
              })
            )}
          </div>
          {allApproved ? (
            <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-2 text-sm font-medium text-green-800">
                Todos os conteudos foram aprovados!
              </p>
              <button className="mt-3 btn-primary bg-dental-teal hover:bg-dental-teal-700 gap-2">
                <Send className="h-4 w-4" />
                Publicar Campanha
              </button>
            </div>
          ) : (
            <p className="mt-4 text-center text-sm text-gray-500">
              Aprove todos os conteudos nas abas acima para habilitar a publicacao.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentPieces.map((piece) => {
            const pBadge = contentStatusBadge[piece.status];
            return (
              <div key={piece.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {piece.title}
                      </h3>
                      <span className={pBadge.class}>{pBadge.label}</span>
                    </div>
                    {/* Preview Area */}
                    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                      {piece.type === 'image' || piece.type === 'slide' ? (
                        <div className="flex items-center gap-4">
                          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-dental-blue-100 to-dental-teal-100">
                            <Image className="h-8 w-8 text-dental-blue-300" />
                          </div>
                          <p className="text-sm text-gray-600">
                            {piece.preview}
                          </p>
                        </div>
                      ) : piece.type === 'video' ? (
                        <div className="flex items-center gap-4">
                          <div className="flex h-24 w-40 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-dental-blue-100 to-dental-teal-100">
                            <Video className="h-8 w-8 text-dental-blue-300" />
                          </div>
                          <p className="text-sm text-gray-600">
                            {piece.preview}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 italic">
                          &ldquo;{piece.preview}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Actions */}
                {piece.status === 'pending' && (
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                    <button className="btn-secondary gap-1.5 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() =>
                        updateStatus(activeTab, piece.id, 'rejected')
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      Rejeitar
                    </button>
                    <button
                      onClick={() =>
                        updateStatus(activeTab, piece.id, 'approved')
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Aprovar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {currentPieces.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              Nenhum conteudo nesta secao ainda.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
