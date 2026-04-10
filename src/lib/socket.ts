import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Event types
export interface PipelineEvent {
  campaign_id: string;
  agent_name: string;
  status: 'queued' | 'running' | 'complete' | 'failed' | 'skipped';
  progress: number;
  duration_ms?: number;
  notes?: string;
  timestamp: string;
}

export interface ApprovalEvent {
  campaign_id: string;
  piece_id: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}
