import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = express.Router();
const { sql, connection } = require('../src/Config/SqlConnection.js');
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { toggleFollow, getFollowStatus } from '../controllers/followController.js';
const jwt = require('jsonwebtoken');

// Middleware optional authentication để lấy user ID nếu có token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, user) => {
      if (!err && user) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

// GET /api/users
// Route này sẽ lấy tất cả người dùng để hiển thị trên trang "People"
router.get('/', optionalAuth, async (req, res) => {
  try {
    const pool = await connection();
    const currentUserId = req.user?.id || null;

    // Query để lấy tất cả users (trừ admin và handlereport)
    let query = `
      SELECT 
        u.User_id AS id,
        u.Email AS username,
        u.First_Name + ' ' + u.Last_name AS full_name,
        u.Profile_Picture AS profile_picture_url,
        u.Email,
        u.First_Name,
        u.Last_name
    `;

    // Thêm isFollowing nếu có user đăng nhập
    if (currentUserId) {
      query += `,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM [Follow] 
            WHERE Followers_id = @current_user_id 
            AND FamousUser_id = u.User_id
          ) THEN 1 
          ELSE 0 
        END AS is_following
      `;
    } else {
      query += `, 0 AS is_following`;
    }

    query += `
      FROM Users u
      WHERE u.Role NOT IN ('admin', 'handlereport')
      ORDER BY u.User_id DESC
    `;

    const request = pool.request();
    if (currentUserId) {
      request.input('current_user_id', sql.VarChar(26), currentUserId);
    }

    const result = await request.query(query);

    // Format kết quả
    const users = result.recordset.map(user => ({
      id: user.id,
      username: user.username || user.Email,
      full_name: user.full_name || `${user.First_Name || ''} ${user.Last_name || ''}`.trim() || 'Unnamed User',
      profile_picture_url: user.profile_picture_url || null,
      isFollowing: user.is_following === 1 || user.is_following === true
    }));

    console.log(`✅ Đã lấy ${users.length} người dùng từ database`);
    res.json(users);

  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/users/:userId/follow - Follow/Unfollow user
router.post('/:userId/follow', authenticateToken, toggleFollow);

// GET /api/users/:userId/follow-status - Kiểm tra trạng thái follow
router.get('/:userId/follow-status', optionalAuth, getFollowStatus);

export default router;