import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';

import authRoutes from './routes/auth.js';
import roleRoutes from './routes/role.js';
import peopleRoutes from './routes/people.js';
import suggestionRoutes from './routes/suggestions.js';
import postRoutes from './routes/posts.js';
import notificationsRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('./src/Config/SqlConnection.js');

const app = express();
const port = 5000;

/* ------------ Parsers ------------ */
app.use(express.json()); // ✅ thay bodyParser.json()
app.use(express.urlencoded({ extended: true })); // nếu cần parse form urlencoded

/* ------------ CORS ------------ */
const ALLOWED_ORIGINS = [
  'http://localhost:5173', 
  'http://localhost:19006', 
  'exp://localhost:19000',
  'https://dazzling-kringle-a8feb0.netlify.app',
  'https://starsocialhuflit.netlify.app'
];
app.use(
  cors({
    origin(origin, cb) {
      // Cho phép: FE dev, Postman/cURL (origin undefined), Expo/Mobile apps (origin null hoặc exp://)
      // Mobile apps thường không có origin hoặc có origin dạng exp://
      if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('exp://') || origin.startsWith('http://localhost')) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* ------------ Static uploads ------------ */
app.use('/uploads', express.static('uploads'));

/* ------------ Multer ------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* ------------ Routes ------------ */
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/users', peopleRoutes);
app.use('/api/users/suggestions', suggestionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

/* ------------ Profile helpers (đã sửa sang SQL Server syntax) ------------ */
app.get('/api/profile', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const pool = await connection();
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT Profile_Picture as profile_picture_url FROM Users WHERE Email = @email');
    
    if (result.recordset.length) {
      return res.json({ profile_picture_url: result.recordset[0].profile_picture_url });
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error('Error fetching profile picture:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/profile/info', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const pool = await connection();
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query(`
        SELECT 
          First_Name + ' ' + Last_name as full_name,
          Email as username,
          Description as bio
        FROM Users 
        WHERE Email = @email
      `);
    
    if (result.recordset.length) return res.json(result.recordset[0]);
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error('Error fetching profile info:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/profile/update', upload.single('profile_picture'), async (req, res) => {
  const { email, full_name, bio } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required for update' });
  try {
    const pool = await connection();
    
    // Kiểm tra user có tồn tại không
    const cur = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT Profile_Picture FROM Users WHERE Email = @email');
    
    if (!cur.recordset.length) return res.status(404).json({ message: 'User not found' });

    const url = req.file
      ? `http://localhost:${port}/uploads/${req.file.filename}`
      : cur.recordset[0].Profile_Picture;

    // Parse full_name thành First_Name và Last_name
    const nameParts = (full_name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Update user
    const updateResult = await pool.request()
      .input('first_name', sql.NVarChar(255), firstName)
      .input('last_name', sql.NVarChar(255), lastName)
      .input('description', sql.NVarChar(500), bio || null)
      .input('profile_picture', sql.NVarChar(500), url)
      .input('email', sql.NVarChar(255), email)
      .query(`
        UPDATE Users 
        SET First_Name = @first_name,
            Last_name = @last_name,
            Description = @description,
            Profile_Picture = @profile_picture
        WHERE Email = @email;
        
        SELECT 
          User_id as id,
          Email as email,
          First_Name + ' ' + Last_name as full_name,
          Email as username,
          Description as bio,
          Profile_Picture as profile_picture_url
        FROM Users
        WHERE Email = @email
      `);
    
    if (!updateResult.recordset.length) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }
    
    return res.status(200).json({ 
      message: 'Profile updated successfully!', 
      user: updateResult.recordset[0] 
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/* ------------ Error handler (khuyến nghị) ------------ */
app.use((err, req, res, next) => {
  console.error('UNCAUGHT ERROR:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.listen(port, () => {
  console.log(`✅ Server chạy tại http://localhost:${port}`);
});
