'use client';

import { useState } from 'react';
import {
  Send,
  Bot,
  User,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Clock,
  FileText,
  Image,
  Video,
  Type,
  Instagram,
} from 'lucide-react';

const clients = [
  {
    id: 1,
    name: 'Dr. Ricardo Silva',
    specialty: 'Implantodontia',
    city: 'Sao Paulo, SP',
    instagram: '@dr.ricardosilva',
    tone: 'Profissional e acolhedor',
    topics: ['Implantes', 'Reabilitacao oral', 'Protese sobre implante'],
  },
  {
    id: 2,
    name: 'Clinica Sorriso',
    specialty: 'Odontologia Estetica',
    city: 'Rio de Janeiro, RJ',
    instagram: '@clinicasorriso',
    tone: 'Moderno e aspiracional',
    topics: ['Clareamento', 'Facetas', 'Design de sorriso'],
  },
  {
    id: 3,
    name: 'Dra. Camila Mendes',
    specialty: 'Ortodontia',
    city: 'Belo Horizonte, MG',
    instagram: '@dra.camilamendes',
    tone: 'Educativo e descontraido',
    topics: ['Invisalign', 'Aparelho fixo', 'Ortodontia adulto'],
  },
];

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface BriefData {
  procedure: string;
  objective: string;
  formats: string[];
  tone: string;
  references: string[];
}

const suggestionChips = [
  'Criar campanha de implantes para Instagram',
  'Campanha de clareamento com antes/depois',
  'Serie educativa sobre higiene bucal',
  'Lancamento de novo procedimento',
];

const pipelineSteps = [
  { id: 1, label: 'Pesquisa de tendencias', icon: FileText },
  { id: 2, label: 'Geracao de imagens', icon: Image },
  { id: 3, label: 'Criacao de video', icon: Video },
  { id: 4, label: 'Redacao de copy', icon: Type },
  { id: 5, label: 'Publicacao', icon: Instagram },
];

