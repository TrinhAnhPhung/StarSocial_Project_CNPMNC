// back-end/routes/reports.js
import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router();

/**
 * Chèn thông báo an toàn với SAVEPOINT
 */
async function safeInsertNotification(client, { userId, actorId, postId = null, type, message }) {
  const sp = 'sp_notify';
  await client.query(`SAVEPOINT ${sp}`);
  try {
    await client.query(
      `INSERT INTO notifications (user_id, actor_id, post_id, notification_type, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, actorId, postId, type, message]
    );
    await client.query(`RELEASE SAVEPOINT ${sp}`);
  } catch (err) {
    if (err?.code === '23514') { // CHECK constraint violated
      await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
      await client.query(
        `INSERT INTO notifications (user_id, actor_id, post_id, notification_type, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, actorId, postId, 'system', `[${type}] ${message || ''}`.trim()]
      );
      await client.query(`RELEASE SAVEPOINT ${sp}`);
    } else {
      await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
      throw err;
    }
  }
}

/**
 * API: Đánh dấu vi phạm
 * - Tăng violation_count
 * - Gửi thông báo vi phạm
 * - Nếu >= 3 → khóa 7 ngày (locked + is_locked + locked_until)
 */
router.post('/mark-violation', authenticateToken, async (req, res) => {
  const { targetUserId, postId = null, reason = '' } = req.body || {};
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });
  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Tăng vi phạm
    const inc = await client.query(
      `UPDATE users1
         SET violation_count = COALESCE(violation_count, 0) + 1
       WHERE id = $1
       RETURNING id, violation_count, COALESCE(locked, FALSE) AS locked`,
      [targetUserId]
    );
    if (!inc.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Target user not found' });
    }
    const violation_count = inc.rows[0].violation_count;

    // 2) Thông báo vi phạm
    await safeInsertNotification(client, {
      userId: targetUserId,
      actorId: req.user.id,
      postId,
      type: 'violation_marked',
      message: reason || 'Vi phạm tiêu chuẩn cộng đồng'
    });

    // 3) Khóa nếu >= 3
    let locked = false;
    if (violation_count >= 3) {
      locked = true;
      const lockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await client.query(
        `UPDATE users1 
            SET locked = TRUE,
                is_locked = TRUE,
                locked_until = $2
          WHERE id = $1`,
        [targetUserId, lockedUntil]
      );

      await safeInsertNotification(client, {
        userId: targetUserId,
        actorId: req.user.id,
        postId,
        type: 'account_locked',
        message: `Tài khoản bị khóa tạm thời 7 ngày do vi phạm 3 lần. Hệ thống sẽ tự mở vào ${lockedUntil.toLocaleString('vi-VN')}.`
      });
    }

    await client.query('COMMIT');
    return res.json({ ok: true, violation_count, locked });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('POST /mark-violation error:', { message: e.message, code: e.code });
    return res
      .status(500)
      .json({ error: 'Internal server error', detail: e.message, code: e.code });
  } finally {
    client.release();
  }
});

/**
 * API: Mở lại tài khoản bị cấm (unban)
 * - Chỉ cho phép role = admin hoặc handlereport
 * - Reset locked/is_locked/locked_until, đưa violation_count về 0
 * - Gửi notification cho user (dùng helper an toàn)
 */
router.post('/unlock-user', authenticateToken, async (req, res) => {
  const { targetUserId } = req.body || {};
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });

  if (!['admin', 'handlereport'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Bạn không có quyền thực hiện hành động này.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const upd = await client.query(
      `UPDATE users1 
          SET locked = FALSE,
              is_locked = FALSE,
              locked_until = NULL,
              violation_count = 0
        WHERE id = $1
        RETURNING id, username, email`,
      [targetUserId]
    );

    if (!upd.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Không tìm thấy người dùng để mở khoá' });
    }

    await safeInsertNotification(client, {
      userId: targetUserId,
      actorId: req.user.id,
      postId: null,
      type: 'account_unlocked',
      message: 'Tài khoản của bạn đã được mở khóa.'
    });

    await client.query('COMMIT');
    return res.json({ ok: true, message: `Đã mở khoá cho user ID ${targetUserId}` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /unlock-user error:', { message: err.message, code: err.code });
    return res
      .status(500)
      .json({ error: 'Internal server error', detail: err.message, code: err.code });
  } finally {
    client.release();
  }
});

export default router;
