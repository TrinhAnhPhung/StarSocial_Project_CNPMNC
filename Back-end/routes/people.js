import express from 'express';
import pool from '../db.js'; // Lưu ý đường dẫn tới file db.js

const router = express.Router();

// GET /api/users/ (đường dẫn gốc của router này là /)
router.get('/api/users', async (req, res) => {
  try {
    // Lấy các cột cần thiết từ bảng "Users1"
    const allUsers = await pool.query(
      'SELECT id, username, full_name, profile_picture_url FROM "users1"'
    );
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;