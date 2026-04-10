'use client';

import { useState, useCallback, useRef } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'brief_confirmation' | 'pipeline_status' | 'result_preview';
  metadata?: Record<string, any>;
  created_at: string;
}

interface ParsedBrief {
  format: string[];
  slides?: number;
  procedure_focus: string;
  campaign_objective: string;
  tone: string;
  restrictions: string[];
  platform_targets: string[];
  visual_notes?: string;
}

interface BriefParserOutput {
  client_id: string;
  raw_brief: string;
  parsed: ParsedBrief;
  inferred_fields: string[];
  ambiguities: string[];
  confirmation_required: boolean;
}

export function useChat(clientId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<BriefParserOutput | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const messageIdCounter = useRef(0);

  const createMessage = (role: 'user' | 'assistant' | 'system', content: string, type?: string, metadata?: any): ChatMessage => ({
    id: `msg_${++messageIdCounter.current}`,
    role,
    content,
    type: type as any || 'text',
    metadata,
    created_at: new Date().toISOString(),
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!clientId || !content.trim()) return;

    const userMessage = createMessage('user', content);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/campaigns/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          message: content,
          campaign_id: campaignId,
          history: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (data.type === 'brief_confirmation') {
        setCurrentBrief(data.brief);
        const assistantMessage = createMessage('assistant', data.message, 'brief_confirmation', { brief: data.brief });
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data.type === 'clarification') {
        const assistantMessage = createMessage('assistant', data.message);
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage = createMessage('assistant', data.message);
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage = createMessage('system', 'Erro ao processar mensagem. Tente novamente.', 'text');
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, campaignId, messages]);

  const confirmBrief = useCallback(async () => {
    if (!currentBrief || !clientId) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          name: `${currentBrief.parsed.procedure_focus}_${new Date().toISOString().split('T')[0]}`,
          raw_brief: currentBrief.raw_brief,
          parsed_brief: currentBrief.parsed,
          status: 'generating',
          job_payload: {
            task_name: currentBrief.parsed.procedure_focus.replace(/\s+/g, '_').toLowerCase(),
            task_date: new Date().toISOString().split('T')[0],
            client_id: clientId,
            procedure_focus: currentBrief.parsed.procedure_focus,
            campaign_objective: currentBrief.parsed.campaign_objective,
            platform_targets: currentBrief.parsed.platform_targets,
            tone: currentBrief.parsed.tone,
            skip_research: false,
            skip_image: !currentBrief.parsed.format.includes('feed_static'),
            skip_video: !currentBrief.parsed.format.includes('reels'),
            skip_carousel: !currentBrief.parsed.format.includes('carousel'),
          },
        }),
      });

      const campaign = await response.json();
      setCampaignId(campaign.id);

      // Start pipeline
      await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign.job_payload),
      });

      const statusMessage = createMessage('assistant', 'Pipeline iniciado! Acompanhe o progresso abaixo.', 'pipeline_status', { campaign_id: campaign.id });
      setMessages(prev => [...prev, statusMessage]);
      setCurrentBrief(null);
    } catch (error) {
      const errorMessage = createMessage('system', 'Erro ao iniciar campanha. Tente novamente.', 'text');
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentBrief, clientId]);

  const cancelBrief = useCallback(() => {
    setCurrentBrief(null);
    const msg = createMessage('assistant', 'Briefing cancelado. Me diga o que você gostaria de criar.');
    setMessages(prev => [...prev, msg]);
  }, []);

  return {
    messages,
    isLoading,
    currentBrief,
    campaignId,
    sendMessage,
    confirmBrief,
    cancelBrief,
  };
}
