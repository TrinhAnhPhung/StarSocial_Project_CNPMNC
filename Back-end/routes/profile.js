import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const router = express.Router();
import { authenticateToken } from '../middlewares/authenticateToken.js'; 

// 1. Import middleware 'upload' (ĐẢM BẢO BẠN ĐÃ TẠO FILE NÀY)
import { upload } from '../middlewares/upload.js'; 

import { 
    getMe, 
    getProfileInfo, 
    getProfileImage,
    updateMe,
    updateProfilePicture,
    getUserProfile // Import hàm mới
} from '../controllers/profileController.js';

// Route lấy thông tin user (token)
router.get('/me', authenticateToken, getMe);

// Route cập nhật thông tin text (token)
router.put('/me', authenticateToken, updateMe);

// Route lấy thông tin (công khai, qua email)
router.get('/info', getProfileInfo); 

// Route lấy ảnh (công khai, qua email)
router.get('/image', getProfileImage);

// Route lấy thông tin profile của người dùng khác (theo userId)
// QUAN TRỌNG: Phải đặt route /:userId ở cuối cùng để tránh conflict với /me, /info, /image
// Sử dụng optionalAuth để cho phép xem profile mà không cần đăng nhập
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        req.user = null;
        return next();
    }
    
    // Nếu có token, verify và gán vào req.user
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = { id: decoded.userId };
    } catch (err) {
        req.user = null;
    }
    next();
};

// Route này phải đặt ở cuối cùng để tránh conflict
router.get('/:userId', optionalAuth, getUserProfile);

/**
 * @route   PUT /api/profile/picture
 * @desc    Cập nhật ảnh đại diện (token)
 * @access  Private
 */
// 3. THÊM ROUTE MỚI NÀY
// Chạy 'authenticateToken' trước, sau đó 'upload' (multer)
router.put(
    '/picture', 
    authenticateToken, 
    upload, // Middleware multer sẽ tìm file tên 'profileImage'
    updateProfilePicture
);

export default router;

