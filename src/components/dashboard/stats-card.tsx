'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const colorStyles = {
  blue: 'bg-dental-blue-50 text-dental-blue-600',
  teal: 'bg-dental-teal-50 text-dental-teal-600',
  green: 'bg-dental-green-50 text-dental-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  gray: 'bg-gray-50 text-gray-600',
} as const;

export interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string;
  };
  color?: keyof typeof colorStyles;
  className?: string;
}

export function StatsCard({
  icon,
  title,
  value,
  trend,
  color = 'blue',
  className,
}: StatsCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            colorStyles[color],
          )}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700',
            )}
          >
            <svg
              className={cn('h-3 w-3', !isPositive && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {trend?.label && (
          <p className="mt-0.5 text-xs text-gray-400">{trend.label}</p>
        )}
      </div>
    </div>
  );
}
