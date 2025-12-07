import express from 'express';
import authRoutes from '../routes/auth.js';
import profileRoutes from '../routes/profile.js';
import chatRoutes from '../routes/chat.js';
import postRoutes from '../routes/posts.js';
import peopleRoutes from '../routes/people.js';
import suggestionRoutes from '../routes/suggestions.js';
import notificationsRoutes from '../routes/notifications.js';
import reportsRoutes from '../routes/reports.js';
import adminRoutes from '../routes/admin.js';
import handleRoutes from '../routes/handle.js';

const router = express.Router();

// Test route để kiểm tra API
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is working',
    version: '1.0.0'
  });
});

// Đăng ký các routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/conversations', chatRoutes);
router.use('/posts', postRoutes);
router.use('/users', peopleRoutes);
router.use('/users/suggestions', suggestionRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reports', reportsRoutes);
router.use('/admin', adminRoutes);
router.use('/handle', handleRoutes);

export default router;
