import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const router = express.Router();
const { sql, connection } = require('../src/Config/SqlConnection.js');

// GET / (Tương ứng với /api/users/suggestions/)
// Lấy 5 người dùng ngẫu nhiên để gợi ý
router.get('/', async (req, res) => {
  // Lấy id của người dùng hiện tại từ query để loại trừ họ khỏi danh sách
  const currentUserId = req.query.exclude; 

  try {
    const pool = await connection();
    const request = pool.request();
    
    let query = `
      SELECT TOP 5
        u.User_id AS id,
        u.Email AS username,
        u.First_Name + ' ' + u.Last_name AS full_name,
        u.Profile_Picture AS profile_picture_url,
        u.Is_Online AS is_online,
        u.Last_Active AS last_active
      FROM Users u
      WHERE u.Role NOT IN ('admin', 'handlereport')
    `;
    
    if (currentUserId) {
      query += ` AND u.User_id != @current_user_id`;
      request.input('current_user_id', sql.VarChar(26), currentUserId);
    }
    
    query += ` ORDER BY NEWID()`;
    
    const result = await request.query(query);
    
    const suggestedUsers = result.recordset.map(user => ({
      id: user.id,
      username: user.username || user.Email,
      full_name: user.full_name || 'Unnamed User',
      profile_picture_url: user.profile_picture_url || null,
      is_online: user.is_online,
      last_active: user.last_active
    }));
    
    res.json(suggestedUsers);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách gợi ý:", err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

export default router;