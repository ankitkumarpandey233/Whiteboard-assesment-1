import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
    });

    return this.socket;
  }

  joinRoom(roomCode, userId, userName) {
    if (!this.socket) {
      this.connect();
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, 5000);

      this.socket.emit('join-room', { roomCode, userId, userName });
      
      this.socket.once('room-joined', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
      
      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Rest of the methods remain the same...
  sendCursorPosition(x, y) {
    if (this.socket && this.connected) {
      this.socket.emit('cursor-move', { x, y });
    }
  }

  startDrawing(x, y, color, strokeWidth) {
    if (this.socket && this.connected) {
      this.socket.emit('draw-start', { x, y, color, strokeWidth });
    }
  }

  drawing(x, y, prevX, prevY, color, strokeWidth) {
    if (this.socket && this.connected) {
      this.socket.emit('draw-move', { x, y, prevX, prevY, color, strokeWidth });
    }
  }

  endDrawing(path, color, strokeWidth) {
    if (this.socket && this.connected) {
      this.socket.emit('draw-end', { path, color, strokeWidth });
    }
  }

  clearCanvas() {
    if (this.socket && this.connected) {
      this.socket.emit('clear-canvas');
    }
  }

  onUserJoined(callback) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback) {
    this.socket?.on('user-left', callback);
  }

  onCursorUpdate(callback) {
    this.socket?.on('cursor-update', callback);
  }

  onDrawStart(callback) {
    this.socket?.on('draw-start', callback);
  }

  onDrawMove(callback) {
    this.socket?.on('draw-move', callback);
  }

  onDrawEnd(callback) {
    this.socket?.on('draw-end', callback);
  }

  onCanvasCleared(callback) {
    this.socket?.on('canvas-cleared', callback);
  }

  removeAllListeners() {
    const events = [
      'user-joined', 'user-left', 'cursor-update',
      'draw-start', 'draw-move', 'draw-end', 'canvas-cleared'
    ];
    
    events.forEach(event => {
      this.socket?.off(event);
    });
  }

  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export default new SocketService();