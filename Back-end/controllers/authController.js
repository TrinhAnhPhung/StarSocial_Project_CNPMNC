import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  const { username, email, password, full_name, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users1 (username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username, email, hashedPassword, full_name, role || 'user']
    );

    res.status(201).json({ message: 'Đăng ký thành công', user: result.rows[0] });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ error: 'Đăng ký thất bại' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users1 WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: 'Email không tồn tại' });

    const isMatch = user.password_hash.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password_hash)
      : password === user.password_hash;

    if (!isMatch) return res.status(400).json({ error: 'Mật khẩu không đúng' });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
