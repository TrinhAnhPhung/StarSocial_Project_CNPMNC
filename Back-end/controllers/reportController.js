// File: controllers/reportController.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');

/**
 * Xử lý báo cáo bài viết
 * Route: POST /api/reports/post/:postId
 */
export const reportPost = async (req, res) => {
    const { postId } = req.params;
    const { reason } = req.body;
    const reporterId = req.user.id; // Lấy từ middleware authenticateToken

    // 1. Kiểm tra dữ liệu đầu vào
    if (!reason || reason.trim() === "") {
        return res.status(400).json({ error: "Vui lòng cung cấp lý do báo cáo." });
    }

    let pool;
    let transaction;
    try {
        pool = await connection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request = transaction.request();

        // 2. Lấy thông tin bài viết (chủ sở hữu)
        const postResult = await request
            .input('postId', sql.BigInt, postId)
            .query("SELECT User_id FROM [Post] WHERE Post_id = @postId");

        if (postResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: "Không tìm thấy bài viết." });
        }

        const postOwnerId = postResult.recordset[0].User_id;

        // 3. Kiểm tra tự báo cáo
        if (String(postOwnerId) === String(reporterId)) {
            await transaction.rollback();
            return res.status(403).json({ error: "Bạn không thể tự báo cáo bài viết của mình." });
        }

        // 4. Kiểm tra báo cáo trùng lặp (dựa trên Ràng buộc UQ_ReportTemp_Reporter_Post)
        const checkDuplicate = await request
            .input('reporterId_check', sql.VarChar(26), reporterId) // Tên input khác
            .input('postId_check', sql.BigInt, postId) // Tên input khác
            .query("SELECT 1 FROM [ReportTemp] WHERE Reporter_id = @reporterId_check AND Post_id = @postId_check");

        if (checkDuplicate.recordset.length > 0) {
            await transaction.rollback();
            return res.status(409).json({ error: "Bạn đã báo cáo bài viết này rồi." });
        }

        // 5. Thêm vào bảng [ReportTemp]
        const insertRequest = transaction.request(); 
        await insertRequest
            .input('reporterId', sql.VarChar(26), reporterId)
            .input('postId_insert', sql.BigInt, postId) // Tên input khác
            .input('postOwnerId', sql.VarChar(26), postOwnerId)
            .input('reason', sql.NVarChar(255), reason.trim())
            .query(`
                INSERT INTO [ReportTemp] (Reporter_id, Post_id, User_id, Reason)
                VALUES (@reporterId, @postId_insert, @postOwnerId, @reason)
            `);

        // 6. Cập nhật số lượng báo cáo trên bài viết [Post]
        const updateRequest = transaction.request();
        await updateRequest
            .input('postId_update', sql.BigInt, postId) // Tên input khác
            .query(`
                UPDATE [Post]
                SET QualityReporter = ISNULL(QualityReporter, 0) + 1
                WHERE Post_id = @postId_update
            `);
        
        // 7. Commit
        await transaction.commit();

        console.log(`✅ [Report] User ${reporterId} đã báo cáo Post ${postId}`);
        res.status(201).json({ message: "Đã gửi báo cáo thành công." });

    } catch (err) {
        console.error("❌ Lỗi khi báo cáo bài viết:", err);
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollErr) {
                console.error("Lỗi khi rollback:", rollErr);
            }
        }
        res.status(500).json({ 
            error: "Lỗi Server", 
            message: err.message,
            sqlError: err.originalError ? err.originalError.info : null
        });
    }
};

// Bạn có thể thêm các hàm khác liên quan đến report ở đây
