// Cấu hình CORS cho ứng dụng
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:19006',
  'exp://localhost:19000',
  'http://192.168.1.230:3000',
  'http://localhost:3000'
];

export const corsOptions = {
  origin(origin, callback) {
    // Cho phép các origin được định nghĩa hoặc các trường hợp đặc biệt
    if (
      !origin || 
      ALLOWED_ORIGINS.includes(origin) || 
      origin.startsWith('exp://') || 
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.0.2.2') ||
      origin.startsWith('http://10.0.0.2')
    ) {
      return callback(null, true);
    }
    console.warn('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
};

export const socketCorsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
};
