import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

// Dùng chung secret key
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Middleware xác thực JWT token (BẮT BUỘC)
 * Gắn req.user nếu hợp lệ, báo lỗi 401/403 nếu không có hoặc không hợp lệ.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ error: 'Thiếu token xác thực' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
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
 * HÀM MỚI: Middleware xác thực (KHÔNG BẮT BUỘC)
 * Gắn req.user nếu token hợp lệ, gán req.user = null nếu không có hoặc không hợp lệ.
 * Không bao giờ báo lỗi, luôn cho 'next()'.
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null; // Không có token, vẫn cho đi tiếp
        return next();
    }

    try {
        // ✅ SỬA LỖI 1: Dùng đúng JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // ✅ SỬA LỖI 2: Gán thẳng payload đã giải mã (không phải { id: decoded.userId })
        req.user = decoded; 
    } catch (err) {
        // Token hỏng/hết hạn, coi như không đăng nhập
        req.user = null; 
    }
    next();
};


/**
 * Middleware phân quyền theo role
 * (Hàm này nên được chạy SAU 'authenticateToken')
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

// Export cả 3 hàm
export {
    authenticateToken,
    authorizeRoles,
    optionalAuth,
};