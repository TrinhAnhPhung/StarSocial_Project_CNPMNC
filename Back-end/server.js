import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import roleRoutes from './routes/role.js';
import pool from './db.js';
import peopleRoutes from './routes/people.js';
import suggestionRoutes from './routes/suggestions.js';

const app = express(); 
const port = 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Đăng ký routes
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/users', peopleRoutes);
app.use('/api/users/suggestions', suggestionRoutes);

app.listen(port, () => {
  console.log(`✅ Server chạy tại http://localhost:${port}`);
});

 app.get('/api/profile', async (req, res) => {
  const { email } = req.query; // Lấy email từ query params

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await pool.query('SELECT profile_picture_url FROM "users1" WHERE email = $1', [email]);

    if (user.rows.length > 0) {
      // Trả về URL hình ảnh của người dùng
      res.json({ profile_picture_url: user.rows[0].profile_picture_url });
    } else {
      // Nếu không tìm thấy người dùng
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/profile/image', async (req, res) => {
  const { email } = req.query; // Lấy email từ query params

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await pool.query('SELECT profile_picture_url FROM "users1" WHERE email = $1', [email]);

    if (user.rows.length > 0) {
      res.json({ profile_picture_url: user.rows[0].profile_picture_url });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route lấy thông tin người dùng (username, fullname, bio)
app.get('/api/profile/info', async (req, res) => {
  const { email } = req.query; // Lấy email từ query params

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await pool.query('SELECT full_name, username, bio FROM "users1" WHERE email = $1', [email]);

    if (user.rows.length > 0) {
      res.json({
        full_name: user.rows[0].full_name,
        username: user.rows[0].username,
        bio: user.rows[0].bio,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



