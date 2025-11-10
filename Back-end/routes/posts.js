import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// ✅ SỬA LỖI: Chuyển sang cú pháp MSSQL
const { sql, connection } = require('../src/Config/SqlConnection.js');

// Không cần uploadsDir nữa vì đã dùng Cloudinary 

import { toggleLike, addComment, getComments, toggleCommentLike, updatePost, deletePost } from '../controllers/postController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { uploadPostToCloudinary } from '../middlewares/upload.js';

const router = express.Router();

// Middleware optional authentication để lấy user ID nếu có token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, user) => {
      if (!err && user) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

// Cấu hình Multer - Dùng MemoryStorage để upload lên Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // ✅ SỬA LỖI: Chấp nhận cả Ảnh và Video
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|wmv/; // Thêm định dạng video
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error('Chỉ chấp nhận file ảnh (.jpg, .png, .gif) hoặc video (.mp4, .mov, .avi)'), false);
    }
};

const limits = { fileSize: 50 * 1024 * 1024 }; // Tăng giới hạn lên 50MB cho video
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});


// ✅ TẠO BÀI VIẾT MỚI: Upload ảnh/video lên Cloudinary (giống như profile)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    // 1. Kiểm tra file (giống như profile)
    console.log("--- 🚀 YÊU CẦU TẠO BÀI VIẾT MỚI ---");
    if (!req.file) {
        console.error("Lỗi 400: Không tìm thấy req.file.");
        return res.status(400).json({ message: "Vui lòng cung cấp file ảnh hoặc video." });
    }
    console.log("Tìm thấy file:", req.file.originalname, "Size:", req.file.size, "Type:", req.file.mimetype);

    const { caption, location, hashtags } = req.body; 
    const user_id = req.user.id; 
    const isImage = req.file.mimetype.startsWith('image/');

    let pool;
    let transaction;
    try {
        pool = await connection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 2. Chèn vào bảng [Post] trước để lấy Post_id
        const postQuery = `
            DECLARE @PostOutput TABLE (Post_id BIGINT);
            INSERT INTO [Post] (User_id, [Content], location, hashtags) 
            OUTPUT inserted.Post_id INTO @PostOutput
            VALUES (@user_id, @content, @location, @hashtags);
            SELECT Post_id FROM @PostOutput;
        `;
        const postRes = await transaction.request()
            .input('user_id', sql.VarChar(26), user_id)
            .input('content', sql.NVarChar(250), caption) 
            .input('location', sql.NVarChar(255), location)
            .input('hashtags', sql.NVarChar(255), hashtags)
            .query(postQuery);
        
        const postId = postRes.recordset[0].Post_id;
        console.log(`✅ Đã tạo Post với ID: ${postId}`);

        // 3. Upload file lên Cloudinary (giống như profile)
        // Lưu ý: Nếu upload thất bại, transaction sẽ rollback và Post sẽ không được tạo
        console.log(`📤 Đang tải file buffer lên Cloudinary cho post ${postId}...`);
        let file_url;
        try {
            const uploadResult = await uploadPostToCloudinary(req.file.buffer, postId, isImage);
            
            if (!uploadResult || !uploadResult.secure_url) {
                console.error("Lỗi: Cloudinary không trả về secure_url.");
                throw new Error("Tải lên Cloudinary thất bại.");
            }
            file_url = uploadResult.secure_url;
            console.log("Cloudinary trả về URL:", file_url);
        } catch (uploadError) {
            console.error('❌ Lỗi khi upload lên Cloudinary:', uploadError);
            throw new Error(`Không thể upload ${isImage ? 'ảnh' : 'video'} lên Cloudinary: ${uploadError.message}`);
        }

        // 4. Chèn vào bảng [Content]
        console.log("Đang lưu URL vào CSDL...");
        const contentQuery = `
            DECLARE @ContentOutput TABLE (Content_id INT);
            INSERT INTO [Content] (Post_id)
            OUTPUT inserted.Content_id INTO @ContentOutput
            VALUES (@post_id);
            SELECT Content_id FROM @ContentOutput;
        `;
        const contentRes = await transaction.request()
            .input('post_id', sql.BigInt, postId)
            .query(contentQuery);
        
        const contentId = contentRes.recordset[0].Content_id;

        // 5. Chèn vào [ImageContent] HOẶC [VideoContent] với URL Cloudinary
        if (isImage) {
            await transaction.request()
                .input('content_id', sql.Int, contentId)
                .input('image_url', sql.VarChar(500), file_url)
                .query("INSERT INTO [ImageContent] (Content_id, ImageURL) VALUES (@content_id, @image_url)");
        } else {
            await transaction.request()
                .input('content_id', sql.Int, contentId)
                .input('video_url', sql.VarChar(500), file_url)
                .query("INSERT INTO [VideoContent] (Content_id, VideoURL) VALUES (@content_id, @video_url)");
        }
        console.log("Lưu CSDL thành công.");

        await transaction.commit();
        
        console.log(`✅ Tạo bài viết thành công cho post ${postId}`);
        res.status(201).json({ 
            message: "Bài viết đã được tạo thành công", 
            postId: postId
        });

    } catch (err) {
        if (transaction) {
            try {
                await transaction.rollback(); 
                console.log("✅ Đã rollback transaction");
            } catch (rollErr) {
                console.error("Lỗi khi rollback:", rollErr);
            }
        }
        console.error('❌ LỖI NGHIÊM TRỌNG TRONG HÀM TẠO BÀI VIẾT:', err); 
        // Gửi lỗi chi tiết hơn về client
        res.status(500).json({ 
            message: "Lỗi Server - Giao dịch thất bại", 
            error: err.message,
            sqlError: err.originalError ? err.originalError.info : null 
        });
    }
});

