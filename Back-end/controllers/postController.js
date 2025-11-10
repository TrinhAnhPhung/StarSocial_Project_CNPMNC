// ✅ SỬA LỖI: Chuyển sang cú pháp MSSQL
// Giả sử file db.js của bạn export { sql, connection }
// Nếu không, hãy sửa đường dẫn này cho đúng
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js'); 
const { notificationConnection } = require('../src/Config/NotificationSqlConnection.js'); // ✅ thêm duy nhất 1 dòng import
import { updateMe } from './profileController.js';

// --- CHỨC NĂNG THÍCH / BỎ THÍCH ---
const toggleLike = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user?.id; 

    console.log(`[toggleLike] postId: ${postId}, userId: ${userId}`);

    if (!userId) {
        console.error("[toggleLike] Không có userId từ token");
        return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện hành động này.' });
    }

    // Validate postId - chuyển sang number nếu có thể
    const postIdNum = parseInt(postId, 10);
    if (!postId || isNaN(postIdNum) || postIdNum <= 0) {
        console.error(`[toggleLike] postId không hợp lệ: ${postId}`);
        return res.status(400).json({ error: 'ID bài viết không hợp lệ.' });
    }

    try {
        const pool = await connection();

        // Kiểm tra post có tồn tại không + lấy luôn chủ bài viết
        const postCheck = await pool.request()
            .input('post_id', sql.BigInt, postIdNum)
            .query('SELECT Post_id, user_id FROM [Post] WHERE Post_id = @post_id'); // ✅ chỉ thêm user_id
        
        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        }

        const postOwnerId = postCheck.recordset[0].user_id; // ✅ dùng cho notification

        // 1. Kiểm tra xem đã like chưa
        // Thử với tên cột chữ hoa đầu trước (User_id, Post_id)
        let existingLike;
        try {
            existingLike = await pool.request()
                .input('user_id', sql.VarChar(26), userId)
                .input('post_id', sql.BigInt, postIdNum)
                .query('SELECT * FROM [Likes] WHERE User_id = @user_id AND Post_id = @post_id');
        } catch (colError) {
            // Nếu lỗi do tên cột, thử với chữ thường
            console.warn("⚠️ Thử lại với tên cột chữ thường:", colError.message);
            existingLike = await pool.request()
                .input('user_id', sql.VarChar(26), userId)
                .input('post_id', sql.BigInt, postIdNum)
                .query('SELECT * FROM [Likes] WHERE user_id = @user_id AND post_id = @post_id');
        }

        if (existingLike.recordset.length > 0) {
            // 2. Bỏ thích
            try {
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId)
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('DELETE FROM [Likes] WHERE User_id = @user_id AND Post_id = @post_id');
            } catch (delError) {
                // Thử với chữ thường nếu lỗi
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId)
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('DELETE FROM [Likes] WHERE user_id = @user_id AND post_id = @post_id');
            }
            
            // Lấy số lượng like mới
            let likeCountResult;
            try {
                likeCountResult = await pool.request()
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('SELECT COUNT(*) as count FROM [Likes] WHERE Post_id = @post_id');
            } catch (countError) {
                likeCountResult = await pool.request()
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('SELECT COUNT(*) as count FROM [Likes] WHERE post_id = @post_id');
            }
            
            const likesCount = parseInt(likeCountResult.recordset[0].count) || 0;
            
            res.status(200).json({ 
                message: 'Đã bỏ thích bài viết.',
                is_liked: false,
                likes_count: likesCount
            });
        } else {
            // 3. Thích
            try {
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId)
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('INSERT INTO [Likes] (User_id, Post_id) VALUES (@user_id, @post_id)');
            } catch (insError) {
                // Thử với chữ thường nếu lỗi
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId)
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('INSERT INTO [Likes] (user_id, post_id) VALUES (@user_id, @post_id)');
            }
            
            // Lấy số lượng like mới
            let likeCountResult;
            try {
                likeCountResult = await pool.request()
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('SELECT COUNT(*) as count FROM [Likes] WHERE Post_id = @post_id');
            } catch (countError) {
                likeCountResult = await pool.request()
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('SELECT COUNT(*) as count FROM [Likes] WHERE post_id = @post_id');
            }
            
            const likesCount = parseInt(likeCountResult.recordset[0].count) || 0;

            // ✅ THÔNG BÁO LIKE: người khác thích bài viết của tôi
            try {
                if (postOwnerId && String(postOwnerId) !== String(userId)) {
                    const notifPool = await notificationConnection();
                    await notifPool.request()
                        .input('Content_Id', sql.BigInt, postIdNum)
                        .input('Creator_Id', sql.VarChar(26), userId)
                        .input('User_Id', sql.VarChar(26), postOwnerId)
                        .input('Type', sql.VarChar(50), 'like')
                        .query(`
                            INSERT INTO dbo.NotificationTable (Time, Content_Id, Creator_Id, User_Id, Type, Is_read)
                            VALUES (GETDATE(), @Content_Id, @Creator_Id, @User_Id, @Type, 0)
                        `);
                    console.log(`✅ Notification like: ${userId} → post ${postIdNum} (owner ${postOwnerId})`);
                }
            } catch (notifErr) {
                console.error('⚠️ Lỗi khi tạo notification like:', notifErr);
            }
            
            res.status(200).json({ 
                message: 'Đã thích bài viết.',
                is_liked: true,
                likes_count: likesCount
            });
        }
    } catch (error) {
        console.error("❌ Lỗi khi xử lý like:", error);
        console.error("❌ Error details:", {
            message: error.message,
            code: error.code,
            originalError: error.originalError?.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Lỗi server', 
            detail: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
};

// --- CHỨC NĂNG THÊM BÌNH LUẬN ---
const addComment = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id; 
    const { content } = req.body; 

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Nội dung bình luận là bắt buộc.' });
    }

    // Validate postId - chuyển sang number nếu có thể
    const postIdNum = parseInt(postId, 10);
    if (!postId || isNaN(postIdNum) || postIdNum <= 0) {
        return res.status(400).json({ error: 'ID bài viết không hợp lệ.' });
    }

    try {
        const pool = await connection();
        
        // Kiểm tra post có tồn tại không + lấy luôn chủ bài viết
        const postCheck = await pool.request()
            .input('post_id', sql.BigInt, postIdNum)
            .query('SELECT Post_id, user_id FROM [Post] WHERE Post_id = @post_id'); // ✅ thêm user_id
        
        if (postCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        }

        const postOwnerId = postCheck.recordset[0].user_id; // ✅ dùng cho notification
        
        // 1. Chèn bình luận mới
        // Sử dụng OUTPUT INTO table variable vì bảng Comment có trigger
        let result;
        try {
            const newCommentQuery = `
                DECLARE @CommentOutput TABLE (
                    Comment_id BIGINT,
                    content NVARCHAR(500),
                    Time DATETIME,
                    user_id VARCHAR(26),
                    post_id BIGINT
                );
                
                INSERT INTO [Comment] (user_id, post_id, content) 
                OUTPUT inserted.Comment_id, inserted.content, 
                       inserted.Time, 
                       inserted.user_id, inserted.post_id
                INTO @CommentOutput
                VALUES (@user_id, @post_id, @content);
                
                SELECT 
                    Comment_id as id, 
                    content, 
                    Time as created_at, 
                    user_id, 
                    post_id
                FROM @CommentOutput;
            `;
            result = await pool.request()
                .input('user_id', sql.VarChar(26), userId)
                .input('post_id', sql.BigInt, postIdNum)
                .input('content', sql.NVarChar(500), content.trim())
                .query(newCommentQuery);
        } catch (insertError) {
            // Nếu lỗi do cột Time, thử lại với GETDATE()
            console.error("Lỗi khi insert comment (thử lại):", insertError.message);
            const fallbackQuery = `
                DECLARE @CommentOutput TABLE (
                    Comment_id BIGINT,
                    content NVARCHAR(500),
                    created_at DATETIME,
                    user_id VARCHAR(26),
                    post_id BIGINT
                );
                
                INSERT INTO [Comment] (user_id, post_id, content) 
                OUTPUT inserted.Comment_id, inserted.content, 
                       GETDATE(), 
                       inserted.user_id, inserted.post_id
                INTO @CommentOutput
                VALUES (@user_id, @post_id, @content);
                
                SELECT 
                    Comment_id as id, 
                    content, 
                    created_at, 
                    user_id, 
                    post_id
                FROM @CommentOutput;
            `;
            result = await pool.request()
                .input('user_id', sql.VarChar(26), userId)
                .input('post_id', sql.BigInt, postIdNum)
                .input('content', sql.NVarChar(500), content.trim())
                .query(fallbackQuery);
        }

        if (!result || !result.recordset || result.recordset.length === 0) {
            console.error("Không thể tạo bình luận - không có recordset");
            return res.status(500).json({ error: 'Không thể tạo bình luận.' });
        }

        const newComment = result.recordset[0];
        
        // 2. Lấy thông tin user
        const userResult = await pool.request()
            .input('user_id', sql.VarChar(26), userId)
            .query('SELECT Email, Profile_Picture, First_Name, Last_name FROM Users WHERE User_id = @user_id');
        
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }
        
        const user = userResult.recordset[0];
        
        // Lấy likes_count cho comment mới (sẽ là 0)
        // Wrap trong try-catch để tránh lỗi nếu bảng CommentLike chưa có dữ liệu
        let likesCount = 0;
        try {
            const likesCountResult = await pool.request()
                .input('comment_id', sql.BigInt, newComment.id)
                .query('SELECT COUNT(*) as count FROM [CommentLike] WHERE Comment_id = @comment_id');
            likesCount = parseInt(likesCountResult.recordset[0].count) || 0;
        } catch (likeError) {
            console.warn("⚠️ Lỗi khi lấy likes_count cho comment mới (bỏ qua):", likeError.message);
            likesCount = 0; // Mặc định là 0 nếu có lỗi
        }
        
        const responseComment = {
            id: newComment.id,
            content: newComment.content,
            created_at: newComment.created_at,
            user_id: newComment.user_id,
            post_id: newComment.post_id,
            username: user.Email || `${user.First_Name} ${user.Last_name}`.trim(),
            profile_picture_url: user.Profile_Picture || null,
            likes_count: likesCount,
            is_liked_by_user: false // Comment mới chưa được like bởi user hiện tại
        };

        // ✅ THÔNG BÁO COMMENT: người khác bình luận bài của tôi
        try {
            if (postOwnerId && String(postOwnerId) !== String(userId)) {
                const notifPool = await notificationConnection();
                await notifPool.request()
                    .input('Content_Id', sql.BigInt, postIdNum)
                    .input('Creator_Id', sql.VarChar(26), userId)
                    .input('User_Id', sql.VarChar(26), postOwnerId)
                    .input('Type', sql.VarChar(50), 'comment')
                    .query(`
                        INSERT INTO dbo.NotificationTable (Time, Content_Id, Creator_Id, User_Id, Type, Is_read)
                        VALUES (GETDATE(), @Content_Id, @Creator_Id, @User_Id, @Type, 0)
                    `);
                console.log(`✅ Notification comment: ${userId} → post ${postIdNum} (owner ${postOwnerId})`);
            }
        } catch (notifErr) {
            console.error('⚠️ Lỗi khi tạo notification comment:', notifErr);
        }
        
        res.status(201).json({ message: 'Đã thêm bình luận.', comment: responseComment });
    } catch (error) {
        console.error("❌ Lỗi khi thêm bình luận:", error);
        console.error("❌ Error details:", {
            message: error.message,
            code: error.code,
            originalError: error.originalError?.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Lỗi server', 
            detail: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
};

// --- CHỨC NĂNG LẤY DANH SÁCH BÌNH LUẬN ---
const getComments = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user?.id || null; // Lấy user ID nếu có token

    // Validate postId - chuyển sang number nếu có thể
    const postIdNum = parseInt(postId, 10);
    if (!postId || isNaN(postIdNum) || postIdNum <= 0) {
        return res.status(400).json({ error: 'ID bài viết không hợp lệ.' });
    }

    try {
        const pool = await connection();
        
        // Query cơ bản - lấy comments trước
        let commentsQuery = `
            SELECT 
                c.Comment_id as id,
                c.content,
                c.Time as created_at,
                c.user_id,
                c.post_id,
                u.Email as username,
                u.Profile_Picture as profile_picture_url,
                u.First_Name,
                u.Last_name
            FROM [Comment] c
            JOIN Users u ON c.user_id = u.User_id
            WHERE c.post_id = @post_id
            ORDER BY c.Time DESC
        `;
        
        const request = pool.request()
            .input('post_id', sql.BigInt, postIdNum);
        
        let result;
        try {
            // Thử query với tên cột chữ hoa
            result = await request.query(commentsQuery);
        } catch (queryError) {
            // Nếu lỗi, thử với tên cột chữ thường
            console.warn("⚠️ Thử query với tên cột chữ thường:", queryError.message);
            
            commentsQuery = `
                SELECT 
                    c.comment_id as id,
                    c.content,
                    c.time as created_at,
                    c.user_id,
                    c.post_id,
                    u.Email as username,
                    u.Profile_Picture as profile_picture_url,
                    u.First_Name,
                    u.Last_name
                FROM [Comment] c
                JOIN Users u ON c.user_id = u.User_id
                WHERE c.post_id = @post_id
                ORDER BY c.time DESC
            `;

            result = await request.query(commentsQuery);
        }

        // Lấy likes_count và is_liked_by_user cho từng comment
        const comments = await Promise.all(result.recordset.map(async (comment) => {
            let likesCount = 0;
            let isLikedByUser = false;

            // Thử lấy likes_count từ bảng CommentLike
            try {
                // Thử với tên cột chữ hoa
                const likesQuery = `
                    SELECT COUNT(*) as count
                    FROM [CommentLike]
                    WHERE Comment_id = @comment_id
                `;
                const likesResult = await pool.request()
                    .input('comment_id', sql.BigInt, comment.id)
                    .query(likesQuery);
                likesCount = parseInt(likesResult.recordset[0]?.count) || 0;

                // Kiểm tra is_liked_by_user nếu có userId
                if (userId) {
                    const isLikedQuery = `
                        SELECT COUNT(*) as count
                        FROM [CommentLike]
                        WHERE Comment_id = @comment_id AND User_id = @user_id
                    `;
                    const isLikedResult = await pool.request()
                        .input('comment_id', sql.BigInt, comment.id)
                        .input('user_id', sql.VarChar(26), userId)
                        .query(isLikedQuery);
                    isLikedByUser = parseInt(isLikedResult.recordset[0]?.count) > 0;
                }
            } catch (likesError) {
                // Nếu lỗi, thử với tên cột chữ thường
                try {
                    const likesQuery = `
                        SELECT COUNT(*) as count
                        FROM [CommentLike]
                        WHERE comment_id = @comment_id
                    `;
                    const likesResult = await pool.request()
                        .input('comment_id', sql.BigInt, comment.id)
                        .query(likesQuery);
                    likesCount = parseInt(likesResult.recordset[0]?.count) || 0;

                    if (userId) {
                        const isLikedQuery = `
                            SELECT COUNT(*) as count
                            FROM [CommentLike]
                            WHERE comment_id = @comment_id AND user_id = @user_id
                        `;
                        const isLikedResult = await pool.request()
                            .input('comment_id', sql.BigInt, comment.id)
                            .input('user_id', sql.VarChar(26), userId)
                            .query(isLikedQuery);
                        isLikedByUser = parseInt(isLikedResult.recordset[0]?.count) > 0;
                    }
                } catch (likesError2) {
                    // Bảng CommentLike có thể không tồn tại - giữ nguyên likesCount = 0
                    console.warn(`⚠️ Không thể lấy likes cho comment ${comment.id}:`, likesError2.message);
                }
            }

            return {
                id: comment.id,
                content: comment.content,
                created_at: comment.created_at,
                user_id: comment.user_id,
                post_id: comment.post_id,
                username: comment.username || `${comment.First_Name} ${comment.Last_name}`.trim(),
                profile_picture_url: comment.profile_picture_url || null,
                likes_count: likesCount,
                is_liked_by_user: isLikedByUser
            };
        }));

        res.status(200).json({ comments });
    } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
        res.status(500).json({ error: 'Lỗi server', detail: error.message });
    }
};

