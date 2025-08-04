// routes/posts.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js'; 
import { toggleLike, addComment } from '../controllers/postController.js';

const router = express.Router();

// Cấu hình Multer để lưu file ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục lưu ảnh, bạn cần tạo thư mục này
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Tên file duy nhất
    }
});





// Hàm kiểm tra loại file và kích thước file
const fileFilter = (req, file, cb) => {
    // Kiểm tra loại file ảnh (chỉ chấp nhận .jpg, .jpeg, .png)
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error('Chỉ chấp nhận các file ảnh với định dạng .jpg, .jpeg hoặc .png'), false);
    }
};

// Kiểm tra kích thước file (giới hạn 5MB)
const limits = {
    fileSize: 5 * 1024 * 1024 // 5MB
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});


router.post('/', upload.single('image'), async (req, res) => {
    // Kiểm tra các thông tin gửi lên
    console.log(req.body);  // Kiểm tra dữ liệu gửi từ frontend

    // Kiểm tra xem file có được gửi lên hay không
    if (!req.file) {
        return res.status(400).json({ message: "Vui lòng cung cấp hình ảnh." });
    }

    const { user_id, caption, location, hashtags } = req.body;
    const image_url = `/uploads/${req.file.filename}`;

    try {
        // Truy vấn vào cơ sở dữ liệu để thêm bài viết
        const newPost = await pool.query(
            "INSERT INTO posts (user_id, image_url, caption, location, hashtags) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user_id, image_url, caption, location, hashtags]
        );
        res.status(201).json(newPost.rows[0]);
    } catch (err) {
        console.error("Error in creating post:", err); // In lỗi ra console
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
});




// 3. THÍCH / BỎ THÍCH một bài viết (Đã thêm)
// Route này khớp với: POST /api/posts/:postId/like
router.post('/:postId/like', toggleLike);


// 4. THÊM BÌNH LUẬN vào một bài viết (Đã thêm)
// Route này khớp với: POST /api/posts/:postId/comments
router.post('/:postId/comments', addComment);


// Endpoint để lấy tất cả bài viết
router.get('/', async (req, res) => {
    try {
        // Truy vấn cơ sở dữ liệu PostgreSQL để lấy danh sách bài viết
        const result = await pool.query(
            `SELECT 
          posts.id, 
          posts.user_id, 
          posts.image_url, 
          posts.caption, 
          posts.location, 
          posts.hashtags, 
          posts.created_at, 
          users1.username,  -- Truy vấn username từ users1
          users1.full_name, -- Truy vấn full_name từ users1
          users1.profile_picture_url  -- Truy vấn profile_picture_url từ users1
      FROM posts
      JOIN users1 ON posts.user_id = users1.id
      ORDER BY posts.created_at DESC`
        );

        // Trả về dữ liệu bài viết
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send("Lỗi Server");
    }
});

// Xử lý lỗi Multer (nếu có)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Lỗi Multer: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

export default router;
