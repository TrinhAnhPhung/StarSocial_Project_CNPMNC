import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = express.Router();
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

// ✅ Route test phân quyền cho admin
router.get('/admin-only', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Chào Admin! Bạn có quyền truy cập route này.' });
});

// ✅ Route test phân quyền cho admin và handlereport
router.get('/report', authenticateToken, authorizeRoles('admin', 'handlereport'), (req, res) => {
  res.json({ message: 'Chào Admin hoặc HandleReport! Bạn có quyền truy cập route này.' });
});

export default router;
