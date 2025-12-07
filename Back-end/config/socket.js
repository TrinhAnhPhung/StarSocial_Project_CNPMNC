import { Server } from 'socket.io';
import { sendMessage } from '../controllers/chatController.js';
import { socketCorsOptions } from '../config/cors.js';

// Khởi tạo Socket.io server
export const initializeSocket = (server) => {
  const io = new Server(server, { cors: socketCorsOptions });

  io.on('connection', (socket) => {
    console.log(`✅ [Socket] Người dùng đã kết nối: ${socket.id}`);

    // Tham gia phòng chat
    socket.on('join_room', (conversationId) => {
      const roomName = String(conversationId);
      socket.join(roomName);
      console.log(`[Socket] User ${socket.id} đã tham gia phòng: ${roomName}`);
    });

    // Gửi tin nhắn
    socket.on('send_message', async (data) => {
      const { conversationId, senderId, content } = data;
      try {
        const newMessage = await sendMessage(conversationId, senderId, content);
        const roomName = String(conversationId);
        io.to(roomName).emit('receive_message', newMessage);
        console.log(`[Socket] Đã gửi tin nhắn ${newMessage.Message_id} đến phòng ${roomName}`);
      } catch (error) {
        console.error("❌ [Socket] Lỗi khi xử lý send_message:", error);
      }
    });

    // Thu hồi tin nhắn
    socket.on('message_deleted_by_sender', (data) => {
      const { conversationId, messageId, newContent } = data;
      const roomName = String(conversationId);
      io.to(roomName).emit('message_deleted_update', {
        messageId,
        conversationId,
        newContent
      });
      console.log(`[Socket] Đã thu hồi tin nhắn ${messageId} trong phòng ${roomName}`);
    });

    // Đang nhập
    socket.on('typing', (data) => {
      const { conversationId, userId, userName } = data;
      const roomName = String(conversationId);
      socket.to(roomName).emit('user_typing', { userId, userName });
    });

    // Dừng nhập
    socket.on('stop_typing', (data) => {
      const { conversationId, userId } = data;
      const roomName = String(conversationId);
      socket.to(roomName).emit('user_stopped_typing', { userId });
    });

    // Ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`🔌 [Socket] Người dùng đã ngắt kết nối: ${socket.id}`);
    });
  });

  return io;
};
