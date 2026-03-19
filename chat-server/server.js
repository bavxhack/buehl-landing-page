import http from 'node:http';
import { Server } from 'socket.io';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const allowedOrigin = process.env.CHAT_ALLOWED_ORIGIN ?? '*';

const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
  },
});

const users = new Map();

const sanitizeText = (value) => String(value ?? '').trim().slice(0, 1000);
const sanitizeName = (value) => String(value ?? '').trim().slice(0, 80);
const serializeUsers = () => Array.from(users.values())
  .sort((left, right) => left.name.localeCompare(right.name, 'de', { sensitivity: 'base' }));

const emitPresence = () => {
  io.emit('presence:update', serializeUsers());
};

io.on('connection', (socket) => {
  const userId = sanitizeText(socket.handshake.auth?.userId ?? socket.handshake.query.userId);
  const name = sanitizeName(socket.handshake.auth?.name ?? socket.handshake.query.name);
  const email = sanitizeText(socket.handshake.auth?.email ?? socket.handshake.query.email);

  if (!userId || !name) {
    socket.emit('chat:error', 'Benutzerdaten fehlen für den Chat.');
    socket.disconnect(true);
    return;
  }

  const user = {
    socketId: socket.id,
    userId,
    name,
    email,
    onlineSince: new Date().toISOString(),
  };

  users.set(socket.id, user);
  emitPresence();

  socket.on('chat:private-message', (payload = {}) => {
    const recipientSocketId = sanitizeText(payload.recipientSocketId);
    const text = sanitizeText(payload.text);

    if (!recipientSocketId || !text) {
      return;
    }

    const recipient = users.get(recipientSocketId);
    const sender = users.get(socket.id);

    if (!recipient || !sender) {
      socket.emit('chat:error', 'Der ausgewählte Kontakt ist nicht mehr online.');
      emitPresence();
      return;
    }

    const message = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      createdAt: new Date().toISOString(),
      from: {
        socketId: sender.socketId,
        userId: sender.userId,
        name: sender.name,
      },
      to: {
        socketId: recipient.socketId,
        userId: recipient.userId,
        name: recipient.name,
      },
    };

    socket.emit('chat:private-message', message);
    io.to(recipientSocketId).emit('chat:private-message', message);
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    emitPresence();
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Chat server listening on port ${port}`);
});
