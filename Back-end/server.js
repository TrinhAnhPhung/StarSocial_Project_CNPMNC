import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// ✅ API Login
app.post('/api/Login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
  }

  try {
    const result = await pool.query('SELECT * FROM users1 WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Email không tồn tại' });
    }

    let isMatch = false;

    // ✅ Kiểm tra kiểu lưu mật khẩu
    if (user.password_hash.startsWith('$2b$')) {
      // So sánh mật khẩu bcrypt
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // So sánh mật khẩu plain text
      isMatch = password === user.password_hash;
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu không đúng' });
    }

    // ✅ Tạo JWT token
    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      username: user.username,
      email: user.email,
      full_name: user.full_name
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

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