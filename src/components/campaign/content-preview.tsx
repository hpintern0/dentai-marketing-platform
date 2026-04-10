'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export type ContentType = 'image' | 'copy' | 'video';
export type ApprovalStatus = 'pending' | 'aprovado' | 'reprovado';

export interface ContentPiece {
  id: string;
  type: ContentType;
  title: string;
  platform?: string;
  imageUrl?: string;
  copyText?: string;
  videoDescription?: string;
  status: ApprovalStatus;
}

export interface ContentPreviewProps {
  pieces: ContentPiece[];
  onApprove: (pieceId: string) => void;
  onReject: (pieceId: string) => void;
  className?: string;
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 uppercase tracking-wide">
      {platform}
    </span>
  );
}

function ContentPieceCard({
  piece,
  onApprove,
  onReject,
}: {
  piece: ContentPiece;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-800">{piece.title}</h4>
            {piece.platform && <PlatformBadge platform={piece.platform} />}
          </div>
          {piece.status !== 'pending' && (
            <Badge variant={piece.status === 'aprovado' ? 'aprovado' : 'reprovado'}>
              {piece.status}
            </Badge>
          )}
        </div>

        {/* Image preview */}
        {piece.type === 'image' && piece.imageUrl && (
          <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <img
              src={piece.imageUrl}
              alt={piece.title}
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        {/* Copy preview */}
        {piece.type === 'copy' && piece.copyText && (
          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{piece.copyText}</p>
          </div>
        )}

        {/* Video concept preview */}
        {piece.type === 'video' && piece.videoDescription && (
          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-500">Conceito de Video</span>
            </div>
            <p className="text-sm text-gray-700">{piece.videoDescription}</p>
          </div>
        )}

        {/* Actions */}
        {piece.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={onApprove}>
              Aprovar
            </Button>
            <Button size="sm" variant="danger" onClick={onReject}>
              Rejeitar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ContentPreview({
  pieces,
  onApprove,
  onReject,
  className,
}: ContentPreviewProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>
      {pieces.map((piece) => (
        <ContentPieceCard
          key={piece.id}
          piece={piece}
          onApprove={() => onApprove(piece.id)}
          onReject={() => onReject(piece.id)}
        />
      ))}
    </div>
  );
}
