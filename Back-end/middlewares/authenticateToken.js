// middlewares/authenticateToken.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Lấy token 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: 'Thiếu token xác thực' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, user) => {
    if (err) {
      console.error('JWT verify failed:', err.message);
      return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Gán thông tin user (payload) vào req.user
    // user sẽ là { id, email, role }
    req.user = user; 
    next(); // Chuyển tiếp đến controller
  });
};

/**
 * Middleware phân quyền theo role
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra role trong req.user (đã được gán bởi authenticateToken)
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

// ✅ SỬA LỖI: Export bằng ES modules
export {
  authenticateToken,
  authorizeRoles,
};