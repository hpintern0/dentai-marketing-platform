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
      console.log(`[Socket.IO] Retry: ${data.agent_name} for ${data.campaign_id}`);
      try {
        const handlers = require('./pipeline/agents/index');
        const handler = handlers[data.agent_name];
        if (handler) {
          const job = {
            data: {
              ...data,
              ...(data.payload || {}),
              task_name: data.task_name || data.campaign_id,
            },
            name: data.agent_name,
          };
          handler(job).catch(console.error);
          socket.emit('pipeline:retry:ack', { success: true, status: 'running', agent_name: data.agent_name });
        } else {
          socket.emit('pipeline:retry:ack', { success: false, error: `No handler for ${data.agent_name}` });
        }
      } catch (err) {
        console.error('[Socket.IO] Retry failed:', err.message);
        socket.emit('pipeline:retry:ack', { success: false, error: err.message });
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
    console.log(`> HP Odonto server ready on http://${hostname}:${port}`);
  });
});
