const socketIO = require('socket.io');

const handleRequirementUpdate = (io, eventId, update) => {
  io.to(`event_${eventId}`).emit(`requirement_update_${eventId}`, update);
};

const handleStorageBookingUpdate = (io, eventId, update) => {
  io.to(`event_${eventId}`).emit(`storage_booking_${eventId}`, update);
};

const handleRequirementNotification = (io, userId, notification) => {
  io.to(userId).emit('requirement_request', notification);
};

const handleRequirementStatusUpdate = (io, eventId, update) => {
  io.to(`event_${eventId}`).emit(`requirement_update_${eventId}`, update);
};

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room for private notifications
    socket.on('join_user', (userId) => {
      socket.join(userId);
    });

    // Join NGO room for verification updates
    socket.on('join_ngo_room', () => {
      socket.join('ngo_verifications');
    });

    // Join event room for event updates
    socket.on('join_event', (eventId) => {
      socket.join(`event_${eventId}`);
    });

    socket.on('leave_event', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return {
    io,
    handleRequirementUpdate,
    handleStorageBookingUpdate,
    handleRequirementNotification,
    handleRequirementStatusUpdate
  };
};

module.exports = initializeSocket; 