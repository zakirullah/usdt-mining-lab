/**
 * Shiba Mining Lab - Mining Engine Service
 * 
 * This service handles:
 * - Real-time WebSocket connections
 * - Random activity notifications
 * - Mining status updates
 * 
 * Note: Mining calculations are done client-side for demonstration.
 * In production, this would integrate with the main database.
 */

import { Server } from 'socket.io';
import { createServer } from 'http';

const PORT = 3003;

// Create HTTP server and Socket.IO
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store connected clients
const connectedUsers = new Map<string, string>(); // socketId -> userId

// Generate random activity for popups
function generateRandomActivity() {
  const activities = [
    { type: 'deposit', messages: ['just deposited', 'invested', 'added'] },
    { type: 'withdraw', messages: ['just withdrew', 'cashed out', 'received'] },
    { type: 'register', messages: ['just joined', 'signed up to', 'registered on'] }
  ];

  const names = ['Ahmed', 'Ali', 'Mohammed', 'Sara', 'Fatima', 'Omar', 'Khalid', 'Yusuf', 'Aisha', 'Layla', 'John', 'Mike', 'David', 'Emma', 'Sophia', 'James', 'Robert', 'Maria', 'Lisa', 'Anna'];
  
  const activity = activities[Math.floor(Math.random() * activities.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  const message = activity.messages[Math.floor(Math.random() * activity.messages.length)];
  const amount = Math.floor(Math.random() * 500 + 50);

  let fullMessage = '';
  if (activity.type === 'register') {
    fullMessage = `${name} ${message} Shiba Mining Lab`;
  } else {
    fullMessage = `${name} ${message} ${amount} USDT`;
  }

  return {
    type: activity.type,
    message: fullMessage,
    amount: activity.type !== 'register' ? amount : undefined,
    timestamp: new Date().toISOString()
  };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // User identifies themselves
  socket.on('identify', (userId: string) => {
    connectedUsers.set(socket.id, userId);
    console.log(`User ${userId} identified on socket ${socket.id}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });

  // Send initial data
  socket.emit('connected', { 
    message: 'Connected to mining engine',
    serverTime: new Date().toISOString()
  });
});

// Emit random activities every 8-15 seconds
setInterval(() => {
  const activity = generateRandomActivity();
  io.emit('activity', activity);
}, 8000 + Math.random() * 7000);

// Start server
httpServer.listen(PORT, () => {
  console.log(`⛏️ Mining Engine running on port ${PORT}`);
  console.log('📡 WebSocket server ready for connections');
  console.log('🔔 Activity notifications will be broadcast automatically');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down mining engine...');
  io.close();
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down mining engine...');
  io.close();
  httpServer.close();
  process.exit(0);
});
