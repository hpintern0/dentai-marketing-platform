'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface SuggestionChip {
  label: string;
  value: string;
}

export interface BriefConfirmation {
  fields: Record<string, string>;
  onGerar: () => void;
  onEditar: () => void;
  onCancelar: () => void;
}

export interface PipelineInlineStatus {
  label: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  suggestions?: SuggestionChip[];
  onSuggestionClick?: (value: string) => void;
  briefConfirmation?: BriefConfirmation | null;
  pipelineStatuses?: PipelineInlineStatus[];
  placeholder?: string;
  className?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isTyping = false,
  suggestions,
  onSuggestionClick,
  briefConfirmation,
  pipelineStatuses,
  placeholder = 'Descreva sua campanha...',
  className,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                msg.role === 'user'
                  ? 'bg-hp-purple text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md',
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Brief confirmation card */}
        {briefConfirmation && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Confirmar Brief</p>
            <div className="space-y-2 mb-4">
              {Object.entries(briefConfirmation.fields).map(([key, val]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="font-medium text-gray-500 min-w-[120px]">{key}:</span>
                  <span className="text-gray-800">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={briefConfirmation.onGerar}>
                Gerar campanha
              </Button>
              <Button size="sm" variant="outline" onClick={briefConfirmation.onEditar}>
                Editar
              </Button>
              <Button size="sm" variant="ghost" onClick={briefConfirmation.onCancelar}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Pipeline inline statuses */}
        {pipelineStatuses && pipelineStatuses.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="space-y-2">
              {pipelineStatuses.map((ps, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {ps.status === 'running' && (
                    <div className="h-2 w-2 rounded-full bg-hp-purple animate-pulse" />
                  )}
                  {ps.status === 'complete' && (
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {ps.status === 'failed' && (
                    <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {ps.status === 'queued' && (
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  )}
                  <span className={cn(
                    'text-gray-700',
                    ps.status === 'running' && 'font-medium',
                  )}>
                    {ps.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex gap-2 px-4 pb-2 flex-wrap">
          {suggestions.map((chip) => (
            <button
              key={chip.value}
              onClick={() => onSuggestionClick?.(chip.value)}
              className="rounded-full border border-hp-purple-200 bg-hp-purple-50 px-3 py-1 text-xs text-hp-purple-700 hover:bg-hp-purple-100 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hp-purple-200 focus:border-hp-purple"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-7 7l7-7 7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
