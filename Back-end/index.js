import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { createRequire } from 'module';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import cấu hình và modules
const require = createRequire(import.meta.url);
const { connection } = require('./src/Config/SqlConnection.js');
import { corsOptions } from './config/cors.js';
import { initializeSocket } from './config/socket.js';
import apiRoutes from './config/routes.js';

// Khởi tạo Express app
const app = express();
const port = process.env.PORT || 5000;

// Cấu hình middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is running',
    port: port,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('UNCAUGHT ERROR:', err);
  res.status(500).json({
    error: 'Internal server error',
    detail: err.message
  });
});

// Tạo HTTP server và khởi tạo Socket.io
const server = http.createServer(app);
initializeSocket(server);

// Khởi động server với auto-retry port
const startServer = async (portToTry = port) => {
  portToTry = Number(portToTry);
  try {
    await connection();
    
    server.listen(portToTry, '0.0.0.0')
      .on('listening', () => {
        console.log(`🚀 Server (với Socket.io) đang chạy tại http://0.0.0.0:${portToTry}`);
        console.log(`📱 Mobile app có thể kết nối tại: http://YOUR_IP:${portToTry}`);
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`⚠️  Port ${portToTry} đã được sử dụng, thử port ${portToTry + 1}...`);
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
