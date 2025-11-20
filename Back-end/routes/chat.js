// Tên file: routes/chat.js

import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const router = express.Router();
import * as controller from '../controllers/chatController.js'; // Đảm bảo đường dẫn đúng

// Import middleware xác thực (ĐIỀU CHỈNH ĐƯỜNG DẪN NẾU CẦN)
import { authenticateToken } from '../middlewares/authenticateToken.js';

/**
 * @route GET /api/conversations/
 * @desc Lấy tất cả cuộc trò chuyện của user (cho Sidebar)
 * @access Private
 */
router.get(
    '/', 
    authenticateToken, // Cần xác thực
    controller.getUserConversations
);

/**
 * @route GET /api/conversations/unread-count
 * @desc Lấy tổng số tin nhắn chưa đọc
 * @access Private
 */
router.get(
    '/unread-count',
    authenticateToken,
    controller.getUnreadMessageCount
);

/**
 * @route POST /api/conversations/
 * @desc Tạo (hoặc tìm) một cuộc trò chuyện 1-1
 * @access Private
 */
router.post(
    '/',
    authenticateToken, // Cần xác thực
    controller.createOrGetDirectConversation
);

/**
 * @route GET /api/conversations/:conversationId/messages
 * @desc Lấy tất cả tin nhắn của 1 cuộc trò chuyện (cho ChatWindow)
 * @access Private
 */
router.get(
    '/:conversationId/messages', 
    authenticateToken, // Cần xác thực
    controller.getConversationMessages 
);

/**
 * @route POST /api/conversations/:conversationId/messages
 * @desc Gửi tin nhắn vào cuộc trò chuyện
 * @access Private
 */
router.post(
    '/:conversationId/messages',
    authenticateToken,
    controller.sendConversationMessage
);

/**
 * @route   DELETE /api/conversations/messages/:messageId
 * @desc    Thu hồi (xóa) một tin nhắn
 * @access  Private
 */
router.delete(
    '/messages/:messageId',
    authenticateToken, // Cần xác thực
    controller.deleteMessage
);

/**
 * @route   GET /api/conversations/mutual-followers
 * @desc    Lấy danh sách bạn bè (mutuals) để tạo nhóm
 * @access  Private
 */
router.get(
    '/mutual-followers',
    authenticateToken, // Cần xác thực
    controller.getMutualFollowers
);



/**
 * @route   POST /api/conversations/group
 * @desc    Tạo một cuộc trò chuyện nhóm mới
 * @access  Private
 */
router.post(
    '/group',
    authenticateToken, // Cần xác thực
    controller.createGroupConversation
);

/**
 * @route   GET /api/conversations/:conversationId/participants
 * @desc    Lấy danh sách thành viên của một nhóm
 * @access  Private
 */
router.get(
    '/:conversationId/participants',
    authenticateToken, // Cần xác thực
    controller.getConversationParticipants
);  



/**
 * @route   PUT /api/conversations/:conversationId/rename
 * @desc    Đổi tên nhóm
 * @access  Private
 */
router.put(
    '/:conversationId/rename',
    authenticateToken,
    controller.renameGroup
);



/**
 * @route   DELETE /api/conversations/:conversationId/participants/:userIdToKick
 * @desc    Đuổi thành viên
 * @access  Private
 */
router.delete(
    '/:conversationId/participants/:userIdToKick',
    authenticateToken,
    controller.kickParticipant
);



/**
 * @route   PUT /api/conversations/:conversationId/promote
 * @desc    Nhường quyền Admin
 * @access  Private
 */
router.put(
    '/:conversationId/promote',
    authenticateToken,
    controller.promoteAdmin
);



/**
 * @route   DELETE /api/conversations/:conversationId/leave
 * @desc    Thành viên rời nhóm
 * @access  Private
 */
router.delete(
    '/:conversationId/leave',
    authenticateToken,
    controller.leaveGroup
);



/**
 * @route   DELETE /api/conversations/:conversationId
 * @desc    Xóa chat 1-1 / Giải tán nhóm (Admin)
 * @access  Private
 */
router.delete(
    '/:conversationId',
    authenticateToken,
    controller.deleteConversation
);






/**
 * @route   POST /api/conversations/:conversationId/participants
 * @desc    Thêm thành viên mới vào nhóm (Admin)
 * @access  Private
 */
router.post(
    '/:conversationId/participants',
    authenticateToken,
    controller.addParticipants
);

/**
 * @route   GET /api/conversations/:conversationId/participants
 * @desc    Lấy danh sách thành viên của một nhóm
 * @access  Private
 */
router.get(
    '/:conversationId/participants',
    authenticateToken, 
    controller.getConversationParticipants
);


export default router;