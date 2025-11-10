import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const { uploadToCloudinary } = require('../middlewares/upload.js');

/**
 * Lấy thông tin cá nhân của TÔI (người dùng đã đăng nhập)
 * GET /api/profile/me
 */
const getMe = async (req, res) => {
    const userId = req.user.id; 
    if (!userId) {
        return res.status(401).json({ message: "Token không hợp lệ, không tìm thấy ID" });
    }
    console.log(`--- 🚀 YÊU CẦU LẤY THÔNG TIN "ME" CHO: ${userId} ---`);
    try {
        const pool = await connection();
        const result = await pool.request()
            .input('userId', sql.VarChar(26), userId)
            .query(`
                SELECT 
                    User_id AS id, First_Name, Last_name,
                    First_Name + ' ' + Last_name AS full_name,
                    Email, Profile_Picture, Description AS bio, Role,
                    CONVERT(varchar, Date_Of_Birth, 23) AS Date_Of_Birth,
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Posts
                    (SELECT COUNT(*) FROM [Post] WHERE User_id = Users.User_id) AS postsCount,
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Followers
                    (SELECT COUNT(*) FROM Follow WHERE FamousUser_id = Users.User_id) AS followersCount,
                    
                    (SELECT COUNT(*) FROM Follow WHERE Followers_id = Users.User_id) AS followingCount
                FROM Users
                WHERE User_id = @userId
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        console.log(`✅ Đã tìm thấy thông tin "me" cho: ${userId}`);
        res.json(result.recordset[0]); 
    } catch (err) {
        console.error('❌ Lỗi getMe:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin cá nhân' });
    }
};

/**
 * Lấy thông tin văn bản cho hồ sơ (tên, bio, thống kê)
 * GET /api/profile/info?email=...
 */
const getProfileInfo = async (req, res) => {
    const { email } = req.query; 
    if (!email) {
        return res.status(400).json({ message: 'Thiếu email' });
    }
    console.log(`--- 🚀 YÊU CẦU LẤY THÔNG TIN PROFILE CHO: ${email} ---`);
    try {
        const pool = await connection();
        const result = await pool.request()
            .input('email', sql.NVarChar(255), email)
            .query(`
                SELECT 
                    User_id,
                    First_Name + ' ' + Last_name AS full_name,
                    Email,
                    Description AS bio, 
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Posts
                    (SELECT COUNT(*) FROM [Post] WHERE User_id = Users.User_id) AS postsCount,
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Followers
                    (SELECT COUNT(*) FROM Follow WHERE FamousUser_id = Users.User_id) AS followersCount,
                    
                    (SELECT COUNT(*) FROM Follow WHERE Followers_id = Users.User_id) AS followingCount
                FROM Users
                WHERE Email = @email
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        console.log(`✅ Đã tìm thấy thông tin profile cho: ${email}`);
        res.json(result.recordset[0]); 
    } catch (err) {
        console.error('❌ Lỗi getProfileInfo:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin hồ sơ' });
    }
};

/**
 * Lấy URL ảnh đại diện
 * GET /api/profile/image?email=...
 */
