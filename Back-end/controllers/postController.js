// /controllers/postController.js
import pool from '../db.js';

// --- CHỨC NĂNG THÍCH / BỎ THÍCH ---
export const toggleLike = async (req, res) => {
    const { postId } = req.params;
    // THAY ĐỔI: Lấy userId từ body thay vì từ token
    // CẢNH BÁO: Cách làm này không an toàn cho môi trường thực tế!
    const { userId } = req.body; 

    if (!userId) {
        return res.status(400).json({ error: 'userId là bắt buộc.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const existingLike = await client.query(
            'SELECT * FROM Likes WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );
        if (existingLike.rows.length > 0) {
            await client.query(
                'DELETE FROM Likes WHERE user_id = $1 AND post_id = $2',
                [userId, postId]
            );
            await client.query('COMMIT');
            res.status(200).json({ message: 'Đã bỏ thích bài viết.' });
        } else {
            await client.query(
                'INSERT INTO Likes (user_id, post_id) VALUES ($1, $2)',
                [userId, postId]
            );
            await client.query('COMMIT');
            res.status(200).json({ message: 'Đã thích bài viết.' });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi khi xử lý like:", error);
        res.status(500).json({ error: 'Lỗi server' });
    } finally {
        client.release();
    }
};

// --- CHỨC NĂNG THÊM BÌNH LUẬN ---
export const addComment = async (req, res) => {
    const { postId } = req.params;
    // THAY ĐỔI: Lấy userId và content từ body
    const { userId, content } = req.body;

    if (!userId || !content || content.trim() === '') {
        return res.status(400).json({ error: 'userId và nội dung bình luận là bắt buộc.' });
    }

    try {
        const newCommentQuery = `
            INSERT INTO Comments (user_id, post_id, content) 
            VALUES ($1, $2, $3) 
            RETURNING id, content, created_at, user_id, post_id
        `;
        const result = await pool.query(newCommentQuery, [userId, postId, content]);
        const newComment = result.rows[0];
        
        const userResult = await pool.query('SELECT username, profile_picture_url FROM Users WHERE id = $1', [userId]);
        
        const responseComment = {
            ...newComment,
            username: userResult.rows[0].username,
            profile_picture_url: userResult.rows[0].profile_picture_url
        };
        res.status(201).json({ message: 'Đã thêm bình luận.', comment: responseComment });
    } catch (error) {
        console.error("Lỗi khi thêm bình luận:", error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};