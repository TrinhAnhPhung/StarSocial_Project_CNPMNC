// back-end/routes/reports.js
import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Sử dụng driver MSSQL đã cấu hình
const { sql, connection } = require('../src/Config/SqlConnection.js');

// Đảm bảo đường dẫn này chính xác
import { authenticateToken } from '../middlewares/authMiddleware.js'; 

// ✅ BƯỚC 1: IMPORT HÀM 'reportPost' TỪ CONTROLLER
import { reportPost } from '../controllers/reportController.js';

const router = express.Router();


// ✅ BƯỚC 2: THÊM ROUTE MÀ FRONTEND ĐANG GỌI (ĐANG BỊ THIẾU)
/**
 * API: Người dùng báo cáo bài viết
 * Route: POST /api/reports/post/:postId
 */
router.post('/post/:postId', authenticateToken, reportPost);


// --- CÁC ROUTE ADMIN (Giữ nguyên code của bạn) ---

/**
 * API: Đánh dấu vi phạm (mark-violation)
 */
router.post('/mark-violation', authenticateToken, async (req, res) => {
    // ... (Giữ nguyên toàn bộ logic hàm này) ...
    const { targetUserId, postId = null, reason = '' } = req.body || {};
    if (!targetUserId) {
        return res.status(400).json({ error: 'targetUserId is required' });
    }
    const adminId = req.user?.id;
    if (!adminId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let pool;
    let transaction;
    try {
        pool = await connection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1) Tăng vi phạm ([ReportedPosts])
        const updateQuery = `
            DECLARE @OutputTable TABLE (ReportedPosts INT, isLocked BIT);
            
            UPDATE [Users]
            SET 
                [ReportedPosts] = ISNULL([ReportedPosts], 0) + 1
            OUTPUT 
                inserted.[ReportedPosts], inserted.[isLocked]
            INTO @OutputTable
            WHERE [User_id] = @targetUserId;

            SELECT ReportedPosts, isLocked FROM @OutputTable;
        `;
        
        const inc = await transaction.request()
            .input('targetUserId', sql.VarChar(26), targetUserId)
            .query(updateQuery);

        if (inc.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Target user not found' });
        }

        const reportedPostsCount = inc.recordset[0].ReportedPosts;
        let isLocked = inc.recordset[0].isLocked; 

        // 3) Khóa nếu >= 3
        if (reportedPostsCount >= 3 && !isLocked) { 
            isLocked = true;
            
            await transaction.request()
                .input('targetUserId_lock', sql.VarChar(26), targetUserId)
                .query("UPDATE [Users] SET [isLocked] = 1 WHERE [User_id] = @targetUserId_lock");
        }

        await transaction.commit();
        
        console.log(`✅ [Violation] User ${targetUserId} đã bị đánh dấu vi phạm, tổng số: ${reportedPostsCount}`);
        return res.json({ 
            ok: true, 
            ReportedPosts: reportedPostsCount, 
            isLocked: isLocked 
        });

    } catch (e) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollErr) {
                console.error("Lỗi khi rollback:", rollErr);
            }
        }
        console.error('POST /mark-violation error:', e);
        res.status(500).json({ 
            error: 'Internal server error', 
            detail: e.message,
            sqlError: e.originalError ? e.originalError.info : null
        });
    }
});

/**
 * API: Mở lại tài khoản bị cấm (unlock-user)
 */
router.post('/unlock-user', authenticateToken, async (req, res) => {
    // ... (Giữ nguyên toàn bộ logic hàm này) ...
    const { targetUserId } = req.body || {};
    if (!targetUserId) {
        return res.status(400).json({ error: 'targetUserId is required' });
    }
    
    const adminId = req.user?.id;

    let pool;
    let transaction;
    try {
        pool = await connection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const updateQuery = `
            UPDATE [Users] 
            SET 
                [isLocked] = 0,
                [ReportedPosts] = 0
            OUTPUT inserted.[User_id], inserted.[Email]
            WHERE [User_id] = @targetUserId
        `;

        const upd = await transaction.request()
            .input('targetUserId', sql.VarChar(26), targetUserId)
            .query(updateQuery);

        if (upd.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Không tìm thấy người dùng để mở khoá' });
        }

        await transaction.commit();
        
        console.log(`✅ [Unlock] Admin ${adminId} đã mở khóa cho ${targetUserId}`);
        return res.json({ 
            ok: true, 
            message: `Đã mở khoá cho user ID ${targetUserId}`,
            unlockedUser: upd.recordset[0]
        });

    } catch (err) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollErr) {
                console.error("Lỗi khi rollback:", rollErr);
            }
        }
        console.error('POST /unlock-user error:', err);
        return res.status(500).json({ 
            error: 'Internal server error', 
            detail: err.message,
            sqlError: err.originalError ? err.originalError.info : null
        });
    }
});

export default router;