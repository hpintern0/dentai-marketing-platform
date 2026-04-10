const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/api/socketio',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Track campaign rooms
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join:campaign', (campaignId) => {
      socket.join(`campaign:${campaignId}`);
      console.log(`[Socket.IO] ${socket.id} joined campaign:${campaignId}`);
    });

    socket.on('leave:campaign', (campaignId) => {
      socket.leave(`campaign:${campaignId}`);
    });

    socket.on('pipeline:retry', async (data) => {
      console.log(`[Socket.IO] Retry requested: ${data.agent_name} for campaign ${data.campaign_id}`);
      try {
        const { enqueueJob } = require('./pipeline/queue');
        await enqueueJob(data.agent_name, {
          task_name: data.task_name || `retry_${data.campaign_id}_${Date.now()}`,
          campaign_id: data.campaign_id,
          ...(data.payload || {}),
        });
        socket.emit('pipeline:retry:ack', { status: 'queued', agent_name: data.agent_name });
      } catch (err) {
        console.error('[Socket.IO] Failed to queue retry job:', err.message);
        socket.emit('pipeline:retry:ack', { status: 'error', error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Export io for use in pipeline worker
  global.__io = io;

  // Helper to emit pipeline events
  global.emitPipelineEvent = (campaignId, event) => {
    io.to(`campaign:${campaignId}`).emit(`pipeline:${campaignId}`, {
      ...event,
      timestamp: new Date().toISOString(),
    });
  };

  server.listen(port, hostname, () => {
    console.log(`> DentAI server ready on http://${hostname}:${port}`);
  });
});
