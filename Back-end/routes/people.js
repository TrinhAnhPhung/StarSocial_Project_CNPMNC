// file: routes/people.js

import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/users
// Route này sẽ lấy tất cả người dùng để hiển thị trên trang "People"
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả các trường cần thiết cho trang People
    const queryText = `
  SELECT id, username, full_name, profile_picture_url 
  FROM "users1"
  WHERE role NOT IN ('admin', 'handlereport')
  ORDER BY created_at DESC
`;
    
    const allUsers = await pool.query(queryText);
    res.json(allUsers.rows);

  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err.message);
    res.status(500).send('Server Error');
  }
});

export default router;