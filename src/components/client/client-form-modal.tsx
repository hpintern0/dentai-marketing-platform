'use client';

import React, { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  DENTAL_SPECIALTIES,
  TONE_OPTIONS,
  PLATFORM_OPTIONS,
} from '@/lib/constants';
import type { Client, ColorPalette, Typography, Platform } from '@/types';
import { Upload, Plus, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientFormData {
  name: string;
  specialty: string;
  city: string;
  state: string;
  instagram_handle: string;
  cro_number: string;
  tone: string;
  color_palette: ColorPalette & { accent2: string };
  typography: Typography;
  active_platforms: Platform[];
  default_ctas: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

export interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (client: Client) => void;
  /** Pass an existing client to switch to edit mode */
  client?: Client | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY_FORM: ClientFormData = {
  name: '',
  specialty: '',
  city: '',
  state: '',
  instagram_handle: '',
  cro_number: '',
  tone: '',
  color_palette: {
    primary: '#1E40AF',
    secondary: '#0D9488',
    accent: '#F59E0B',
    accent2: '#8B5CF6',
    background: '#FFFFFF',
    text: '#111827',
  },
  typography: {
    heading_font: '',
    body_font: '',
  },
  active_platforms: [],
  default_ctas: [],
};

function clientToForm(client: Client): ClientFormData {
  return {
    name: client.name,
    specialty: client.specialty,
    city: client.city,
    state: client.state,
    instagram_handle: client.instagram_handle,
    cro_number: client.cro_number,
    tone: client.tone,
    color_palette: {
      primary: client.color_palette.primary,
      secondary: client.color_palette.secondary,
      accent: client.color_palette.accent,
      accent2: '#8B5CF6',
      background: client.color_palette.background,
      text: client.color_palette.text,
    },
    typography: { ...client.typography },
    active_platforms: [...client.active_platforms],
    default_ctas: [...client.default_ctas],
  };
}

const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const COLOR_LABELS: { key: keyof (ColorPalette & { accent2: string }); label: string }[] = [
  { key: 'primary', label: 'Primaria' },
  { key: 'secondary', label: 'Secundaria' },
  { key: 'accent', label: 'Destaque' },
  { key: 'accent2', label: 'Destaque 2' },
  { key: 'background', label: 'Fundo' },
  { key: 'text', label: 'Texto' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientFormModal({
  open,
  onClose,
  onSuccess,
  client,
}: ClientFormModalProps) {
  const isEdit = Boolean(client);

  const [form, setForm] = useState<ClientFormData>(
    client ? clientToForm(client) : { ...EMPTY_FORM, default_ctas: [] },
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [newCta, setNewCta] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (open) {
      setForm(client ? clientToForm(client) : { ...EMPTY_FORM, default_ctas: [] });
      setErrors({});
      setNewCta('');
    }
  }, [open, client]);

  // ------ field helpers ------

  const set = useCallback(
    <K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const setColor = useCallback(
    (key: keyof (ColorPalette & { accent2: string }), value: string) => {
      setForm((prev) => ({
        ...prev,
        color_palette: { ...prev.color_palette, [key]: value },
      }));
    },
    [],
  );

  const setTypography = useCallback(
    (key: keyof Typography, value: string) => {
      setForm((prev) => ({
        ...prev,
        typography: { ...prev.typography, [key]: value },
      }));
    },
    [],
  );

  const togglePlatform = useCallback((platform: Platform) => {
    setForm((prev) => {
      const platforms = prev.active_platforms.includes(platform)
        ? prev.active_platforms.filter((p) => p !== platform)
        : [...prev.active_platforms, platform];
      return { ...prev, active_platforms: platforms };
    });
  }, []);

  const addCta = useCallback(() => {
    const trimmed = newCta.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      default_ctas: [...prev.default_ctas, trimmed],
    }));
    setNewCta('');
  }, [newCta]);

  const removeCta = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      default_ctas: prev.default_ctas.filter((_, i) => i !== index),
    }));
  }, []);

  // ------ validation ------

  function validate(): boolean {
    const errs: ValidationErrors = {};
    if (!form.name.trim()) errs.name = 'Nome e obrigatorio';
    if (!form.specialty) errs.specialty = 'Especialidade e obrigatoria';
    if (!form.city.trim()) errs.city = 'Cidade e obrigatoria';
    if (!form.state) errs.state = 'Estado e obrigatorio';
    if (!form.cro_number.trim()) errs.cro_number = 'CRO e obrigatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ------ submit ------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { accent2, ...paletteRest } = form.color_palette;
      const payload = {
        ...form,
        color_palette: paletteRest,
      };

      const url = isEdit ? `/api/clients/${client!.id}` : '/api/clients';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Erro ao salvar cliente');
      }

      const saved: Client = await res.json();
      onSuccess?.(saved);
      onClose();
    } catch (err: any) {
      setErrors({ _form: err.message ?? 'Erro inesperado' });
    } finally {
      setLoading(false);
    }
  }

  // ------ drag & drop (logo placeholder) ------

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Logo upload logic would go here
  }, []);

  // ------ render ------

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}
      className="max-w-3xl max-h-[90vh] flex flex-col"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="client-form"
            loading={loading}
          >
            {isEdit ? 'Salvar Alteracoes' : 'Criar Cliente'}
          </Button>
        </>
      }
    >
      {errors._form && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors._form}
        </div>
      )}

      <form
        id="client-form"
        onSubmit={handleSubmit}
        className="space-y-6 overflow-y-auto max-h-[60vh] pr-1"
      >
        {/* ---- Basic Info ---- */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-900">
            Informacoes Basicas
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome *"
              placeholder="Ex: Dr. Ricardo Silva"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={errors.name}
            />
            <Select
              label="Especialidade *"
              placeholder="Selecione..."
              options={[...DENTAL_SPECIALTIES]}
              value={form.specialty}
              onChange={(e) => set('specialty', e.target.value)}
              error={errors.specialty}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Cidade *"
              placeholder="Sao Paulo"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              error={errors.city}
            />
            <Select
              label="Estado *"
              placeholder="UF"
              options={BRAZILIAN_STATES.map((s) => ({ value: s, label: s }))}
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              error={errors.state}
            />
            <Input
              label="CRO *"
              placeholder="CRO-SP 12345"
              value={form.cro_number}
              onChange={(e) => set('cro_number', e.target.value)}
              error={errors.cro_number}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Instagram"
              placeholder="@seuinstagram"
              value={form.instagram_handle}
              onChange={(e) => set('instagram_handle', e.target.value)}
            />
          </div>
        </fieldset>

        {/* ---- Logo Upload ---- */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-gray-900">Logo</legend>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
              dragOver
                ? 'border-dental-blue bg-dental-blue-50'
                : 'border-gray-300 hover:border-dental-blue-300 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Arraste o logo aqui ou{' '}
              <span className="font-medium text-dental-blue">
                clique para selecionar
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG ou SVG. Max 2MB.
            </p>
          </div>
        </fieldset>

        {/* ---- Tone ---- */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-900">
            Tom de Voz
          </legend>
          <Select
            label="Tom"
            placeholder="Selecione o tom..."
            options={[...TONE_OPTIONS]}
            value={form.tone}
            onChange={(e) => set('tone', e.target.value)}
          />
        </fieldset>

        {/* ---- Color Palette ---- */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-900">
            Paleta de Cores
          </legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {COLOR_LABELS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color_palette[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-gray-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={form.color_palette[key]}
                    onChange={(e) => setColor(key, e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-dental-blue focus:outline-none focus:ring-2 focus:ring-dental-blue-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {/* ---- Typography ---- */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-900">
            Tipografia
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Fonte de Titulos"
              placeholder="Ex: Montserrat"
              value={form.typography.heading_font}
              onChange={(e) => setTypography('heading_font', e.target.value)}
            />
            <Input
              label="Fonte de Corpo"
              placeholder="Ex: Inter"
              value={form.typography.body_font}
              onChange={(e) => setTypography('body_font', e.target.value)}
            />
          </div>
        </fieldset>

        {/* ---- Active Platforms ---- */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">
            Plataformas Ativas
          </legend>
          <div className="flex flex-wrap gap-3">
            {PLATFORM_OPTIONS.map((opt) => {
              const checked = form.active_platforms.includes(
                opt.value as Platform,
              );
              return (
                <label
                  key={opt.value}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    checked
                      ? 'border-dental-blue bg-dental-blue-50 text-dental-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlatform(opt.value as Platform)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-white transition-colors ${
                      checked
                        ? 'border-dental-blue bg-dental-blue'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {checked && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* ---- Default CTAs ---- */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">
            CTAs Padrao
          </legend>

          {form.default_ctas.length > 0 && (
            <ul className="space-y-2">
              {form.default_ctas.map((cta, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                >
                  <span className="flex-1">{cta}</span>
                  <button
                    type="button"
                    onClick={() => removeCta(idx)}
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Ex: Agende sua avaliacao"
              value={newCta}
              onChange={(e) => setNewCta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCta();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={addCta}
              iconLeft={<Plus className="h-4 w-4" />}
            >
              Adicionar
            </Button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
