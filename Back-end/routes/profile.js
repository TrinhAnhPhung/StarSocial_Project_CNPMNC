// routes/profile.js
import express from 'express';
import { Pool } from 'pg';
import authenticateToken from '../middlewares/authenticateToken.js'; // Import middleware

const router = express.Router();

// Khởi tạo Pool (hoặc bạn có thể truyền pool từ server.js)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
});

// GET endpoint để lấy thông tin profile của người dùng
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // userId được lấy từ middleware authenticateToken

    const userResult = await pool.query(
      // Đảm bảo chọn cột 'username' và các cột khác cần thiết
      'SELECT id, full_name, username, email, bio, profile_picture_url FROM users1 WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    if (!user) {
      // Nếu không tìm thấy người dùng với userId này
      return res.status(404).json({ error: 'Không tìm thấy người dùng với ID này.' });
    }

    // Trả về chỉ thông tin người dùng
    res.status(200).json({
      message: 'Lấy dữ liệu hồ sơ thành công',
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username, // Đảm bảo trường username được gửi về
        email: user.email,
        bio: user.bio,
        profile_picture_url: user.profile_picture_url,
      },
    });

  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hồ sơ từ CSDL:', error); // Log lỗi chi tiết hơn
    // Trả về lỗi 500 nếu có bất kỳ lỗi nào khác xảy ra trong quá trình truy vấn CSDL
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ khi lấy hồ sơ. Vui lòng kiểm tra log server.' });
  }
});

export default router;