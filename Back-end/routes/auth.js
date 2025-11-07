import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = express.Router();

// Import các hàm từ controller
// (Đường dẫn '../' đi lùi ra khỏi 'routes' rồi vào 'controllers')
import * as authController from '../controllers/authController.js';
import { createAdminAccount, updateAdminPassword, updateAllAdminPasswords } from '../controllers/adminController.js';

// Import middleware (Giả sử thư mục middlewares ở cùng cấp với controllers)
import { authenticateToken } from '../middlewares/authenticateToken.js'; 
// const { authorizeRoles } = require('../middlewares/authenticateToken'); // Bật nếu cần

/* ============================
    Các route xác thực cốt lõi
============================ */
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

/* ============================
    Tạo tài khoản Admin/HandleReport
    POST /api/auth/create-admin
    Body: { email, password, first_name, last_name, role, secret }
    Header: X-Admin-Secret (hoặc gửi trong body)
============================ */
router.post('/create-admin', createAdminAccount);

/* ============================
    Cập nhật mật khẩu cho tài khoản Admin/HandleReport
    POST /api/auth/update-admin-password
    Body: { email, password, role?, secret }
    Header: X-Admin-Secret (hoặc gửi trong body)
============================ */
router.post('/update-admin-password', updateAdminPassword);

/* ============================
    Cập nhật mật khẩu cho TẤT CẢ tài khoản Admin hoặc HandleReport
    POST /api/auth/update-all-admin-passwords
    Body: { role: 'admin' | 'handlereport', password, secret }
    Header: X-Admin-Secret (hoặc gửi trong body)
============================ */
router.post('/update-all-admin-passwords', updateAllAdminPasswords);

/* ============================
    Các route cần xác thực (dùng token)
============================ */
// ✅ TÁI CẤU TRÚC: Gọi hàm controller, sạch sẽ
router.get('/profile/:username', authenticateToken, authController.getUserProfile);
router.get('/users/by-email', authenticateToken, authController.findUserByEmail);


export default router;