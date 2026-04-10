'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/badge';

export type StepStatus = 'queued' | 'running' | 'complete' | 'failed' | 'skipped';

export interface PipelineStep {
  id: string;
  name: string;
  status: StepStatus;
  duration?: string;
}

export interface PipelineTrackerProps {
  steps: PipelineStep[];
  className?: string;
}

const statusIcons: Record<StepStatus, React.ReactNode> = {
  queued: (
    <div className="h-3 w-3 rounded-full border-2 border-gray-300 bg-white" />
  ),
  running: (
    <div className="relative h-3 w-3">
      <div className="absolute inset-0 animate-ping rounded-full bg-hp-purple-400 opacity-50" />
      <div className="h-3 w-3 rounded-full bg-hp-purple" />
    </div>
  ),
  complete: (
    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  failed: (
    <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  skipped: (
    <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  ),
};

const connectorColors: Record<StepStatus, string> = {
  queued: 'bg-gray-200',
  running: 'bg-hp-purple-200',
  complete: 'bg-green-400',
  failed: 'bg-red-300',
  skipped: 'bg-yellow-300',
};

export function PipelineTracker({ steps, className }: PipelineTrackerProps) {
  return (
    <div className={cn('flex items-start gap-0', className)}>
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-start flex-1 last:flex-none">
          {/* Step */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2',
                step.status === 'queued' && 'border-gray-200 bg-gray-50',
                step.status === 'running' && 'border-hp-purple-300 bg-hp-purple-50',
                step.status === 'complete' && 'border-green-300 bg-green-50',
                step.status === 'failed' && 'border-red-300 bg-red-50',
                step.status === 'skipped' && 'border-yellow-300 bg-yellow-50',
              )}
            >
              {statusIcons[step.status]}
            </div>
            <p className="mt-2 text-xs font-medium text-gray-700 text-center max-w-[80px]">
              {step.name}
            </p>
            {step.duration && (
              <p className="text-[10px] text-gray-400">{step.duration}</p>
            )}
            <Badge variant={step.status as BadgeVariant} className="mt-1">
              {step.status}
            </Badge>
          </div>

          {/* Connector */}
          {idx < steps.length - 1 && (
            <div className="mt-3.5 flex-1 mx-1">
              <div
                className={cn(
                  'h-0.5 w-full rounded-full',
                  connectorColors[step.status],
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
