import { io } from 'socket.io-client';

class NotificationService {
  constructor() {
    this.socket = null;
    this.handlers = new Map();
  }

  connect(token) {
    this.socket = io(process.env.REACT_APP_API_URL, {
      auth: { token }
    });

    this.socket.on('storage_booking_update', (data) => {
      this.notifyHandlers('storage_booking', data);
    });

    this.socket.on('event_reminder', (data) => {
      this.notifyHandlers('event_reminder', data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);

    return () => {
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  notifyHandlers(event, data) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  joinEvent(eventId) {
    if (this.socket) {
      this.socket.emit('join_event', eventId);
    }
  }

  leaveEvent(eventId) {
    if (this.socket) {
      this.socket.emit('leave_event', eventId);
    }
  }
}

export const notificationService = new NotificationService(); 