// --- CHỨC NĂNG THÍCH / BỎ THÍCH BÌNH LUẬN ---
const toggleCommentLike = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện hành động này.' });
    }

    // Validate commentId
    const commentIdNum = parseInt(commentId, 10);
    if (!commentId || isNaN(commentIdNum) || commentIdNum <= 0) {
        return res.status(400).json({ error: 'ID bình luận không hợp lệ.' });
    }

    try {
        const pool = await connection();

        // Kiểm tra comment có tồn tại không
        const commentCheck = await pool.request()
            .input('comment_id', sql.BigInt, commentIdNum)
            .query('SELECT Comment_id FROM [Comment] WHERE Comment_id = @comment_id');
        
        if (commentCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bình luận.' });
        }

        // Lấy post_id từ comment để insert vào CommentLike (nếu bảng yêu cầu)
        const commentInfo = await pool.request()
            .input('comment_id', sql.BigInt, commentIdNum)
            .query('SELECT post_id FROM [Comment] WHERE Comment_id = @comment_id');
        
        if (commentInfo.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bình luận.' });
        }
        
        const postIdFromComment = commentInfo.recordset[0].post_id || postIdNum; // Fallback về postId từ params nếu không có

        // Kiểm tra xem đã like chưa - thử cả chữ hoa và chữ thường
        let existingLike;
        try {
            existingLike = await pool.request()
                .input('user_id', sql.VarChar(26), userId)
                .input('comment_id', sql.BigInt, commentIdNum)
                .query('SELECT * FROM [CommentLike] WHERE User_id = @user_id AND Comment_id = @comment_id');
        } catch (colError) {
            // Thử với chữ thường nếu lỗi
            console.warn("⚠️ Thử lại với tên cột chữ thường:", colError.message);
            existingLike = await pool.request()
                .input('user_id', sql.VarChar(26), userId)
                .input('comment_id', sql.BigInt, commentIdNum)
                .query('SELECT * FROM [CommentLike] WHERE user_id = @user_id AND comment_id = @comment_id');
        }

        if (existingLike.recordset.length > 0) {
            // Bỏ thích
            try {
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId)
                    .input('comment_id', sql.BigInt, commentIdNum)
                    .query('DELETE FROM [CommentLike] WHERE User_id = @user_id AND Comment_id = @comment_id');
            } catch (delError) {
                // Thử với chữ thường nếu lỗi
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId)
                    .input('comment_id', sql.BigInt, commentIdNum)
                    .query('DELETE FROM [CommentLike] WHERE user_id = @user_id AND comment_id = @comment_id');
            }
            
            // Lấy số lượng like mới
            let likeCountResult;
            try {
                likeCountResult = await pool.request()
                    .input('comment_id', sql.BigInt, commentIdNum)
                    .query('SELECT COUNT(*) as count FROM [CommentLike] WHERE Comment_id = @comment_id');
            } catch (countError) {
                likeCountResult = await pool.request()
                    .input('comment_id', sql.BigInt, commentIdNum)
                    .query('SELECT COUNT(*) as count FROM [CommentLike] WHERE comment_id = @comment_id');
            }
            
            const likesCount = parseInt(likeCountResult.recordset[0].count) || 0;
            
            res.status(200).json({ 
                message: 'Đã bỏ thích bình luận.',
                is_liked: false,
                likes_count: likesCount
            });
        } else {
            // Thích - Insert với User_id, Comment_id (không cần Post_id nếu không có trong bảng)
            // Thử insert với Post_id trước, nếu lỗi thì bỏ qua Post_id
            try {
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId)
                    .input('post_id', sql.BigInt, postIdFromComment)
                    .input('comment_id', sql.BigInt, commentIdNum)
                    .query('INSERT INTO [CommentLike] (User_id, Post_id, Comment_id) VALUES (@user_id, @post_id, @comment_id)');
            } catch (insError1) {
                // Nếu lỗi do Post_id, thử insert không có Post_id
                console.warn("⚠️ Thử insert không có Post_id:", insError1.message);
                try {
                    await pool.request()
                        .input('user_id', sql.VarChar(26), userId)
                        .input('comment_id', sql.BigInt, commentIdNum)
                        .query('INSERT INTO [CommentLike] (User_id, Comment_id) VALUES (@user_id, @comment_id)');
                } catch (insError2) {
                    // Thử với chữ thường
                    try {
                        await pool.request()
                            .input('user_id', sql.VarChar(26), userId)
                            .input('post_id', sql.BigInt, postIdFromComment)
                            .input('comment_id', sql.BigInt, commentIdNum)
                            .query('INSERT INTO [CommentLike] (user_id, post_id, comment_id) VALUES (@user_id, @post_id, @comment_id)');
                    } catch (insError3) {
                        // Cuối cùng thử không có post_id với chữ thường
                        await pool.request()
                            .input('user_id', sql.VarChar(26), userId)
                            .input('comment_id', sql.BigInt, commentIdNum)
                            .query('INSERT INTO [CommentLike] (user_id, comment_id) VALUES (@user_id, @comment_id)');
                    }
                }
            }
            
            // Lấy số lượng like mới
            let likeCountResult;
            try {
                likeCountResult = await pool.request()
                    .input('comment_id', sql.BigInt, commentIdNum)
                    .query('SELECT COUNT(*) as count FROM [CommentLike] WHERE Comment_id = @comment_id');
            } catch (countError) {
                likeCountResult = await pool.request()
                    .input('comment_id', sql.BigInt, commentIdNum)
                    .query('SELECT COUNT(*) as count FROM [CommentLike] WHERE comment_id = @comment_id');
            }
            
            const likesCount = parseInt(likeCountResult.recordset[0].count) || 0;
            
            res.status(200).json({ 
                message: 'Đã thích bình luận.',
                is_liked: true,
                likes_count: likesCount
            });
        }
    } catch (error) {
        console.error("Lỗi khi xử lý like comment:", error);
        res.status(500).json({ error: 'Lỗi server', detail: error.message });
    }
};

