import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import roleRoutes from './routes/role.js';
import pool from './db.js';
import peopleRoutes from './routes/people.js';
import suggestionRoutes from './routes/suggestions.js';
import multer from 'multer';
import path from 'path';
import postRoutes from './routes/posts.js';


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Thư mục lưu file
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất để tránh trùng lặp
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const app = express(); 
const port = 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());


app.use('/uploads', express.static('uploads'));
// ✅ Đăng ký routes
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/users', peopleRoutes);
app.use('/api/users/suggestions', suggestionRoutes);
app.use('/api/users', peopleRoutes);
app.use('/api/posts', postRoutes);
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

// 4. TẠO ROUTE PUT MỚI ĐỂ CẬP NHẬT PROFILE
// Sử dụng upload.single('profile_picture') để xử lý file có tên field là 'profile_picture'
app.put('/api/profile/update', upload.single('profile_picture'), async (req, res) => {
  const { email, full_name, bio } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required for update' });
  }

  try {
    // Lấy thông tin người dùng hiện tại để kiểm tra
    const currentUserQuery = await pool.query('SELECT profile_picture_url FROM "users1" WHERE email = $1', [email]);
    if (currentUserQuery.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Nếu có file mới được tải lên, req.file sẽ tồn tại
    let newProfilePictureUrl = currentUserQuery.rows[0].profile_picture_url;
    if (req.file) {
      // Xây dựng URL đầy đủ để lưu vào database
      newProfilePictureUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    }

    // Cập nhật database với thông tin mới
    const result = await pool.query(
      'UPDATE "users1" SET full_name = $1, bio = $2, profile_picture_url = $3 WHERE email = $4 RETURNING *',
      [full_name, bio, newProfilePictureUrl, email]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ 
        message: 'Profile updated successfully!',
        user: result.rows[0] 
      });
    } else {
      res.status(404).json({ message: 'User not found or no changes made' });
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