// Route lấy bài viết trending (nhiều likes nhất) - PHẢI ĐẶT TRƯỚC route /:postId
router.get('/trending', optionalAuth, async (req, res) => {
    try {
        const pool = await connection();
        const userId = req.user?.id || null; // Lấy user ID nếu đã đăng nhập
        
        let query = `
            SELECT 
                p.Post_id as id, 
                p.user_id, 
                p.[Content] as caption,
                p.location, 
                p.hashtags, 
                p.created_at, 
                u.Email as username, 
                u.First_Name,
                u.Last_name,
                u.First_Name + ' ' + u.Last_name AS full_name,
                u.Profile_Picture as profile_picture_url,
                img.ImageURL as image_url, 
                vid.VideoURL as video_url,
                (SELECT COUNT(*) FROM [Likes] WHERE Post_id = p.Post_id) as likes_count,
                (SELECT COUNT(*) FROM [Comment] WHERE post_id = p.Post_id) as comments_count
        `;
        
        // Thêm is_liked_by_user nếu có user đăng nhập
        if (userId) {
            query += `,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM [Likes] WHERE Post_id = p.Post_id AND User_id = @user_id
                    ) THEN 1 
                    ELSE 0 
                END as is_liked_by_user
            `;
        } else {
            query += `, 0 as is_liked_by_user`;
        }
        
        query += `
            FROM 
                [Post] p
            JOIN 
                Users u ON p.user_id = u.User_id
            LEFT JOIN 
                [Content] c ON p.Post_id = c.Post_id
            LEFT JOIN 
                [ImageContent] img ON c.Content_id = img.Content_id
            LEFT JOIN
                [VideoContent] vid ON c.Content_id = vid.Content_id
            WHERE 
                img.ImageURL IS NOT NULL OR vid.VideoURL IS NOT NULL
            ORDER BY 
                (SELECT COUNT(*) FROM [Likes] WHERE Post_id = p.Post_id) DESC,
                p.created_at DESC
        `;
        
        const request = pool.request();
        if (userId) {
            request.input('user_id', sql.VarChar(26), userId);
        }
        
        const result = await request.query(query);
        
        // Format kết quả - URL đã là Cloudinary URL hoặc local URL
        const posts = result.recordset.map(post => {
            return {
                ...post,
                image_url: post.image_url || null,
                video_url: post.video_url || null,
                likes_count: parseInt(post.likes_count) || 0,
                is_liked_by_user: post.is_liked_by_user === 1 || post.is_liked_by_user === true,
                comments_count: parseInt(post.comments_count) || 0
            };
        });
        
        res.json(posts);
    } catch (err) {
        console.error("Error fetching trending posts:", err);
        res.status(500).json({ error: "Lỗi Server", message: err.message });
    }
});

// Các route này trỏ đến postController
router.post('/:postId/like', authenticateToken, toggleLike);
router.get('/:postId/comments', optionalAuth, getComments); // Lấy danh sách bình luận (optional auth để lấy like status)
router.post('/:postId/comments', authenticateToken, addComment);
router.post('/:postId/comments/:commentId/like', authenticateToken, toggleCommentLike); // Like/unlike comment
router.put('/:postId', authenticateToken, updatePost); // Sửa bài viết
router.delete('/:postId', authenticateToken, deletePost); // Xóa bài viết


// ✅ SỬA LỖI: Viết lại route GET / bằng cú pháp MSSQL
router.get('/', optionalAuth, async (req, res) => {
    try {
        const pool = await connection();
        const userId = req.user?.id || null; // Lấy user ID nếu đã đăng nhập
        
        let query = `
            SELECT 
                p.Post_id as id, 
                p.user_id, 
                p.[Content] as caption,
                p.location, 
                p.hashtags, 
                p.created_at, 
                u.Email as username, 
                u.First_Name,
                u.Last_name,
                u.First_Name + ' ' + u.Last_name AS full_name,
                u.Profile_Picture as profile_picture_url,
                img.ImageURL as image_url, 
                vid.VideoURL as video_url,
                (SELECT COUNT(*) FROM [Likes] WHERE Post_id = p.Post_id) as likes_count,
                (SELECT COUNT(*) FROM [Comment] WHERE post_id = p.Post_id) as comments_count
        `;
        
        // Thêm is_liked_by_user nếu có user đăng nhập
        if (userId) {
            query += `,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM [Likes] WHERE Post_id = p.Post_id AND User_id = @user_id
                    ) THEN 1 
                    ELSE 0 
                END as is_liked_by_user
            `;
        } else {
            query += `, 0 as is_liked_by_user`;
        }
        
        query += `
            FROM 
                [Post] p
            JOIN 
                Users u ON p.user_id = u.User_id
            LEFT JOIN 
                [Content] c ON p.Post_id = c.Post_id
            LEFT JOIN 
                [ImageContent] img ON c.Content_id = img.Content_id
            LEFT JOIN
                [VideoContent] vid ON c.Content_id = vid.Content_id
            ORDER BY 
                p.created_at DESC
        `;
        
        const request = pool.request();
        if (userId) {
            request.input('user_id', sql.VarChar(26), userId);
        }
        
        const result = await request.query(query);
        
        // Format kết quả - URL đã là Cloudinary URL hoặc local URL
        const posts = result.recordset.map(post => {
            return {
                ...post,
                image_url: post.image_url || null,
                video_url: post.video_url || null,
                likes_count: parseInt(post.likes_count) || 0,
                is_liked_by_user: post.is_liked_by_user === 1 || post.is_liked_by_user === true,
                comments_count: parseInt(post.comments_count) || 0
            };
        });
        
        res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Lỗi Server", message: err.message });
    }
});

// Xử lý lỗi Multer (Giữ nguyên)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Lỗi Multer: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

export default router;

