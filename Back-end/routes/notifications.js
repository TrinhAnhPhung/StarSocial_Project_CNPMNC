import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = express.Router();
const { sql, connection } = require('../src/Config/SqlConnection.js');
import { authenticateToken } from '../middlewares/authMiddleware.js';

// ✅ Lấy danh sách thông báo của user hiện tại (dùng fallback nếu message = null)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra req.user
    if (!req.user || !req.user.id) {
      console.error('GET /notifications: req.user hoặc req.user.id không tồn tại', req.user);
      return res.status(401).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const userId = req.user.id;
    console.log('GET /notifications: Lấy thông báo cho userId:', userId);

    const pool = await connection();
    const result = await pool
      .request()
      .input('userId', sql.VarChar(26), userId)
      .query(`
        SELECT 
          n.id, 
          n.user_id, 
          n.actor_id, 
          n.post_id,
          n.notification_type,
          ISNULL(
            n.message,
            CASE
              WHEN n.notification_type = 'follow' THEN 
                N'đã bắt đầu theo dõi bạn.'
              WHEN n.notification_type = 'account_locked' THEN 
                N'Tài khoản của bạn đã bị khóa tạm thời do vi phạm nhiều lần.'
              WHEN n.notification_type = 'account_unlocked' THEN 
                N'Tài khoản của bạn đã được mở khóa.'
              WHEN n.notification_type = 'violation_marked' THEN 
                N'Bài viết của bạn bị đánh dấu vi phạm tiêu chuẩn cộng đồng.'
              ELSE 
                N'Đây là thông báo hệ thống.'
            END
          ) AS message,
          n.is_read, 
          n.created_at,
          u.First_Name + ' ' + u.Last_Name AS actor_username,
          u.Profile_Picture AS actor_avatar
        FROM notifications n
        LEFT JOIN Users u ON u.User_id = n.actor_id
        WHERE n.user_id = @userId
        ORDER BY n.created_at DESC
        OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY
      `);

    console.log(`GET /notifications: Tìm thấy ${result.recordset.length} thông báo`);
    res.json(result.recordset);
  } catch (e) {
    console.error('GET /notifications error:', e);
    console.error('Error stack:', e.stack);
    res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
});

// ✅ Lấy số thông báo chưa đọc (PHẢI ĐẶT TRƯỚC /:id/read để tránh conflict)
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra req.user
    if (!req.user || !req.user.id) {
      console.error('GET /unread-count: req.user hoặc req.user.id không tồn tại', req.user);
      return res.status(401).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const userId = req.user.id;
    console.log('GET /unread-count: Lấy số thông báo chưa đọc cho userId:', userId);

    const pool = await connection();
    const result = await pool
      .request()
      .input('userId', sql.VarChar(26), userId)
      .query(`
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = @userId AND is_read = 0
      `);

    // SQL Server COUNT(*) trả về kiểu BigInt, cần convert
    const countValue = result.recordset[0]?.count;
    const count = countValue ? parseInt(countValue.toString()) : 0;
    console.log(`GET /unread-count: Tìm thấy ${count} thông báo chưa đọc`);
    res.json({ count });
  } catch (e) {
    console.error('GET /notifications/unread-count error:', e);
    console.error('Error stack:', e.stack);
    res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
});

// ✅ Đánh dấu đã đọc (PHẢI ĐẶT SAU /unread-count)
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const pool = await connection();
    await pool
      .request()
      .input('notifId', sql.Int, parseInt(req.params.id))
      .input('userId', sql.VarChar(26), req.user.id)
      .query(`
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = @notifId AND user_id = @userId
      `);

    res.json({ ok: true });
  } catch (e) {
    console.error('PATCH /notifications/:id/read error:', e);
    res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
});

export default router;
