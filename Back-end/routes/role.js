import express from 'express';
const router = express.Router(); // 👈 BẠT PHẢI có dòng này để dùng router

import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import * as postController from '../controllers/postController.js'; // 👈 Import controller chứa createPost, deletePost

// Tạo bài viết - chỉ cho phép admin & handlereport
router.post('/create', authenticateToken, authorizeRoles('admin', 'handlereport'), postController.createPost);

// Xóa bài viết - chỉ cho phép admin
router.delete('/:id', authenticateToken, authorizeRoles('admin'), postController.deletePost);

export default router;