// --- CHỨC NĂNG SỬA BÀI VIẾT ---
const updatePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    const { caption, location, hashtags } = req.body;

    // Validate postId
    const postIdNum = parseInt(postId, 10);
    if (!postId || isNaN(postIdNum) || postIdNum <= 0) {
        return res.status(400).json({ error: 'ID bài viết không hợp lệ.' });
    }

    try {
        const pool = await connection();

        // 1. Kiểm tra chủ sở hữu
        const postResult = await pool.request()
            .input('post_id', sql.BigInt, postIdNum)
            .query('SELECT user_id, [Content], location, hashtags FROM [Post] WHERE Post_id = @post_id');

        if (postResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        }

        const postOwnerId = postResult.recordset[0].user_id;

        // 2. So sánh ID
        if (String(postOwnerId) !== String(userId)) {
            return res.status(403).json({ error: 'Không được phép: Bạn không phải chủ sở hữu.' });
        }

        // 3. Cập nhật bài viết (chỉ cập nhật các trường được cung cấp)
        const updateQuery = `
            UPDATE [Post] 
            SET 
                [Content] = COALESCE(@content, [Content]),
                location = COALESCE(@location, location),
                hashtags = COALESCE(@hashtags, hashtags)
            WHERE Post_id = @post_id;
            
            SELECT 
                p.Post_id as id,
                p.user_id,
                p.[Content] as caption,
                p.location,
                p.hashtags,
                p.created_at
            FROM [Post] p
            WHERE p.Post_id = @post_id;
        `;

        const result = await pool.request()
            .input('post_id', sql.BigInt, postIdNum)
            .input('content', sql.NVarChar(250), caption || null)
            .input('location', sql.NVarChar(255), location || null)
            .input('hashtags', sql.NVarChar(255), hashtags || null)
            .query(updateQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết sau khi cập nhật.' });
        }

        res.status(200).json({ 
            message: 'Đã cập nhật bài viết thành công.',
            post: result.recordset[0]
        });

    } catch (error) {
        console.error("Lỗi khi sửa bài viết:", error);
        res.status(500).json({ error: 'Lỗi server', detail: error.message });
    }
};

