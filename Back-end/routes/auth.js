// routes/auth.js
import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router(); // Sử dụng express.Router()

// Khởi tạo Pool (hoặc bạn có thể truyền pool từ server.js nếu muốn)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
});

// POST endpoint cho việc đăng ký
router.post('/register', async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users1 (full_name, username, email, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, username, email, hashedPassword]
    );

    const newUser = result.rows[0];
    res.status(201).json({ message: 'Tạo tài khoản thành công', user: newUser });
  } catch (error) {
    console.error("Lỗi xảy ra khi lưu vào database:", error);
    // Kiểm tra lỗi trùng email/username nếu có
    if (error.code === '23505') { // PostgreSQL unique violation error code
        if (error.detail.includes('email')) {
            return res.status(409).json({ error: 'Email đã tồn tại.' });
        }
        if (error.detail.includes('username')) {
            return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại.' });
        }
    }
    res.status(500).json({ error: 'Vui lòng điền thông tin hoặc có lỗi xảy ra.' });
  }
});

// POST endpoint cho việc đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users1 WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Email không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Đăng nhập thành công', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng nhập.' });
  }
});

export default router; // Export router