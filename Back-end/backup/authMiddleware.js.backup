// middlewares/authMiddleware.js 
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT token từ header Authorization
 * Định dạng header: Authorization: Bearer <token>
 */
// ✅ ĐÃ SỬA: Chuyển sang CommonJS
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Thiếu token xác thực' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, user) => {
    if (err) {
      console.error('JWT verify failed:', err.message);
      return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    req.user = user; // user: { id, role, ... }
    next();
  });
};

/**
 * Middleware phân quyền theo role (VD: ['admin', 'moderator'])
 */
// ✅ ĐÃ SỬA: Chuyển sang CommonJS
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

// ✅ ĐÃ SỬA: Chuyển sang ES modules
export {
  authenticateToken,
  authorizeRoles
};
