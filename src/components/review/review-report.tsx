'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ReviewIssue {
  id: string;
  description: string;
  severity: IssueSeverity;
  field?: string;
}

export interface ReviewPiece {
  id: string;
  name: string;
  status: 'aprovado' | 'reprovado' | 'revisao_humana';
  issues: ReviewIssue[];
}

export interface ReviewRound {
  round: number;
  score: number;
  maxScore: number;
  pieces: ReviewPiece[];
  timestamp?: string;
}

export interface ReviewReportProps {
  rounds: ReviewRound[];
  className?: string;
}

const severityStyles: Record<IssueSeverity, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const severityLabels: Record<IssueSeverity, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
};

function ScoreDisplay({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const color =
    percentage >= 80
      ? 'text-green-600'
      : percentage >= 60
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div className="flex items-baseline gap-1">
      <span className={cn('text-2xl font-bold', color)}>{score}</span>
      <span className="text-sm text-gray-400">/ {maxScore}</span>
    </div>
  );
}

export function ReviewReport({ rounds, className }: ReviewReportProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {rounds.map((round) => (
        <Card key={round.round}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rodada {round.round}</CardTitle>
                {round.timestamp && (
                  <p className="text-xs text-gray-400 mt-1">{round.timestamp}</p>
                )}
              </div>
              <ScoreDisplay score={round.score} maxScore={round.maxScore} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {round.pieces.map((piece) => (
                <div
                  key={piece.id}
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-800">
                      {piece.name}
                    </h4>
                    <Badge variant={piece.status as BadgeVariant}>
                      {piece.status === 'revisao_humana'
                        ? 'Revisao humana'
                        : piece.status}
                    </Badge>
                  </div>

                  {piece.issues.length > 0 ? (
                    <ul className="space-y-1.5">
                      {piece.issues.map((issue) => (
                        <li
                          key={issue.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span
                            className={cn(
                              'mt-0.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium shrink-0',
                              severityStyles[issue.severity],
                            )}
                          >
                            {severityLabels[issue.severity]}
                          </span>
                          <span className="text-gray-700">
                            {issue.field && (
                              <span className="font-medium">{issue.field}: </span>
                            )}
                            {issue.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400">Sem problemas encontrados.</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
