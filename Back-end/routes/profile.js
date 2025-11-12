import express from 'express';
// 'createRequire' không cần thiết nếu bạn không dùng 'require'
const router = express.Router();

// 1. Import các middleware cần thiết
// ✅ SỬA: Import cả 'authenticateToken' và 'optionalAuth'
import { authenticateToken, optionalAuth } from '../middlewares/authenticateToken.js'; 
import { upload } from '../middlewares/upload.js'; 

// 2. Import các controller
import { 
    getMe, 
    getProfileInfo, 
    getProfileImage,
    updateMe,
    updateProfilePicture,
    getUserProfile
} from '../controllers/profileController.js';

// === CÁC ROUTE CẦN XÁC THỰC (Token bắt buộc) ===

// Route lấy thông tin user (token)
router.get('/me', authenticateToken, getMe);

// Route cập nhật thông tin text (token)
router.put('/me', authenticateToken, updateMe);

/**
 * @route   PUT /api/profile/picture
 * @desc    Cập nhật ảnh đại diện (token)
 * @access  Private
 */
router.put(
    '/picture', 
    authenticateToken, 
    upload, // Middleware multer
    updateProfilePicture
);

// === CÁC ROUTE CÔNG KHAI (Không cần token) ===

// Route lấy thông tin (công khai, qua email)
router.get('/info', getProfileInfo); 

// Route lấy ảnh (công khai, qua email)
router.get('/image', getProfileImage);

// === ROUTE ĐẶC BIỆT (Token không bắt buộc) ===

// ✅ SỬA: Xóa bỏ hàm 'optionalAuth' inline
// ✅ SỬA: Sử dụng 'optionalAuth' đã import từ file middleware
// QUAN TRỌNG: Phải đặt route /:userId ở cuối cùng
router.get('/:userId', optionalAuth, getUserProfile);


export default router;