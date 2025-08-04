import express from 'express';
import pool from '../db.js'; // ✅ Sử dụng pool kết nối chung

const router = express.Router();

router.get('/:username', async (req, res) => {
    try {
        // ✅ Lấy username từ URL params
        const { username } = req.params;  // Đảm bảo bạn lấy username từ req.params

        // ✅ Truy vấn CSDL bằng username
        const userResult = await pool.query(
            'SELECT id, full_name, username, email, bio, profile_picture_url FROM "users1" WHERE username = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        const user = userResult.rows[0];

        // Trả về thông tin người dùng tìm được
        res.status(200).json({
            message: 'Lấy dữ liệu hồ sơ thành công',
            user: user,
        });

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu hồ sơ:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
    }
});

export default router;
