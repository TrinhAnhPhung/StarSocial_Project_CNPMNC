import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import authenticateToken from '../middlewares/authenticateToken.js';  // Đảm bảo đường dẫn đúng
import pool from '../db.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// API để lấy thông tin profile của người dùng
router.get('/profile/:username', authenticateToken, async (req, res) => {
  const { username } = req.params; // Lấy username từ URL params

  try {
    const userResult = await pool.query('SELECT * FROM users1 WHERE username = $1', [username]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      res.status(200).json({
        message: 'User found',
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          profile_picture_url: user.profile_picture_url,
          email: user.email,
          bio: user.bio,
        }
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
