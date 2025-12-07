import { verifyToken } from '../utils/jwtHelper.js';

// Middleware xác thực JWT token (bắt buộc)
// Gắn req.user nếu hợp lệ, trả về lỗi 401/403 nếu không
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Thiếu token xác thực' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify failed:', err.message);
    return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Middleware xác thực JWT token (không bắt buộc)
// Gắn req.user nếu có token hợp lệ, req.user = null nếu không
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
};

// Middleware phân quyền theo role
// Chạy sau authenticateToken
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};
