import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as adminUserController from '../controllers/adminUserController.js';

const router = express.Router();

// Tất cả routes đều cần authentication và chỉ admin mới có quyền
router.use(authenticateToken);

// GET /api/admin/users - Lấy danh sách tất cả người dùng
router.get('/users', adminUserController.getAllUsers);

// GET /api/admin/users/:userId - Lấy thông tin một người dùng
router.get('/users/:userId', adminUserController.getUserById);

// POST /api/admin/users - Tạo người dùng mới
router.post('/users', adminUserController.createUser);

// PUT /api/admin/users/:userId - Cập nhật thông tin người dùng
router.put('/users/:userId', adminUserController.updateUser);

// PATCH /api/admin/users/:userId/lock - Khóa/Mở khóa người dùng
router.patch('/users/:userId/lock', adminUserController.toggleLockUser);

// DELETE /api/admin/users/:userId - Xóa người dùng
router.delete('/users/:userId', adminUserController.deleteUser);

export default router;

