import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = express.Router();
const { sql, connection } = require('../src/Config/SqlConnection.js');
const { notificationConnection } = require('../src/Config/NotificationSqlConnection.js'); 
import { authenticateToken } from '../middlewares/authMiddleware.js';

const PRIMARY_DB = process.env.DB_Name || 'StarSocial_primary'; 

// ===== Only error logging (no info logs) =====
const err = (...args) => console.error(...args);

// ✅ Lấy danh sách thông báo của user hiện tại
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      err('GET /notifications: req.user hoặc req.user.id không tồn tại', req.user);
      return res.status(401).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const userId = req.user.id;

    const pool = await notificationConnection(); // ✅ lấy từ DB thông báo
    const result = await pool
      .request()
      .input('userId', sql.VarChar(26), userId)
      .query(`
        SELECT 
          n.Interaction_Id AS id,
          n.User_Id        AS user_id,
          n.Creator_Id     AS actor_id,
          n.Content_Id     AS post_id,
          n.Type           AS notification_type,
          CASE
            WHEN n.Type = 'follow' THEN N'đã bắt đầu theo dõi bạn.'
            WHEN n.Type = 'like' THEN N'đã thích bài viết của bạn.'
            WHEN n.Type = 'comment' THEN N'đã bình luận về bài viết của bạn.'
            WHEN n.Type = 'account_locked' THEN N'Tài khoản của bạn đã bị khóa tạm thời do vi phạm nhiều lần.'
            WHEN n.Type = 'account_unlocked' THEN N'Tài khoản của bạn đã được mở khóa.'
            WHEN n.Type = 'violation_marked' THEN N'Bài viết của bạn bị đánh dấu vi phạm tiêu chuẩn cộng đồng.'
            ELSE N'Đây là thông báo hệ thống.'
          END AS message,
          n.Is_read        AS is_read,
          n.[Time]         AS created_at,
          u.First_Name + ' ' + u.Last_Name AS actor_username,
          u.Profile_Picture               AS actor_avatar
        FROM dbo.NotificationTable n
        LEFT JOIN ${PRIMARY_DB}.dbo.Users u 
          ON u.User_id = n.Creator_Id
        WHERE n.User_Id = @userId
        ORDER BY n.[Time] DESC
        OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY
      `);

    res.json(result.recordset);
  } catch (e) {
    err('GET /notifications error:', e);
    err('Error stack:', e.stack);
    res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
});

// ✅ Lấy số thông báo chưa đọc (PHẢI ĐẶT TRƯỚC /:id/read)
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      err('GET /unread-count: req.user hoặc req.user.id không tồn tại', req.user);
      return res.status(401).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const userId = req.user.id;

    const pool = await notificationConnection(); 
    const result = await pool
      .request()
      .input('userId', sql.VarChar(26), userId)
      .query(`
        SELECT COUNT(*) AS count
        FROM dbo.NotificationTable
        WHERE User_Id = @userId AND Is_read = 0
      `);

    const countValue = result.recordset[0]?.count;
    const count = countValue ? parseInt(countValue.toString(), 10) : 0;
    res.json({ count });
  } catch (e) {
    err('GET /notifications/unread-count error:', e);
    err('Error stack:', e.stack);
    res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
});

// ✅ Đánh dấu đã đọc (PHẢI ĐẶT SAU /unread-count)
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const notifId = parseInt(req.params.id, 10);
    if (Number.isNaN(notifId)) {
      return res.status(400).json({ error: 'notifId không hợp lệ' });
    }

    const pool = await notificationConnection(); 
    await pool
      .request()
      .input('notifId', sql.Int, notifId)
      .input('userId', sql.VarChar(26), req.user.id)
      .query(`
        UPDATE dbo.NotificationTable
        SET Is_read = 1
        WHERE Interaction_Id = @notifId AND User_Id = @userId
      `);

    res.json({ ok: true });
  } catch (e) {
    err('PATCH /notifications/:id/read error:', e);
    res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
});

export default router;
