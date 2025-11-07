import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');

/**
 * Follow/Unfollow một người dùng
 * POST /api/users/:userId/follow
 */
const toggleFollow = async (req, res) => {
    const { userId } = req.params; // ID của người được follow/unfollow
    const currentUserId = req.user.id; // ID của người đang đăng nhập

    if (!currentUserId) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện hành động này.' });
    }

    if (currentUserId === userId) {
        return res.status(400).json({ error: 'Bạn không thể follow chính mình.' });
    }

    try {
        const pool = await connection();
        const request = pool.request();

        // 1. Kiểm tra user có tồn tại không
        const userCheck = await request
            .input('user_id', sql.VarChar(26), userId)
            .query('SELECT User_id FROM Users WHERE User_id = @user_id');
        
        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        // 2. Kiểm tra đã follow chưa
        const followCheck = await request
            .input('followers_id', sql.VarChar(26), currentUserId)
            .input('famous_user_id', sql.VarChar(26), userId)
            .query('SELECT * FROM [Follow] WHERE Followers_id = @followers_id AND FamousUser_id = @famous_user_id');

        if (followCheck.recordset.length > 0) {
            // 3. Unfollow (xóa record)
            await pool.request()
                .input('followers_id', sql.VarChar(26), currentUserId)
                .input('famous_user_id', sql.VarChar(26), userId)
                .query('DELETE FROM [Follow] WHERE Followers_id = @followers_id AND FamousUser_id = @famous_user_id');
            
            res.status(200).json({ 
                message: 'Đã bỏ theo dõi.',
                isFollowing: false
            });
        } else {
            // 4. Follow (thêm record)
            await pool.request()
                .input('followers_id', sql.VarChar(26), currentUserId)
                .input('famous_user_id', sql.VarChar(26), userId)
                .query('INSERT INTO [Follow] (Followers_id, FamousUser_id) VALUES (@followers_id, @famous_user_id)');
            
            // 5. Tạo notification cho người được follow
            try {
                // Lấy thông tin người follow để hiển thị trong notification
                const followerInfo = await pool.request()
                    .input('user_id', sql.VarChar(26), currentUserId)
                    .query(`
                        SELECT First_Name + ' ' + Last_name AS full_name, Email
                        FROM Users
                        WHERE User_id = @user_id
                    `);
                
                const followerName = followerInfo.recordset[0]?.full_name || followerInfo.recordset[0]?.Email || 'Ai đó';
                
                // Tạo notification
                await pool.request()
                    .input('user_id', sql.VarChar(26), userId) // Người được follow
                    .input('actor_id', sql.VarChar(26), currentUserId) // Người follow
                    .input('notification_type', sql.VarChar(50), 'follow')
                    .input('message', sql.NVarChar(500), `${followerName} đã bắt đầu theo dõi bạn.`)
                    .query(`
                        INSERT INTO notifications (user_id, actor_id, notification_type, message, is_read, created_at)
                        VALUES (@user_id, @actor_id, @notification_type, @message, 0, GETDATE())
                    `);
                
                console.log(`✅ Đã tạo notification follow: ${currentUserId} follow ${userId}`);
            } catch (notifError) {
                // Log lỗi nhưng không làm ảnh hưởng đến kết quả follow
                console.error('⚠️ Lỗi khi tạo notification follow:', notifError);
            }
            
            res.status(200).json({ 
                message: 'Đã theo dõi.',
                isFollowing: true
            });
        }
    } catch (error) {
        console.error("Lỗi khi xử lý follow:", error);
        res.status(500).json({ error: 'Lỗi server', detail: error.message });
    }
};

/**
 * Kiểm tra trạng thái follow
 * GET /api/users/:userId/follow-status
 */
const getFollowStatus = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?.id || null;

    if (!currentUserId) {
        return res.json({ isFollowing: false });
    }

    try {
        const pool = await connection();
        const result = await pool.request()
            .input('followers_id', sql.VarChar(26), currentUserId)
            .input('famous_user_id', sql.VarChar(26), userId)
            .query('SELECT * FROM [Follow] WHERE Followers_id = @followers_id AND FamousUser_id = @famous_user_id');

        res.json({ isFollowing: result.recordset.length > 0 });
    } catch (error) {
        console.error("Lỗi khi kiểm tra follow status:", error);
        res.status(500).json({ error: 'Lỗi server', detail: error.message });
    }
};

export {
    toggleFollow,
    getFollowStatus
};