const getProfileImage = async (req, res) => {
    // (Hàm này không bị ảnh hưởng, giữ nguyên)
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: 'Thiếu email' });
    }
    console.log(`--- 🚀 YÊU CẦU LẤY ẢNH PROFILE CHO: ${email} ---`);
    try {
        const pool = await connection();
        const result = await pool.request()
            .input('email', sql.NVarChar(255), email)
            .query(`
                SELECT Profile_Picture AS profile_picture_url 
                FROM Users
                WHERE Email = @email
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        console.log(`✅ Đã tìm thấy ảnh profile cho: ${email}`);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('❌ Lỗi getProfileImage:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy ảnh hồ sơ' });
    }
};

/**
 * Lấy thông tin profile của người dùng khác (theo userId)
 * GET /api/profile/:userId
 */
const getUserProfile = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?.id || null; // Người dùng đăng nhập (nếu có)
    
    if (!userId) {
        return res.status(400).json({ message: 'Thiếu userId' });
    }
    
    console.log(`--- 🚀 YÊU CẦU LẤY THÔNG TIN PROFILE CHO: ${userId} (người xem: ${currentUserId || 'anonymous'}) ---`);
    
    try {
        const pool = await connection();
        
        // Kiểm tra xem userId là email hay User_id
        // Nếu có ký tự @ thì là email, ngược lại là User_id
        const isEmail = userId.includes('@');
        
        let result;
        let targetUserId;
        
        if (isEmail) {
            // Tìm kiếm theo email
            result = await pool.request()
                .input('email', sql.NVarChar(255), userId)
                .query(`
                    SELECT 
                        User_id AS id, 
                        First_Name, 
                        Last_name,
                        First_Name + ' ' + Last_name AS full_name,
                        Email, 
                        Profile_Picture, 
                        Description AS bio, 
                        Role,
                        CONVERT(varchar, Date_Of_Birth, 23) AS Date_Of_Birth,
                        
                        -- ✅ SỬA LỖI: Tính toán động số lượng Posts
                        (SELECT COUNT(*) FROM [Post] WHERE User_id = Users.User_id) AS postsCount,
                        
                        -- Tính toán động số lượng Followers
                        (SELECT COUNT(*) FROM Follow WHERE FamousUser_id = Users.User_id) AS followersCount,
                        
                        -- Tính toán động số lượng Following
                        (SELECT COUNT(*) FROM Follow WHERE Followers_id = Users.User_id) AS followingCount
                    FROM Users
                    WHERE Email = @email
                `);
        } else {
            // Tìm kiếm theo User_id
            result = await pool.request()
                .input('userId', sql.VarChar(26), userId)
                .query(`
                    SELECT 
                        User_id AS id, 
                        First_Name, 
                        Last_name,
                        First_Name + ' ' + Last_name AS full_name,
                        Email, 
                        Profile_Picture, 
                        Description AS bio, 
                        Role,
                        CONVERT(varchar, Date_Of_Birth, 23) AS Date_Of_Birth,
                        
                        -- ✅ SỬA LỖI: Tính toán động số lượng Posts
                        (SELECT COUNT(*) FROM [Post] WHERE User_id = Users.User_id) AS postsCount,
                        
                        -- Tính toán động số lượng Followers
                        (SELECT COUNT(*) FROM Follow WHERE FamousUser_id = Users.User_id) AS followersCount,
                        
                        -- Tính toán động số lượng Following
                        (SELECT COUNT(*) FROM Follow WHERE Followers_id = Users.User_id) AS followingCount
                    FROM Users
                    WHERE User_id = @userId
                `);
        }
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        const userProfile = result.recordset[0];
        targetUserId = userProfile.id; // Lấy User_id thực tế từ kết quả
        
        // Kiểm tra xem người dùng hiện tại có đang follow người dùng này không
        let isFollowing = false;
        if (currentUserId && currentUserId !== targetUserId) {
            const followCheck = await pool.request()
                .input('currentUserId', sql.VarChar(26), currentUserId)
                .input('targetUserId', sql.VarChar(26), targetUserId)
                .query(`
                    SELECT COUNT(*) AS count
                    FROM Follow
                    WHERE Followers_id = @currentUserId AND FamousUser_id = @targetUserId
                `);
            
            isFollowing = followCheck.recordset[0].count > 0;
        }
        
        // Kiểm tra xem có phải profile của chính mình không
        const isOwnProfile = currentUserId === targetUserId;
        
        console.log(`✅ Đã tìm thấy thông tin profile cho: ${userId}`);
        res.json({
            ...userProfile,
            isFollowing,
            isOwnProfile
        });
    } catch (err) {
        console.error('❌ Lỗi getUserProfile:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin profile' });
    }
};

/**
 * CẬP NHẬT: Cập nhật thông tin (text) của TÔI
 * PUT /api/profile/me
 */
const updateMe = async (req, res) => {
    const userId = req.user.id;
    const { First_Name, Last_name, Description, Date_Of_Birth } = req.body;

    if (!First_Name || !Last_name) {
        return res.status(400).json({ message: "Tên và Họ không được để trống." });
    }
    console.log(`--- 🚀 YÊU CẦU CẬP NHẬT PROFILE CHO: ${userId} ---`);
    try {
        const pool = await connection();
        const request = pool.request();
        request.input('userId', sql.VarChar(26), userId);
        request.input('firstName', sql.NVarChar(255), First_Name);
        request.input('lastName', sql.NVarChar(255), Last_name);
        request.input('bio', sql.NVarChar(255), Description || null);
        request.input('dob', sql.Date, Date_Of_Birth || null); 

        // 1. Cập nhật dữ liệu
        await request.query(`
            UPDATE [Users] 
            SET 
                [First_Name] = @firstName, 
                [Last_name] = @lastName, 
                [Description] = @bio,
                [Date_Of_Birth] = @dob  
            WHERE [User_id] = @userId;
        `);

        // 2. Trả về thông tin user ĐÃ CẬP NHẬT
        const updatedResult = await pool.request()
            .input('userIdUpdated', sql.VarChar(26), userId) 
            .query(`
                SELECT 
                    User_id AS id, First_Name, Last_name,
                    First_Name + ' ' + Last_name AS full_name,
                    Email, Profile_Picture, Description AS bio, Role,
                    CONVERT(varchar, Date_Of_Birth, 23) AS Date_Of_Birth,
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Posts
                    (SELECT COUNT(*) FROM [Post] WHERE User_id = Users.User_id) AS postsCount,
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Followers
                    (SELECT COUNT(*) FROM Follow WHERE FamousUser_id = Users.User_id) AS followersCount,
                    
                    (SELECT COUNT(*) FROM Follow WHERE Followers_id = Users.User_id) AS followingCount
                FROM Users
                WHERE User_id = @userIdUpdated
            `);
        console.log(`✅ Cập nhật profile thành công cho: ${userId}`);
        res.status(200).json(updatedResult.recordset[0]);
    } catch (err) {
        console.error('❌ Lỗi updateMe:', err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật hồ sơ' });
    }
};

/**
 * HÀM MỚI: Cập nhật ảnh đại diện
 * PUT /api/profile/picture
 */
const updateProfilePicture = async (req, res) => {
    const userId = req.user.id;
    console.log(`--- 🚀 YÊU CẦU CẬP NHẬT ẢNH PROFILE CHO: ${userId} ---`);
    try {
        // 1. Kiểm tra file
        console.log("Kiểm tra req.file...");
        if (!req.file) {
            console.error("Lỗi 400: Không tìm thấy req.file.");
            return res.status(400).json({ message: "Không tìm thấy file ảnh." });
        }
        console.log("Tìm thấy file:", req.file.originalname, "Size:", req.file.size);

        // 2. Tải file buffer lên Cloudinary
        console.log("Đang tải file buffer lên Cloudinary...");
        const uploadResult = await uploadToCloudinary(req.file.buffer, userId);
        
        if (!uploadResult || !uploadResult.secure_url) {
            console.error("Lỗi: Cloudinary không trả về secure_url.");
            throw new Error("Tải lên Cloudinary thất bại.");
        }
        const newImageUrl = uploadResult.secure_url;
        console.log("Cloudinary trả về URL:", newImageUrl);

        // 3. Lưu URL mới vào CSDL
        console.log("Đang lưu URL vào CSDL...");
        const pool = await connection();
        const request = pool.request();
        request.input('userId', sql.VarChar(26), userId);
        request.input('newImageUrl', sql.VarChar(255), newImageUrl);
        await request.query(`
            UPDATE [Users] 
            SET [Profile_Picture] = @newImageUrl
            WHERE [User_id] = @userId;
        `);
        console.log("Lưu CSDL thành công.");

        // 4. Trả về thông tin user đã cập nhật
        console.log("Đang lấy lại thông tin user đã cập nhật...");
        const updatedResult = await pool.request()
            .input('userIdUpdated', sql.VarChar(26), userId) 
            .query(`
                SELECT 
                    User_id AS id, First_Name, Last_name,
                    First_Name + ' ' + Last_name AS full_name,
                    Email, Profile_Picture, Description AS bio, Role,
                    CONVERT(varchar, Date_Of_Birth, 23) AS Date_Of_Birth,
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Posts
                    (SELECT COUNT(*) FROM [Post] WHERE User_id = Users.User_id) AS postsCount,
                    
                    -- ✅ SỬA LỖI: Tính toán động số lượng Followers
                    (SELECT COUNT(*) FROM Follow WHERE FamousUser_id = Users.User_id) AS followersCount,
                    
                    (SELECT COUNT(*) FROM Follow WHERE Followers_id = Users.User_id) AS followingCount
                FROM Users
                WHERE User_id = @userIdUpdated
            `);
        
        console.log(`✅ Cập nhật ảnh thành công cho: ${userId}`);
        res.status(200).json(updatedResult.recordset[0]);
    } catch (err) {
        console.error('❌ LỖI NGHIÊM TRỌNG TRONG HÀM updateProfilePicture:', err); 
        res.status(500).json({ message: 'Lỗi server khi cập nhật ảnh đại diện.' });
    }
};

// Đảm bảo export
export {
    getMe,
    getProfileInfo,
    getProfileImage,
    updateMe,
    updateProfilePicture,
    getUserProfile
};

