const Message = require('../models/Message');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins their own personal room to receive private messages
    socket.on('setup', (userData) => {
      if (!userData) return;
      const userId = (userData._id || userData.id || userData).toString();
      socket.join(userId);
      socket.emit('connected');
    });

    // Handle joining a specific conversation room
    socket.on('join chat', (room) => {
      if (!room) return;
      socket.join(room.toString());
    });

    // Handle sending messages
    socket.on('new message', async (newMessageData) => {
      try {
        const msg = newMessageData.message || newMessageData;
        const chat = newMessageData.conversation || msg.conversation;
        if (!chat || !chat.participants) return;

        const senderId = (msg.sender?._id || msg.sender || '').toString();

        // Emit message to all other participants in the conversation
        chat.participants.forEach((user) => {
          const recipientId = (user._id || user.id || user).toString();
          if (recipientId === senderId) return;

          // Send to the recipient's personal room
          io.to(recipientId).emit('message received', newMessageData);
        });
      } catch (error) {
        console.error('Socket new message error:', error);
      }
    });

    // Typing indicators
    socket.on('typing', (room) => {
      if (room) socket.to(room.toString()).emit('typing');
    });
    socket.on('stop typing', (room) => {
      if (room) socket.to(room.toString()).emit('stop typing');
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });
};

module.exports = socketHandler;
