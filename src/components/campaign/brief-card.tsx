'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export interface BriefField {
  label: string;
  value: string;
  inferred?: boolean;
}

export interface BriefCardProps {
  fields: BriefField[];
  onGerar: () => void;
  onEditar: () => void;
  onCancelar: () => void;
  loading?: boolean;
  className?: string;
}

export function BriefCard({
  fields,
  onGerar,
  onEditar,
  onCancelar,
  loading = false,
  className,
}: BriefCardProps) {
  return (
    <Card className={cn('w-full max-w-lg', className)}>
      <CardHeader>
        <CardTitle>Resumo do Brief</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {field.label}
                </span>
                {field.inferred && (
                  <span className="rounded bg-dental-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-dental-blue-600">
                    inferido
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-800">{field.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={onGerar} loading={loading}>
          Gerar campanha
        </Button>
        <Button variant="outline" onClick={onEditar} disabled={loading}>
          Editar
        </Button>
        <Button variant="ghost" onClick={onCancelar} disabled={loading}>
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  );
}
