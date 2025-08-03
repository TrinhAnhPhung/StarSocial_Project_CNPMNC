import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET / (Tương ứng với /api/users/suggestions/)
// Lấy 5 người dùng ngẫu nhiên để gợi ý
router.get('/', async (req, res) => {
  // Lấy id của người dùng hiện tại từ query để loại trừ họ khỏi danh sách
  const currentUserId = req.query.exclude; 

  try {
    const queryText = `
      SELECT id, username, full_name, profile_picture_url 
      FROM "users1"
      WHERE id != $1
      ORDER BY RANDOM() 
      LIMIT 5
    `;
    
    const suggestedUsers = await pool.query(queryText, [currentUserId || 0]);
    res.json(suggestedUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;