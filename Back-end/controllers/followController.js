import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const { notificationConnection } = require('../src/Config/NotificationSqlConnection.js'); // ✅ thêm

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

        const userCheck = await request
            .input('user_id', sql.VarChar(26), userId)
            .query('SELECT User_id FROM Users WHERE User_id = @user_id');
        
        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        const followCheck = await request
            .input('followers_id', sql.VarChar(26), currentUserId)
            .input('famous_user_id', sql.VarChar(26), userId)
            .query('SELECT * FROM [Follow] WHERE Followers_id = @followers_id AND FamousUser_id = @famous_user_id');

        if (followCheck.recordset.length > 0) {
            await pool.request()
                .input('followers_id', sql.VarChar(26), currentUserId)
                .input('famous_user_id', sql.VarChar(26), userId)
                .query('DELETE FROM [Follow] WHERE Followers_id = @followers_id AND FamousUser_id = @famous_user_id');
            
            res.status(200).json({ 
                message: 'Đã bỏ theo dõi.',
                isFollowing: false
            });
        } else {

            await pool.request()
                .input('followers_id', sql.VarChar(26), currentUserId)
                .input('famous_user_id', sql.VarChar(26), userId)
                .query('INSERT INTO [Follow] (Followers_id, FamousUser_id) VALUES (@followers_id, @famous_user_id)');
            
            // 5. Tạo notification cho người được follow
            try {
                // Lấy thông tin người follow để hiển thị trong notification (DB chính)
                const followerInfo = await pool.request()
                    .input('user_id', sql.VarChar(26), currentUserId)
                    .query(`
                        SELECT First_Name + ' ' + Last_name AS full_name, Email
                        FROM Users
                        WHERE User_id = @user_id
                    `);

                const infoRow = followerInfo.recordset[0] || {};
                const followerName = infoRow.full_name || infoRow.Email || 'Ai đó';

                // Ghi notification sang DB StarSocialNotification (bảng NotificationTable)
                const notifPool = await notificationConnection();

                await notifPool.request()
                    .input('Content_Id', sql.Int, null)                      
                    .input('Creator_Id', sql.VarChar(26), currentUserId)     
                    .input('User_Id', sql.VarChar(26), userId)               
                    .input('Type', sql.VarChar(50), 'follow')
                    .query(`
                        INSERT INTO dbo.NotificationTable (Time, Content_Id, Creator_Id, User_Id, Type, Is_read)
                        VALUES (GETDATE(), @Content_Id, @Creator_Id, @User_Id, @Type, 0)
                    `);

                console.log(`✅ Đã tạo notification follow: ${currentUserId} follow ${userId} (${followerName})`);
            } catch (notifError) {
                
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
