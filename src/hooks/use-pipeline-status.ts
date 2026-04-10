'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSocket, type PipelineEvent } from '@/lib/socket';

interface AgentStatus {
  job_name: string;
  status: 'queued' | 'running' | 'complete' | 'failed' | 'skipped';
  duration_ms?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
}

interface PipelineStatus {
  agents: AgentStatus[];
  overall_progress: number;
  current_phase: string;
  is_complete: boolean;
  has_errors: boolean;
}

const AGENT_ORDER = [
  'dental_research_agent',
  'dental_intelligence_agent',
  'ad_creative_designer',
  'carousel_agent',
  'video_ad_specialist',
  'copywriter_agent',
  'review_orchestrator',
  'cfo_compliance_reviewer',
  'copy_reviewer',
  'visual_reviewer',
  'dental_expert_reviewer',
  'issue_consolidator',
  'correction_agent',
  'distribution_agent',
];

export function usePipelineStatus(campaignId: string | null) {
  const [status, setStatus] = useState<PipelineStatus>({
    agents: AGENT_ORDER.map(name => ({ job_name: name, status: 'queued' })),
    overall_progress: 0,
    current_phase: 'idle',
    is_complete: false,
    has_errors: false,
  });

  useEffect(() => {
    if (!campaignId) return;

    const socket = getSocket();

    socket.emit('join:campaign', campaignId);

    const handleUpdate = (event: PipelineEvent) => {
      setStatus(prev => {
        const agents = prev.agents.map(agent => {
          if (agent.job_name === event.agent_name) {
            return {
              ...agent,
              status: event.status,
              duration_ms: event.duration_ms,
              notes: event.notes,
              ...(event.status === 'running' ? { started_at: event.timestamp } : {}),
              ...(event.status === 'complete' || event.status === 'failed' ? { completed_at: event.timestamp } : {}),
            };
          }
          return agent;
        });

        const completedCount = agents.filter(a => a.status === 'complete' || a.status === 'skipped').length;
        const totalActive = agents.filter(a => a.status !== 'skipped').length;
        const overall_progress = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;
        const has_errors = agents.some(a => a.status === 'failed');
        const is_complete = completedCount === totalActive;

        let current_phase = 'idle';
        const running = agents.find(a => a.status === 'running');
        if (running) {
          if (['dental_research_agent', 'dental_intelligence_agent'].includes(running.job_name)) current_phase = 'research';
          else if (['ad_creative_designer', 'carousel_agent', 'video_ad_specialist', 'copywriter_agent'].includes(running.job_name)) current_phase = 'creation';
          else if (running.job_name.includes('review') || running.job_name.includes('consolidator') || running.job_name.includes('correction')) current_phase = 'review';
          else if (running.job_name === 'distribution_agent') current_phase = 'distribution';
        }

        return { agents, overall_progress, current_phase, is_complete, has_errors };
      });
    };

    socket.on(`pipeline:${campaignId}`, handleUpdate);

    return () => {
      socket.off(`pipeline:${campaignId}`, handleUpdate);
      socket.emit('leave:campaign', campaignId);
    };
  }, [campaignId]);

  const retry = useCallback((agentName: string) => {
    if (!campaignId) return;
    const socket = getSocket();
    socket.emit('pipeline:retry', { campaign_id: campaignId, agent_name: agentName });
  }, [campaignId]);

  return { ...status, retry };
}