// --- CHỨC NĂNG XÓA BÀI VIẾT ---
const deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id; 

    // Validate postId
    const postIdNum = parseInt(postId, 10);
    if (!postId || isNaN(postIdNum) || postIdNum <= 0) {
        return res.status(400).json({ error: 'ID bài viết không hợp lệ.' });
    }

    try {
        const pool = await connection();
        
        // 1. Kiểm tra chủ sở hữu trước (không cần transaction cho việc này)
        const checkRequest = pool.request();
        const postResult = await checkRequest
            .input('post_id', sql.BigInt, postIdNum)
            .query('SELECT user_id FROM [Post] WHERE Post_id = @post_id');

        if (postResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        }

        const postOwnerId = postResult.recordset[0].user_id;

        // 2. So sánh ID
        if (String(postOwnerId) !== String(userId)) {
            return res.status(403).json({ error: 'Không được phép: Bạn không phải chủ sở hữu.' });
        }

        // 3. Xóa theo thứ tự để tránh vi phạm CHECK constraint khi CASCADE DELETE chạy
        // QUAN TRỌNG: Phải xóa TẤT CẢ bản ghi trong Likes trước khi xóa Post
        // Vì CASCADE DELETE sẽ tự động xóa Comments, và trigger có thể cố gắng xóa Likes
        // gây ra vi phạm CHECK constraint nếu còn bản ghi nào đó
        
        // 3.1. Xóa CommentLike của các comments thuộc bài viết này (qua Comment_id)
        // Phải xóa CommentLike trước để tránh trigger khi xóa Comments
        try {
            await pool.request()
                .input('post_id', sql.BigInt, postIdNum)
                .query(`
                    DELETE FROM [CommentLike] 
                    WHERE Comment_id IN (
                        SELECT Comment_id FROM [Comment] WHERE post_id = @post_id
                    )
                `);
        } catch (commentLikeError1) {
            try {
                await pool.request()
                    .input('post_id', sql.BigInt, postIdNum)
                    .query(`
                        DELETE FROM [CommentLike] 
                        WHERE comment_id IN (
                            SELECT comment_id FROM [Comment] WHERE post_id = @post_id
                        )
                    `);
            } catch (commentLikeError2) {
                console.warn("⚠️ Không thể xóa CommentLike (có thể không có):", commentLikeError2?.message || commentLikeError2);
            }
        }

        // 3.2. Xóa Likes có Comment_id của các comments thuộc Post này
        // Phải xóa trước khi xóa Comments để tránh vi phạm CHECK constraint
        try {
            await pool.request()
                .input('post_id', sql.BigInt, postIdNum)
                .query(`
                    DELETE FROM [Likes] 
                    WHERE Comment_id IN (
                        SELECT Comment_id FROM [Comment] WHERE post_id = @post_id
                    )
                `);
        } catch (likeByCommentError1) {
            try {
                await pool.request()
                    .input('post_id', sql.BigInt, postIdNum)
                    .query(`
                        DELETE FROM [Likes] 
                        WHERE comment_id IN (
                            SELECT comment_id FROM [Comment] WHERE post_id = @post_id
                        )
                    `);
            } catch (likeByCommentError2) {
                console.warn("⚠️ Không thể xóa Likes qua Comment (có thể không có):", likeByCommentError2?.message || likeByCommentError2);
            }
        }

        // 3.3. Xóa Likes có Post_id trực tiếp
        // Phải xóa sau khi xóa Likes có Comment_id để đảm bảo không còn bản ghi nào
        try {
            await pool.request()
                .input('post_id', sql.BigInt, postIdNum)
                .query('DELETE FROM [Likes] WHERE Post_id = @post_id');
        } catch (likeError1) {
            try {
                await pool.request()
                    .input('post_id', sql.BigInt, postIdNum)
                    .query('DELETE FROM [Likes] WHERE post_id = @post_id');
            } catch (likeError2) {
                // Có thể không có likes nào - không throw error
                console.warn("⚠️ Không thể xóa Likes với Post_id (có thể không có):", likeError2?.message || likeError2);
            }
        }

        // 3.4. Cuối cùng mới xóa bài viết
        // CASCADE DELETE sẽ tự động xóa Comments và các bản ghi liên quan
        // Nhưng chúng ta đã xóa tất cả Likes trước, nên không còn vi phạm CHECK constraint
        await pool.request()
            .input('post_id', sql.BigInt, postIdNum)
            .query('DELETE FROM [Post] WHERE Post_id = @post_id');

        res.status(200).json({ message: 'Đã xóa bài viết thành công.' });

    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        res.status(500).json({ error: 'Lỗi server', detail: error.message });
    }
};

// ✅ ĐÃ SỬA: Chuyển sang CommonJS
export {
    toggleLike,
    addComment,
    getComments,
    toggleCommentLike,
    updatePost,
    deletePost,
    updateMe
};

