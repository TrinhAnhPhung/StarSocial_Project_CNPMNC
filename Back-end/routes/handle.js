    // routes/handle.js
    import express from 'express';
    import { authenticateToken, authorizeRoles } from '../middlewares/authenticateToken.js';
    import { 
        banPostHandler, 
        getPendingReportsForHandling,
        dismissReportsHandler,
        getReportDetails,

        getUsersForHandling,
        banUserHandler,
        unbanUserHandler,

        getKeywords,      
        addKeyword,      
        deleteKeyword     

    } from '../controllers/handleController.js'; 

    const router = express.Router();
    const isHandlerOrAdmin = authorizeRoles('handlereport', 'admin');
    router.use(authenticateToken);
    router.use(isHandlerOrAdmin);

    // [GET] /api/handle/pending-reports
    // API cho "người xử lý" (handler) lấy các bài viết đang chờ
    // TODO: Thêm middleware bảo vệ
    router.get('/pending-reports', getPendingReportsForHandling);
    // [POST] /api/handle/ban-post
    // API cho "người xử lý" thực thi hành động "Khóa bài viết"
    // TODO: Thêm middleware bảo vệ
    router.post('/ban-post', banPostHandler);
    // [POST] /api/handle/dismiss-reports
    router.post('/dismiss-reports', dismissReportsHandler);
    // [GET] /api/handle/reports/:postId
    router.get('/reports/:postId', getReportDetails);


    // [GET] /api/handle/users
    // Lấy tất cả user cho trang 'Blocked Accounts'
    // TODO: Thêm middleware
    router.get('/users', getUsersForHandling);
    // [POST] /api/handle/ban-user
    // Khóa 1 user (thủ công)
    // TODO: Thêm middleware
    router.post('/ban-user', banUserHandler);
    // [POST] /api/handle/unban-user
    // Mở khóa 1 user
    // TODO: Thêm middleware    
    router.post('/unban-user', unbanUserHandler);

    // [GET] /api/handle/keywords
    // Lấy tất cả từ khóa nhạy cảm
    // TODO: Thêm middleware
    router.get('/keywords', getKeywords);
    // [POST] /api/handle/keywords
    // Thêm một từ khóa mới
    // TODO: Thêm middleware
    router.post('/keywords', addKeyword);
    // [DELETE] /api/handle/keywords/:keywordId
    // Xóa một từ khóa
    // TODO: Thêm middleware
    router.delete('/keywords/:keywordId', deleteKeyword);



    export default router;