export default function NovaCampanhaPage() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'Ola! Sou o assistente de criacao de campanhas da DentAI. Selecione um cliente acima e me diga que tipo de campanha voce gostaria de criar. Posso ajudar com posts, carrosseis, reels e muito mais!',
    },
  ]);
  const [input, setInput] = useState('');
  const [briefConfirmed, setBriefConfirmed] = useState(false);
  const [pipelineActive, setPipelineActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const client = clients.find((c) => c.id === selectedClient);

  const briefData: BriefData | null = briefConfirmed
    ? {
        procedure: 'Implante Dentario',
        objective: 'Gerar leads qualificados para consulta de avaliacao',
        formats: ['Carrossel educativo', 'Reels antes/depois', 'Stories sequencia'],
        tone: client?.tone || 'Profissional',
        references: ['@implantes.expert', '@dica.odonto'],
      }
    : null;

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate assistant response
    setTimeout(() => {
      let response: string;
      if (!selectedClient) {
        response =
          'Por favor, selecione um cliente no menu acima antes de comecarmos a criar a campanha.';
      } else if (messages.length < 3) {
        response = `Otimo! Entendi que voce quer criar uma campanha para ${client?.name}. Vou montar o brief com base nas informacoes.\n\nProcedimento: Implante Dentario\nObjetivo: Gerar leads qualificados\nFormatos: Carrossel educativo, Reels antes/depois, Stories\nTom: ${client?.tone}\nReferencias: @implantes.expert, @dica.odonto\n\nDeseja confirmar este brief e iniciar a geracao?`;
      } else {
        response =
          'Brief confirmado! Iniciando o pipeline de geracao de conteudo. Voce pode acompanhar o progresso abaixo.';
        setBriefConfirmed(true);
        setPipelineActive(true);
        // Simulate pipeline progress
        let step = 1;
        const interval = setInterval(() => {
          setCurrentStep(step);
          step++;
          if (step > pipelineSteps.length) clearInterval(interval);
        }, 2000);
      }
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, role: 'assistant', content: response },
      ]);
    }, 1000);
  };

  const handleChip = (chip: string) => {
    setInput(chip);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Campanha</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crie campanhas de marketing conversando com a IA
        </p>
      </div>

      {/* Client Selector */}
      <div className="card !p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione o Cliente
        </label>
        <div className="relative">
          <select
            value={selectedClient ?? ''}
            onChange={(e) =>
              setSelectedClient(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full appearance-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
          >
            <option value="">Selecione um cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.specialty}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Client Summary Card */}
        {client && (
          <div className="mt-3 rounded-lg border border-dental-blue-100 bg-dental-blue-50/50 p-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Especialidade:</span>{' '}
                <span className="text-gray-600">{client.specialty}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cidade:</span>{' '}
                <span className="text-gray-600">{client.city}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Instagram:</span>{' '}
                <span className="text-dental-blue">{client.instagram}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tom:</span>{' '}
                <span className="text-gray-600">{client.tone}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {client.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-dental-blue-100 px-2.5 py-0.5 text-xs font-medium text-dental-blue-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brief Confirmation Card */}
      {briefData && (
        <div className="card border-dental-teal-200 bg-dental-teal-50/30">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-dental-teal" />
            <h3 className="font-semibold text-gray-900">Brief Confirmado</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-gray-700">Procedimento:</span>{' '}
              <span className="text-gray-600">{briefData.procedure}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Objetivo:</span>{' '}
              <span className="text-gray-600">{briefData.objective}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tom:</span>{' '}
              <span className="text-gray-600">{briefData.tone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Referencias:</span>{' '}
              <span className="text-gray-600">
                {briefData.references.join(', ')}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700">Formatos:</span>{' '}
              <span className="text-gray-600">
                {briefData.formats.join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Status */}
      {pipelineActive && (
        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900">
            Pipeline de Geracao
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {pipelineSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isDone = idx < currentStep;
              const isActive = idx === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                      isDone
                        ? 'bg-dental-teal text-white'
                        : isActive
                        ? 'bg-dental-blue text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium ${
                        isDone
                          ? 'text-dental-teal-700'
                          : isActive
                          ? 'text-dental-blue'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <div
                      className={`hidden h-0.5 w-6 sm:block ${
                        isDone ? 'bg-dental-teal' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Preview */}
      {currentStep >= pipelineSteps.length && (
        <div className="card border-green-200 bg-green-50/30">
          <h3 className="mb-3 font-semibold text-gray-900">
            Conteudo Gerado
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <div className="mx-auto mb-2 flex h-20 w-full items-center justify-center rounded-lg bg-gradient-to-br from-dental-blue-100 to-dental-teal-100">
                <Image className="h-8 w-8 text-dental-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Carrossel</p>
              <p className="text-xs text-gray-500">5 slides gerados</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <div className="mx-auto mb-2 flex h-20 w-full items-center justify-center rounded-lg bg-gradient-to-br from-dental-blue-100 to-dental-teal-100">
                <Video className="h-8 w-8 text-dental-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Reels</p>
              <p className="text-xs text-gray-500">1 video de 30s</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <div className="mx-auto mb-2 flex h-20 w-full items-center justify-center rounded-lg bg-gradient-to-br from-dental-blue-100 to-dental-teal-100">
                <Type className="h-8 w-8 text-dental-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Copy</p>
              <p className="text-xs text-gray-500">3 textos gerados</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn-primary">Ver Campanha Completa</button>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="card flex flex-col !p-0" style={{ height: '480px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'assistant'
                    ? 'bg-dental-blue-100 text-dental-blue-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'assistant'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-dental-blue text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className="rounded-full border border-dental-blue-200 bg-dental-blue-50 px-3 py-1.5 text-xs font-medium text-dental-blue-700 hover:bg-dental-blue-100 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Descreva a campanha que deseja criar..."
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-dental-blue focus:outline-none focus:ring-1 focus:ring-dental-blue"
            />
            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-dental-blue text-white hover:bg-dental-blue-700 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
