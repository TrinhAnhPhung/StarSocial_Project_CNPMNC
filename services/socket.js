import io from 'socket.io-client';
import API_BASE_URL from '../constants/apiConfig';

// Remove '/api' from the base URL to get the root URL for socket
const SOCKET_URL = API_BASE_URL.replace('/api', '');

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      console.log('🔌 Connecting to socket at:', SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.log('⚠️ Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(conversationId) {
    if (this.socket) {
      this.socket.emit('join_room', conversationId);
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  sendTyping(data) {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  sendStopTyping(data) {
    if (this.socket) {
      this.socket.emit('stop_typing', data);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
