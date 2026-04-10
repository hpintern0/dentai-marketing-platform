'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const colorStyles = {
  blue: 'bg-hp-purple',
  green: 'bg-dental-green',
  teal: 'bg-hp-accent',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-400',
} as const;

export interface ProgressProps {
  value: number;
  max?: number;
  color?: keyof typeof colorStyles;
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  color = 'blue',
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-gray-600">
          <span>Progresso</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorStyles[color],
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
