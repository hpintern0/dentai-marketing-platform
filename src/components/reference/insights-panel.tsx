'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface InsightSection {
  id: string;
  title: string;
  items: { label: string; value: string }[];
}

export interface InsightsPanelProps {
  open: boolean;
  onClose: () => void;
  profileName?: string;
  sections: InsightSection[];
  className?: string;
}

export function InsightsPanel({
  open,
  onClose,
  profileName,
  sections,
  className,
}: InsightsPanelProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
            {profileName && (
              <p className="text-sm text-gray-500">{profileName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-65px)] p-6 space-y-6">
          {sections.map((section) => (
            <div key={section.id}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <p className="text-xs font-medium text-gray-400 mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-12">
              Nenhum insight disponivel.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
