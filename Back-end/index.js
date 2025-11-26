// Back-end/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env từ thư mục Back-end
dotenv.config({ path: path.resolve(__dirname, '.env') });
import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { connection } = require('./src/Config/SqlConnection.js');

// --- 1. Import thêm 'http' và 'Socket.io' ---
import http from 'http';
import { Server } from 'socket.io';

// Import logic controller chat
import { sendMessage } from './controllers/chatController.js'; 

// Imprt handle routes
import handleRoutes from './routes/handle.js';



// Import các routes của bạn
import authRoutes from './routes/auth.js'; 
import profileRoutes from './routes/profile.js';
import chatRoutes from './routes/chat.js';
import postRoutes from './routes/posts.js';
import peopleRoutes from './routes/people.js';
import suggestionRoutes from './routes/suggestions.js';
import notificationsRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';

const app = express();
const port = process.env.PORT || 5000;

// ✅ Cấu hình CORS cho phép mobile app kết nối
const ALLOWED_ORIGINS = [
  'http://localhost:5173', 
  'http://localhost:19006', 
  'exp://localhost:19000',
  'http://192.168.1.230:3000',
  'http://localhost:3000',
  'https://dazzling-kringle-a8feb0.netlify.app'
];
app.use(
  cors({
    origin(origin, cb) {
      // Cho phép: 
      // - FE dev (localhost:5173)
      // - Postman/cURL (origin undefined)
      // - Expo/Mobile apps (origin null, exp://, hoặc http://localhost với các port khác nhau)
      // - Thiết bị thật kết nối qua IP local (192.168.x.x, 10.0.2.2 cho Android emulator)
      if (
        !origin || 
        ALLOWED_ORIGINS.includes(origin) || 
        origin.startsWith('exp://') || 
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') || // Cho phép các dải IP 10.x.x.x (bao gồm 10.0.2.2 và IP LAN 10.21...)
        origin.startsWith('http://172.')   // Cho phép dải IP 172.x.x.x
      ) {
        return cb(null, true);
      }
      console.warn('CORS blocked origin:', origin);
      return cb(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  })
);
app.use(express.json());

// Test route để check kết nối
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running', 
    port: port,
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is working',
    version: '1.0.0'
  });
});

app.use('/uploads', express.static('uploads'));

// Sử dụng các routes API
app.use('/api/auth', authRoutes); 
app.use('/api/profile', profileRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', peopleRoutes);
app.use('/api/users/suggestions', suggestionRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/handle', handleRoutes);

// --- 2. Tạo HTTP server và gắn Socket.io ---
const server = http.createServer(app); // Tạo server từ app Express

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // 
        methods: ["GET", "POST"]
    }
});

// --- 3. Cấu hình Socket.io ---
io.on('connection', (socket) => {
    console.log(`✅ [Socket] Người dùng đã kết nối: ${socket.id}`);

    // Lắng nghe sự kiện "join_room" từ client
    // file: index.js
    socket.on('join_room', (conversationId) => {
    const roomName = String(conversationId); // Ép kiểu về String
    socket.join(roomName);
    console.log(`[Socket] User ${socket.id} đã tham gia phòng chat: ${roomName}`);
});

    // Lắng nghe sự kiện "send_message" từ client
   // File: index.js
socket.on('send_message', async (data) => {
    const { conversationId, senderId, content } = data;

    try {
        const newMessage = await sendMessage(conversationId, senderId, content);
        const roomName = String(conversationId); 

        // ✅ DÙNG LẠI CÁCH NÀY:
        io.to(roomName).emit('receive_message', newMessage); 

        console.log(`[Socket] Đã gửi (io.to) tin nhắn ${newMessage.Message_id} đến phòng ${roomName}`);

    } catch (error) {
        console.error("❌ [Socket] Lỗi khi xử lý send_message:", error);
    }
});
// LẮNG NGHE SỰ KIỆN THU HỒI TỪ CLIENT
    socket.on('message_deleted_by_sender', (data) => {
        const { conversationId, messageId, newContent } = data;
        const roomName = String(conversationId);
        
        // Gửi cập nhật đến TẤT CẢ mọi người trong phòng
        io.to(roomName).emit('message_deleted_update', {
            messageId: messageId,
            conversationId: conversationId,
            newContent: newContent
        });

        console.log(`[Socket] Đã phát (io.to) sự kiện thu hồi tin nhắn ${messageId} đến phòng ${roomName}`);
    });

    // --- Typing events ---
    socket.on('typing', (data) => {
        const { conversationId, userId, userName } = data;
        const roomName = String(conversationId);
        // Broadcast to everyone in the room EXCEPT the sender
        socket.to(roomName).emit('user_typing', { userId, userName });
    });

    socket.on('stop_typing', (data) => {
        const { conversationId, userId } = data;
        const roomName = String(conversationId);
        // Broadcast to everyone in the room EXCEPT the sender
        socket.to(roomName).emit('user_stopped_typing', { userId });
    });

    // Lắng nghe khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log(`🔌 [Socket] Người dùng đã ngắt kết nối: ${socket.id}`);
    });
});


// --- 4. Khởi động server ---
const startServer = async (portToTry = port) => {
    portToTry = Number(portToTry); // Đảm bảo là số
    try {
        await connection(); // Kết nối DB trước
        
        // Thay vì app.listen, dùng server.listen
        server.listen(portToTry, '0.0.0.0')
            .on('listening', () => {
                console.log(`🚀 Server (với Socket.io) đang chạy tại http://0.0.0.0:${portToTry}`);
                console.log(`📱 Mobile app có thể kết nối tại: http://YOUR_IP:${portToTry}`);
            })
            .on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`⚠️  Port ${portToTry} đã được sử dụng, thử port ${portToTry + 1}...`);
                    // Thử port tiếp theo
                    server.close();
                    startServer(portToTry + 1);
                } else {
                    console.error("❌ Không thể khởi động server:", err);
                    process.exit(1);
                }
            });
        
    } catch (error) {
        console.error("❌ Không thể khởi động server:", error);
        process.exit(1);
    }
};

startServer();