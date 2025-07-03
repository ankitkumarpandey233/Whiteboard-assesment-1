const Room = require('../models/Room');

// Store active connections with more user info
const activeConnections = new Map(); // socketId -> {roomCode, userId, userName, color}
const roomUsers = new Map(); // roomCode -> Set of socketIds

// Generate random color for user cursor
const generateUserColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#48DBFB'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('👤 New client connected:', socket.id);

    // Handle joining a room
    socket.on('join-room', async (data) => {
      try {
        const { roomCode, userId, userName } = data;
        
        if (!roomCode) {
          socket.emit('error', { message: 'Room code is required' });
          return;
        }

        const normalizedCode = roomCode.toUpperCase();
        
        // Check if room exists in database
        const room = await Room.findOne({ roomCode: normalizedCode });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Leave previous room if any
        const currentConnection = activeConnections.get(socket.id);
        if (currentConnection) {
          socket.leave(currentConnection.roomCode);
          const users = roomUsers.get(currentConnection.roomCode);
          if (users) {
            users.delete(socket.id);
            if (users.size === 0) {
              roomUsers.delete(currentConnection.roomCode);
            }
          }
        }

        // Join new room
        socket.join(normalizedCode);
        
        // Store connection info with username
        const userInfo = {
          roomCode: normalizedCode,
          userId: userId || socket.id,
          userName: userName || 'Anonymous',
          color: generateUserColor(),
          socketId: socket.id
        };
        activeConnections.set(socket.id, userInfo);

        // Update room users
        if (!roomUsers.has(normalizedCode)) {
          roomUsers.set(normalizedCode, new Set());
        }
        roomUsers.get(normalizedCode).add(socket.id);

        // Update active users count in database
        room.activeUsers = roomUsers.get(normalizedCode).size;
        await room.updateActivity();

        // Send room data to the joining user
        socket.emit('room-joined', {
          roomCode: normalizedCode,
          userId: userInfo.userId,
          userName: userInfo.userName,
          userColor: userInfo.color,
          activeUsers: room.activeUsers,
          drawingData: room.drawingData
        });

        // Notify others in the room
        socket.to(normalizedCode).emit('user-joined', {
          userId: userInfo.userId,
          userName: userInfo.userName,
          color: userInfo.color,
          activeUsers: room.activeUsers
        });

        console.log(`✅ User ${userInfo.userName} (${userInfo.userId}) joined room ${normalizedCode}`);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle cursor movement - include username
    socket.on('cursor-move', (data) => {
      const connection = activeConnections.get(socket.id);
      if (!connection) return;

      // Broadcast cursor position to others in the same room
      socket.to(connection.roomCode).emit('cursor-update', {
        userId: connection.userId,
        userName: connection.userName,
        x: data.x,
        y: data.y,
        color: connection.color
      });
    });

    // Handle drawing start
    socket.on('draw-start', async (data) => {
      const connection = activeConnections.get(socket.id);
      if (!connection) return;

      const drawData = {
        userId: connection.userId,
        userName: connection.userName,
        x: data.x,
        y: data.y,
        color: data.color,
        strokeWidth: data.strokeWidth
      };

      socket.to(connection.roomCode).emit('draw-start', drawData);
    });

    // Handle drawing move
    socket.on('draw-move', async (data) => {
      const connection = activeConnections.get(socket.id);
      if (!connection) return;

      const drawData = {
        userId: connection.userId,
        userName: connection.userName,
        x: data.x,
        y: data.y,
        prevX: data.prevX,
        prevY: data.prevY,
        color: data.color,
        strokeWidth: data.strokeWidth
      };

      socket.to(connection.roomCode).emit('draw-move', drawData);
    });

    // Handle drawing end
    socket.on('draw-end', async (data) => {
      const connection = activeConnections.get(socket.id);
      if (!connection) return;

      try {
        // Save drawing stroke to database
        const room = await Room.findOne({ roomCode: connection.roomCode });
        if (room) {
          await room.addDrawingCommand({
            type: 'stroke',
            data: {
              path: data.path,
              color: data.color,
              strokeWidth: data.strokeWidth
            },
            userId: connection.userId,
            userName: connection.userName
          });
        }

        // Broadcast to others
        socket.to(connection.roomCode).emit('draw-end', {
          userId: connection.userId,
          userName: connection.userName,
          path: data.path,
          color: data.color,
          strokeWidth: data.strokeWidth
        });

      } catch (error) {
        console.error('Error saving drawing:', error);
      }
    });

    // Handle clear canvas
    socket.on('clear-canvas', async () => {
      const connection = activeConnections.get(socket.id);
      if (!connection) return;

      try {
        // Clear drawing data in database
        const room = await Room.findOne({ roomCode: connection.roomCode });
        if (room) {
          await room.clearDrawing();
        }

        // Broadcast to all users in room (including sender)
        io.to(connection.roomCode).emit('canvas-cleared', {
          clearedBy: connection.userName
        });

      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('👤 Client disconnected:', socket.id);
      
      const connection = activeConnections.get(socket.id);
      if (connection) {
        // Remove from room users
        const users = roomUsers.get(connection.roomCode);
        if (users) {
          users.delete(socket.id);
          
          // Update active users count
          try {
            const room = await Room.findOne({ roomCode: connection.roomCode });
            if (room) {
              room.activeUsers = users.size;
              await room.save();
            }
          } catch (error) {
            console.error('Error updating active users:', error);
          }

          // Notify others in room
          socket.to(connection.roomCode).emit('user-left', {
            userId: connection.userId,
            userName: connection.userName,
            activeUsers: users.size
          });

          // Clean up empty room
          if (users.size === 0) {
            roomUsers.delete(connection.roomCode);
          }
        }

        // Remove connection info
        activeConnections.delete(socket.id);
      }
    });
  });
};

module.exports = handleSocketConnection;