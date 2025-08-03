import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import roleRoutes from './routes/role.js';
import pool from './db.js';
const app = express(); 
const port = 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Đăng ký routes
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);

app.listen(port, () => {
  console.log(`✅ Server chạy tại http://localhost:${port}`);
});

 // xử lý hình ảnh cho trang profile
app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      `SELECT username, full_name, profile_picture_url, bio FROM users1 WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi lấy profile:", error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});