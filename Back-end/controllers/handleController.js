// controllers/handleController.js
import { sql, connection } from '../src/Config/SqlConnection.js';

// ----------------------------------------------------------------
// HÀM 1: Lấy các báo cáo đang chờ xử lý
// ----------------------------------------------------------------
// Logic cho [GET] /api/handle/pending-reports
export const getPendingReportsForHandling = async (req, res) => {
    try {
        const pool = await connection();
        
        const result = await pool.request()
            .query(`
                SELECT 
                    P.Post_id, P.Content, P.Created_At, P.QualityReporter,
                    U.User_id, U.Email, U.First_Name, U.Last_name, U.Profile_Picture
                FROM 
                    [Post] AS P
                JOIN 
                    [Users] AS U ON P.User_id = U.User_id
                WHERE 
                    P.QualityReporter >= 5 
                    AND P.IsLocked = 0
                ORDER BY
                    P.QualityReporter DESC, P.Created_At ASC;
            `);

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error("Lỗi khi lấy danh sách báo cáo (handle):", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ----------------------------------------------------------------
// HÀM 2: Xử lý khóa (ban) bài viết
// ----------------------------------------------------------------
// Logic cho [POST] /api/handle/ban-post
export const banPostHandler = async (req, res) => {
    const { postId, reason } = req.body;

    if (!postId || !reason) {
        return res.status(400).json({ message: "Thiếu Post ID hoặc Lý do." });
    }

    let transaction;

    try {
        const pool = await connection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request = new sql.Request(transaction);

        // --- BƯỚC 1: Lấy User_id ---
        const postResult = await request
            .input('PostID', sql.BigInt, postId)
            .query('SELECT User_id FROM [Post] WHERE Post_id = @PostID');

        if (postResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Không tìm thấy bài viết." });
        }
        
        const userId = postResult.recordset[0].User_id;
        
        request.input('UserID', sql.VarChar(26), userId);
        request.input('Reason', sql.NVarChar, reason);

        // --- BƯỚC 2: Khóa bài viết & reset bộ đếm ---
        await request.query(`
            UPDATE [Post] 
            SET IsLocked = 1, QualityReporter = 0
            WHERE Post_id = @PostID
        `);

        // --- BƯỚC 3: Lưu vào bảng [Wrong] ---
        await request.query(`
            INSERT INTO [Wrong] (Post_id, Reason, User_id)
            VALUES (@PostID, @Reason, @UserID)
        `);

        // --- BƯỚC 4: Xóa báo cáo tạm (ReportTemp) ---
        await request.query('DELETE FROM [ReportTemp] WHERE Post_id = @PostID');

        // --- BƯỚC 5: Kiểm tra và tự động ban User ---
        const wrongCountResult = await request.query(`
            SELECT COUNT(*) AS wrongCount 
            FROM [Wrong] 
            WHERE User_id = @UserID
        `);
        
        const wrongCount = wrongCountResult.recordset[0].wrongCount;
        let autoBannedUser = false;

        if (wrongCount >= 3) {
            await request.query(`
                UPDATE [Users] 
                SET isLocked = 1 
                WHERE User_id = @UserID
            `);
            autoBannedUser = true;
        }

        // --- KẾT THÚC: Commit ---
        await transaction.commit();

        if (autoBannedUser) {
            // TODO: Gọi hàm gửi email
            console.log(`Tài khoản ${userId} đã bị TỰ ĐỘNG BAN.`);
        }

        res.status(200).json({ 
            message: "Xử lý bài viết thành công.",
            autoBannedUser: autoBannedUser 
        });

    } catch (error) {
        console.error("Lỗi khi khóa bài viết (handle):", error);
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


// ----------------------------------------------------------------
// HÀM 3: Lấy danh sách người dùng (cho trang Blocked Accounts)
// [CẬP NHẬT]
// ----------------------------------------------------------------
export const getUsersForHandling = async (req, res) => {
    try {
        const pool = await connection();
        
        //  Lọc ra cả 'Admin' và 'handle'
        const result = await pool.request()
            .query(`
                SELECT 
                    User_id, Email, Role, isLocked 
                FROM [Users] 
                WHERE Role IS NULL OR Role NOT IN ('admin', 'handlereport')
            `);
        
        res.status(200).json(result.recordset);

    } catch (error){
        console.error("Lỗi khi lấy danh sách user (handle):", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


// ----------------------------------------------------------------
// HÀM 4: Khóa (Ban) một người dùng (hành động thủ công)
// ----------------------------------------------------------------
export const banUserHandler = async (req, res) => {
    const { userId } = req.body; 

    if (!userId) {
        return res.status(400).json({ message: "Thiếu User ID." });
    }

    try {
        const pool = await connection();
        
        // CẬP NHẬT: Không cho phép ban 'Admin' hoặc 'handle'
        const result = await pool.request()
            .input('UserID', sql.VarChar(26), userId)
            .query(`
                UPDATE [Users] 
                SET isLocked = 1 
                WHERE User_id = @UserID 
                AND (Role IS NULL OR Role NOT IN ('admin', 'handle'))
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ 
                message: "Không tìm thấy user hoặc user này không thể bị khóa." 
            });
        }
        
        res.status(200).json({ message: "Khóa người dùng thành công." });

    } catch (error) {
        console.error("Lỗi khi khóa user (handle):", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ----------------------------------------------------------------
// HÀM 5: Mở khóa (Unban) một người dùng
// (Hàm này không cần thay đổi, chúng ta nên cho phép mở khóa)
// ----------------------------------------------------------------
export const unbanUserHandler = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "Thiếu User ID." });
    }

    try {
        const pool = await connection();
        const result = await pool.request()
            .input('UserID', sql.VarChar(26), userId)
            .query(`
                UPDATE [Users] 
                SET isLocked = 0 
                WHERE User_id = @UserID
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Không tìm thấy user." });
        }
        
        res.status(200).json({ message: "Mở khóa người dùng thành công." });

    } catch (error) {
        console.error("Lỗi khi mở khóa user (handle):", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ----------------------------------------------------------------
// HÀM 6: Lấy tất cả từ khóa nhạy cảm
// ----------------------------------------------------------------
// Logic cho [GET] /api/handle/keywords
export const getKeywords = async (req, res) => {
    try {
        const pool = await connection();
        const result = await pool.request()
            .query(`
                SELECT Keyword_id, Keyword, Added_At 
                FROM [SensitiveKeywords]
                ORDER BY Keyword ASC
            `);
        
        res.status(200).json(result.recordset);

    } catch (error) {
        console.error("Lỗi khi lấy danh sách từ khóa:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ----------------------------------------------------------------
// HÀM 7: Thêm một từ khóa nhạy cảm mới
// ----------------------------------------------------------------
// Logic cho [POST] /api/handle/keywords
export const addKeyword = async (req, res) => {
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(400).json({ message: "Thiếu 'keyword'." });
    }

    try {
        const pool = await connection();
        const result = await pool.request()
            .input('Keyword', sql.NVarChar(100), keyword)
            .query(`
                INSERT INTO [SensitiveKeywords] (Keyword)
                VALUES (@Keyword)
            `);
        
        // Trả về thành công
        res.status(201).json({ message: "Thêm từ khóa thành công." });

    } catch (error) {
        // Lỗi UNIQUE (trùng từ khóa)
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({ message: "Từ khóa này đã tồn tại." });
        }
        console.error("Lỗi khi thêm từ khóa:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ----------------------------------------------------------------
// HÀM 8: Xóa một từ khóa nhạy cảm
// ----------------------------------------------------------------
// Logic cho [DELETE] /api/handle/keywords/:keywordId
export const deleteKeyword = async (req, res) => {
    const { keywordId } = req.params; // Lấy từ URL

    if (!keywordId) {
        return res.status(400).json({ message: "Thiếu 'keywordId'." });
    }

    try {
        const pool = await connection();
        const result = await pool.request()
            .input('KeywordID', sql.Int, keywordId)
            .query(`
                DELETE FROM [SensitiveKeywords] 
                WHERE Keyword_id = @KeywordID
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Không tìm thấy từ khóa." });
        }
        
        res.status(200).json({ message: "Xóa từ khóa thành công." });

    } catch (error) {
        console.error("Lỗi khi xóa từ khóa:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


//----------------------------------------------------------------
// HÀM 10: Bỏ qua (Dismiss) các báo cáo cho một bài viết
// ----------------------------------------------------------------
// Logic cho [POST] /api/handle/dismiss-reports
export const dismissReportsHandler = async (req, res) => {
    const { postId } = req.body;

    if (!postId) {
        return res.status(400).json({ message: "Thiếu Post ID." });
    }

    let transaction;
    try {
        const pool = await connection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request = new sql.Request(transaction);
        request.input('PostID', sql.BigInt, postId);

        // Bước 1: Reset QualityReporter về 0 để nó biến mất khỏi hàng đợi
        await request.query(`
            UPDATE [Post] 
            SET QualityReporter = 0
            WHERE Post_id = @PostID
        `);

        // Bước 2: Xóa các báo cáo trong bảng tạm
        await request.query(`
            DELETE FROM [ReportTemp] 
            WHERE Post_id = @PostID
        `);

        await transaction.commit();
        res.status(200).json({ message: "Đã bỏ qua các báo cáo." });

    } catch (error) {
        console.error("Lỗi khi bỏ qua báo cáo:", error);
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ----------------------------------------------------------------
// HÀM 11: Lấy chi tiết các báo cáo cho một bài viết
// ----------------------------------------------------------------
// Logic cho [GET] /api/handle/reports/:postId
export const getReportDetails = async (req, res) => {
    const { postId } = req.params; 

    try {
        const pool = await connection();
        const result = await pool.request()
            .input('PostID', sql.BigInt, postId)
            .query(`
                SELECT 
                    U.Email, 
                    U.First_Name, 
                    U.Last_name,
                    U.Profile_Picture, -- <-- THÊM DÒNG NÀY
                    R.Reason 
                FROM [ReportTemp] AS R
                JOIN [Users] AS U ON R.Reporter_id = U.User_id
                WHERE R.Post_id = @PostID
            `);
        
        res.status(200).json(result.recordset);

    } catch (error) {
        console.error("Lỗi khi lấy chi tiết báo cáo:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
