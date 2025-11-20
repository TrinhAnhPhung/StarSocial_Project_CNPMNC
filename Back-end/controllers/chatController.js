// controllers/chatController.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {sql,connection} = require('../src/Config/SqlConnection.js');
    
    /**
 * 1. Lấy tất cả cuộc trò chuyện (cho ChatSidebar)
 * GET /api/conversations/
 */
    // ✅ HÀM NÀY ĐÃ ĐÚNG
    export const getUserConversations = async (req, res) => {
    const userId = req.user.id; // ✅ Đã sửa đúng
    console.log("Đang lấy danh sách chat cho UserID:", userId);
try {
    const pool = await connection();
    const request = pool.request();
    request.input("userId", sql.VarChar(26), userId);

    const query = `
    SELECT 
        C.Conversation_id,
        C.Conversation_Name,
        C.Type,
        LM.Content AS LastMessageContent,
        LM.Sent_at AS LastMessageTime,
        CASE 
            WHEN C.Type = 'group' THEN C.Conversation_Name
            ELSE CONCAT(U_Other.First_Name, ' ', U_Other.Last_Name)
        END AS DisplayName,
        CASE 
            WHEN C.Type = 'group' THEN NULL
            ELSE U_Other.Profile_Picture
        END AS Profile_Picture_Url,
        CASE 
            WHEN C.Type = 'group' THEN NULL
            ELSE U_Other.User_id
        END AS OtherUserId,
        (
            SELECT COUNT(*) 
            FROM Messages M 
            WHERE 
                M.Conversation_id = C.Conversation_id
                AND M.Message_id > ISNULL(CP.Last_Read_Message_id, 0)
                AND M.Sender_id != @userId
        ) AS UnreadCount,
        C.Created_at
    FROM Conversations AS C
    JOIN Conversation_Participants AS CP 
        ON C.Conversation_id = CP.Conversation_id
    LEFT JOIN Messages AS LM 
        ON C.Last_Message_id = LM.Message_id
    LEFT JOIN Conversation_Participants AS CP_Other 
        ON C.Conversation_id = CP_Other.Conversation_id
        AND CP_Other.User_id != @userId
        AND C.Type = 'direct'
    LEFT JOIN Users AS U_Other 
        ON CP_Other.User_id = U_Other.User_id
    WHERE CP.User_id = @userId
    ORDER BY 
        ISNULL(LM.Sent_at, C.Created_at) DESC;
    `;

    const result = await request.query(query);

    res.status(200).json(result.recordset);
} catch (err) {
    console.error("❌ Lỗi khi lấy danh sách đoạn chat:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đoạn chat" });
}
};
    /**
 * 2. Lấy tất cả tin nhắn (cho ChatWindow)
 * GET /api/conversations/:conversationId/messages
 */
    export const getConversationMessages = async (req, res) => {
        
        // ✅ SỬA LỖI 1: Đổi "res.user.id" thành "req.user.id"
        const userId = req.user.id; 
        
        const { conversationId } = req.params;

        // Thêm kiểm tra
        if (!userId) {
            return res.status(401).json({ message: "Không tìm thấy UserID từ token" });
        }

        try {
            const pool = await connection();

            // Bước 1: Kiểm tra quyền
            const checkRequest = pool.request();
            checkRequest.input('userId', sql.VarChar(26), userId);     
            checkRequest.input('conversationId', sql.BigInt, conversationId);
            
            // ✅ SỬA LỖI 2: Xóa cặp dấu "" thừa bao quanh câu query
            const checkResult = await checkRequest.query(
            `SELECT 1 FROM Conversation_Participants WHERE User_id = @userId AND Conversation_id = @conversationId`
            );
            
            if (checkResult.recordset.length === 0) {
                return res.status(403).json({ message: 'Bạn không có quyền truy cập cuộc trò chuyện này' });
            }
            
            // Bước 2: Lấy tin nhắn
            const messageRequest = pool.request();
            messageRequest.input('conversationId', sql.BigInt, conversationId);
            const messagesQuery = `
            SELECT 
                M.*,
                U.First_Name,
                U.Last_name,
                U.Profile_Picture AS profile_picture_url
            FROM Messages M
            JOIN Users U ON M.Sender_id = U.User_id
            WHERE M.Conversation_id = @conversationId
            ORDER BY M.Sent_at ASC;
        `;
            const messagesResult = await messageRequest.query(messagesQuery);
            
            // Bước 3: Cập nhật "đã đọc"
            const lastMessageId = messagesResult.recordset[messagesResult.recordset.length - 1]?.Message_id;
            if (lastMessageId) {
            const updateReadRequest = pool.request();
            updateReadRequest.input("lastMessageId", sql.BigInt, lastMessageId);
            updateReadRequest.input("userId", sql.VarChar(26), userId);
            updateReadRequest.input("conversationId", sql.BigInt, conversationId);
            await updateReadRequest.query(`
                UPDATE Conversation_Participants 
                SET Last_Read_Message_id = @lastMessageId 
                WHERE User_id = @userId AND Conversation_id = @conversationId AND (Last_Read_Message_id < @lastMessageId OR Last_Read_Message_id IS NULL)
            `);
        }

            res.status(200).json(messagesResult.recordset);
        } catch (error)
        {
            console.error("❌ Lỗi getMessagesInConversation:", error);
            res.status(500).json({ message: error.message });
        }
    };

    /**
 * 3. Logic gửi tin nhắn (Dùng cho Socket.io)
 */
    // ✅ HÀM NÀY ĐÃ ĐÚNG
    export const sendMessage = async (conversationId, senderId, content) => {
        const pool = await connection();
        const transaction = new sql.Transaction(pool); 
        
        try {
            await transaction.begin();

            // Bước 1: Thêm tin nhắn
            const messageQuery = `
                INSERT INTO Messages (Conversation_id, Sender_id, Content) 
                OUTPUT INSERTED.Message_id, INSERTED.Sent_at
                VALUES (@conversationId, @senderId, @content);
            `;
            const request1 = new sql.Request(transaction);
            request1.input("conversationId", sql.BigInt, conversationId);
            request1.input("senderId", sql.VarChar(26), senderId);
            request1.input("content", sql.NVarChar(1000), content);
            const result = await request1.query(messageQuery);
            const newMessageId = result.recordset[0].Message_id;
            const newSentAt = result.recordset[0].Sent_at;

            // Bước 2: Cập nhật tin nhắn cuối
            const updateConvQuery = `
                UPDATE Conversations 
                SET Last_Message_id = @newMessageId 
                WHERE Conversation_id = @conversationId;
            `;
            const request2 = new sql.Request(transaction);
            request2.input("newMessageId", sql.BigInt, newMessageId);
            request2.input("conversationId", sql.BigInt, conversationId);
            await request2.query(updateConvQuery);

            await transaction.commit();

            // Trả về tin nhắn cơ bản
            return {
                Message_id: newMessageId,
                Conversation_id: Number(conversationId),
                Sender_id: senderId,
                Content: content,
                Sent_at: newSentAt,
            };
        } catch (error) {
            await transaction.rollback();
            console.error("❌ Lỗi sendMessage (logic):", error);
            throw error;
        }
    };

    /**
     * API gửi tin nhắn (HTTP)
     * POST /api/conversations/:conversationId/messages
     */
    export const sendConversationMessage = async (req, res) => {
        const senderId = req.user.id;
        const { conversationId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Nội dung tin nhắn không được để trống" });
        }

        try {
            const message = await sendMessage(conversationId, senderId, content);
            res.status(201).json(message);
        } catch (error) {
            console.error("❌ Lỗi khi gửi tin nhắn:", error);
            res.status(500).json({ message: "Lỗi server khi gửi tin nhắn" });
        }
    };

    /**
     * Lấy tổng số tin nhắn chưa đọc
     * GET /api/conversations/unread-count
     */
    export const getUnreadMessageCount = async (req, res) => {
        const userId = req.user.id;
        try {
            const pool = await connection();
            const request = pool.request();
            request.input("userId", sql.VarChar(26), userId);

            const query = `
                SELECT COUNT(*) AS TotalUnread
                FROM Messages M
                JOIN Conversation_Participants CP ON M.Conversation_id = CP.Conversation_id
                WHERE CP.User_id = @userId
                AND M.Sender_id != @userId
                AND M.Message_id > ISNULL(CP.Last_Read_Message_id, 0)
            `;

            const result = await request.query(query);
            const count = result.recordset[0]?.TotalUnread || 0;

            res.status(200).json({ count });
        } catch (error) {
            console.error("❌ Lỗi khi lấy số tin nhắn chưa đọc:", error);
            res.status(500).json({ message: "Lỗi server khi lấy số tin nhắn chưa đọc" });
        }
    };

    /**
 * 4. Tạo hoặc tìm cuộc trò chuyện 1-1
 */
    // ✅ HÀM NÀY ĐÃ ĐÚNG
    export const createOrGetDirectConversation = async (req, res) => {
        const senderId = req.user.id; // ✅ Đã sửa đúng
        const { recipientId } = req.body; 

        if (!recipientId) {
            return res.status(400).json({ message: "Thiếu ID người nhận" });
        }

        try {
            const pool = await connection();
            
            // Bước 1: Tìm
            const findQuery = `
                SELECT CP1.Conversation_id
                FROM Conversation_Participants AS CP1
                JOIN Conversation_Participants AS CP2 ON CP1.Conversation_id = CP2.Conversation_id
                WHERE CP1.User_id = @senderId 
                AND CP2.User_id = @recipientId
                AND (SELECT C.Type FROM Conversations C WHERE C.Conversation_id = CP1.Conversation_id) = 'direct';
            `;
            const findRequest = pool.request();
            findRequest.input('senderId', sql.VarChar(26), senderId);
            findRequest.input('recipientId', sql.VarChar(26), recipientId);
            const findResult = await findRequest.query(findQuery);

            if (findResult.recordset.length > 0) {
                return res.status(200).json(findResult.recordset[0]);
            }

            // Bước 2: Tạo mới
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            try {
                // Tạo Conversation
                const createConvQuery = `
                    INSERT INTO Conversations (Type) 
                    OUTPUT INSERTED.Conversation_id 
                    VALUES ('direct');
                `;
                const convRequest = new sql.Request(transaction);
                const convResult = await convRequest.query(createConvQuery);
                const newConversationId = convResult.recordset[0].Conversation_id;

                // Thêm 2 người vào
                const addParticipantsQuery = `
                    INSERT INTO Conversation_Participants (User_id, Conversation_id)
                    VALUES (@senderId, @newConversationId), (@recipientId, @newConversationId);
                `;
                const participantsRequest = new sql.Request(transaction);
                participantsRequest.input('senderId', sql.VarChar(26), senderId);
                participantsRequest.input('recipientId', sql.VarChar(26), recipientId);
                participantsRequest.input('newConversationId', sql.BigInt, newConversationId);
                await participantsRequest.query(addParticipantsQuery);

                await transaction.commit();
                res.status(201).json({ Conversation_id: newConversationId });

            } catch (err) {
                await transaction.rollback();
                throw err; 
            }

        } catch (error) {
            console.error("❌ Lỗi createOrGetDirectConversation:", error);
            res.status(500).json({ message: "Lỗi server khi tạo cuộc trò chuyện" });
        }
    };
    /**
 * 5. Thu hồi (xóa) một tin nhắn
 * DELETE /api/conversations/messages/:messageId
 */
export const deleteMessage = async (req, res) => {
    const userId = req.user.id;
    const { messageId } = req.params;

    try {
        const pool = await connection();
        const request = pool.request();
        
        request.input("messageId", sql.BigInt, messageId);
        request.input("userId", sql.VarChar(26), userId);

        // Câu query để kiểm tra chủ sở hữu và thời gian
        const checkQuery = `
            SELECT 
                Sender_id, 
                Sent_at, 
                Conversation_id,
                DATEDIFF(minute, Sent_at, GETDATE()) as MinutesPassed
            FROM Messages 
            WHERE Message_id = @messageId
        `;

        const checkResult = await request.query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tin nhắn." });
        }

        const message = checkResult.recordset[0];

        if (message.Sender_id !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền xóa tin nhắn này." });
        }

        // Kiểm tra điều kiện 1 giờ (60 phút)
        if (message.MinutesPassed > 60) {
            return res.status(403).json({ message: "Không thể thu hồi tin nhắn đã gửi quá 1 giờ." });
        }

        // Nếu mọi thứ OK, tiến hành "thu hồi"
        const newContent = 'Tin nhắn đã bị thu hồi'; // N' để hỗ trợ Unicode
        
        const updateRequest = pool.request();
        updateRequest.input("messageId", sql.BigInt, messageId);
        updateRequest.input("newContent", sql.NVarChar(1000), newContent);

        await updateRequest.query(`
            UPDATE Messages 
            SET Content = @newContent, Is_Deleted = 1 -- Giả sử bạn có cột Is_Deleted
            WHERE Message_id = @messageId
        `);

        res.status(200).json({
            message: "Tin nhắn đã được thu hồi.",
            messageId: messageId,
            conversationId: message.Conversation_id,
            newContent: newContent
        });

    } catch (error) {
        console.error("❌ Lỗi deleteMessage:", error);
        res.status(500).json({ message: "Lỗi server khi xóa tin nhắn." });
    }
};

// =================================================================
// ✅ BẮT ĐẦU PHẦN BIG UPDATE - API MỚI
// =================================================================

/**
 * 6. Lấy danh sách bạn bè (Mutual Followers) cho modal tạo nhóm
 * GET /api/conversations/mutual-followers 
 */
export const getMutualFollowers = async (req, res) => {
    const userId = req.user.id;
    console.log("Đang lấy danh sách mutual followers cho UserID:", userId);

    try {
        const pool = await connection();
        const request = pool.request();
        request.input("userId", sql.VarChar(26), userId);

        // ✅ SỬA LỖI QUERY:
        // Đã đổi 'Follows' -> '[Follow]' (theo đúng schema của bạn)
        // Đã đổi 'Follower_id'/'Following_id' -> 'Followers_id'/'FamousUser_id'
        const query = `
            SELECT 
                U.User_id, 
                U.First_Name, 
                U.Last_Name, 
                U.Profile_Picture
            FROM 
                [Follow] AS F1  -- F1: Tìm người B mà TÔI (A) follow (A -> B)
            JOIN 
                [Follow] AS F2  -- F2: Tìm người B follow TÔI (A) (B -> A)
                -- Nối 2 điều kiện trên: B (FamousUser_id của F1) cũng là B (Followers_id của F2)
                ON F1.FamousUser_id = F2.Followers_id
            JOIN 
                Users AS U ON U.User_id = F1.FamousUser_id -- Lấy thông tin của B
            WHERE 
                F1.Followers_id = @userId     -- F1: A (tôi) là người đi follow
                AND F2.FamousUser_id = @userId; -- F2: A (tôi) là người được follow
        `;

        const result = await request.query(query);
        res.status(200).json(result.recordset);

    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách mutual followers:", err);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách bạn bè" });
    }
};


/**
 * 7. Tạo một cuộc trò chuyện nhóm mới
 * POST /api/conversations/group
 * Body: { "groupName": "Tên nhóm", "participantIds": ["id1", "id2", ...] }
 */
export const createGroupConversation = async (req, res) => {
    const creatorId = req.user.id;
    const { groupName, participantIds } = req.body;

    // --- Kiểm tra dữ liệu đầu vào ---
    if (!groupName || groupName.trim() === '') {
        return res.status(400).json({ message: "Tên nhóm không được để trống." });
    }
    if (!participantIds || participantIds.length === 0) {
        return res.status(400).json({ message: "Bạn phải chọn ít nhất 1 thành viên." });
    }

    // Gộp người tạo và thành viên vào 1 danh sách
    const allParticipantIds = [creatorId, ...participantIds];
    
    // Đảm bảo không có ID trùng lặp
    const uniqueParticipantIds = [...new Set(allParticipantIds)];

    if (uniqueParticipantIds.length < 2) {
         return res.status(400).json({ message: "Một cuộc trò chuyện cần ít nhất 2 người." });
    }

    console.log(`[API] Bắt đầu tạo nhóm '${groupName}' với các thành viên:`, uniqueParticipantIds);

    const pool = await connection();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // --- Bước 1: Tạo cuộc hội thoại (Conversation) ---
        const convRequest = new sql.Request(transaction);
        convRequest.input("groupName", sql.NVarChar(255), groupName);
        
        const convResult = await convRequest.query(`
            INSERT INTO [Conversations] (Conversation_Name, [Type])
            OUTPUT INSERTED.Conversation_id, INSERTED.Created_at
            VALUES (@groupName, 'group');
        `);
        
        const newConversationId = convResult.recordset[0].Conversation_id;
        const newConversationCreatedAt = convResult.recordset[0].Created_at;

        // --- Bước 2: Thêm tất cả thành viên (Participants) ---
        // Xây dựng một câu query INSERT...VALUES động
        let participantsQuery = 'INSERT INTO [Conversation_Participants] (User_id, Conversation_id, Role_IsAdmin) VALUES ';
        const values = [];
        // Nếu là người tạo thì gán Role_IsAdmin = 1, ngược lại là 0
        for (const userId of uniqueParticipantIds) {
            const isAdmin = (userId === creatorId) ? 1 : 0;
            values.push(`('${userId}', ${newConversationId}, ${isAdmin})`);
        }


        participantsQuery += values.join(', ');
        
        const participantsRequest = new sql.Request(transaction);
        await participantsRequest.query(participantsQuery);

        // --- Bước 3: Commit transaction ---
        await transaction.commit();

        console.log(`[API] Tạo nhóm thành công, ID: ${newConversationId}`);

        // Trả về dữ liệu nhóm mới theo định dạng giống 'getUserConversations'
        // để frontend có thể thêm vào danh sách ngay lập tức
        res.status(201).json({
            Conversation_id: newConversationId,
            Conversation_Name: groupName,
            Type: 'group',
            LastMessageContent: null, // Nhóm mới chưa có tin nhắn
            LastMessageTime: null,
            DisplayName: groupName, // Tên hiển thị là tên nhóm
            Profile_Picture_Url: null, // Nhóm mới chưa có ảnh
            UnreadCount: 0,
            Created_at: newConversationCreatedAt
        });

    } catch (err) {
        await transaction.rollback();
        console.error("❌ Lỗi khi tạo nhóm:", err);
        res.status(500).json({ message: "Lỗi server khi tạo nhóm." });
    }
};

/* 8. Lấy danh sách thành viên của một cuộc trò chuyện
 * GET /api/conversations/:conversationId/participants
 */
export const getConversationParticipants = async (req, res) => {
    const { conversationId } = req.params;
    const requesterId = req.user.id; // Người đang yêu cầu

    console.log(`[API] Đang lấy thành viên cho nhóm: ${conversationId}`);

    try {
        const pool = await connection();
        
        // --- Bước 1: Kiểm tra xem người yêu cầu có trong nhóm không ---
        const checkRequest = pool.request();
        checkRequest.input('userId', sql.VarChar(26), requesterId);
        checkRequest.input('conversationId', sql.BigInt, conversationId);
        
        const checkResult = await checkRequest.query(
            `SELECT 1 FROM [Conversation_Participants] 
             WHERE User_id = @userId AND Conversation_id = @conversationId`
        );
        
        if (checkResult.recordset.length === 0) {
            return res.status(403).json({ message: 'Bạn không có quyền xem danh sách này.' });
        }

        // --- Bước 2: Lấy danh sách thành viên ---
        const participantsRequest = pool.request();
        participantsRequest.input('conversationId', sql.BigInt, conversationId);

        const query = `
            SELECT 
                U.User_id,
                U.First_Name,
                U.Last_Name,
                U.Profile_Picture,
                CP.Role_IsAdmin
            FROM [Conversation_Participants] AS CP
            JOIN [Users] AS U ON CP.User_id = U.User_id
            WHERE CP.Conversation_id = @conversationId
            ORDER BY CP.Role_IsAdmin DESC, U.First_Name ASC; 
        `;
        
        const result = await participantsRequest.query(query);
        res.status(200).json(result.recordset);

    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách thành viên:", err);
        res.status(500).json({ message: "Lỗi server khi lấy thành viên." });
    }
};


/* Kiểm tra xem một user có phải là admin của nhóm hay không
 */
async function isUserAdminOfGroup(pool, userId, conversationId) {
    const request = pool.request();
    request.input('userId', sql.VarChar(26), userId);
    request.input('conversationId', sql.BigInt, conversationId);
    const result = await request.query(`
        SELECT Role_IsAdmin FROM [Conversation_Participants]
        WHERE User_id = @userId AND Conversation_id = @conversationId
    `);
    if (result.recordset.length === 0) {
        return false; // Thậm chí không có trong nhóm
    }
    return result.recordset[0].Role_IsAdmin; // Trả về true (1) hoặc false (0)
}


/**
 * 9. Đổi tên nhóm (Cho Admin)
 * PUT /api/conversations/:conversationId/rename
 */
export const renameGroup = async (req, res) => {
    const { conversationId } = req.params;
    const { newGroupName } = req.body;
    const requesterId = req.user.id;

    if (!newGroupName || newGroupName.trim() === '') {
        return res.status(400).json({ message: "Tên nhóm không được để trống." });
    }

    try {
        const pool = await connection();
        // Kiểm tra quyền Admin
        if (!(await isUserAdminOfGroup(pool, requesterId, conversationId))) {
            return res.status(403).json({ message: "Chỉ admin mới có quyền đổi tên nhóm." });
        }

        // Cập nhật tên
        const updateRequest = pool.request();
        updateRequest.input('conversationId', sql.BigInt, conversationId);
        updateRequest.input('newGroupName', sql.NVarChar(255), newGroupName.trim());
        await updateRequest.query(`
            UPDATE [Conversations] SET Conversation_Name = @newGroupName
            WHERE Conversation_id = @conversationId AND [Type] = 'group'
        `);
        
        res.status(200).json({ message: "Đổi tên nhóm thành công." });

    } catch (err) {
        console.error("❌ Lỗi renameGroup:", err);
        res.status(500).json({ message: "Lỗi server khi đổi tên nhóm." });
    }
};

/**
 * 10. Đuổi thành viên (Cho Admin)
 * DELETE /api/conversations/:conversationId/participants/:userIdToKick
 */
export const kickParticipant = async (req, res) => {
    const { conversationId, userIdToKick } = req.params;
    const requesterId = req.user.id;

    if (requesterId === userIdToKick) {
        return res.status(400).json({ message: "Bạn không thể tự đuổi chính mình." });
    }

    try {
        const pool = await connection();
        // Kiểm tra quyền Admin
        if (!(await isUserAdminOfGroup(pool, requesterId, conversationId))) {
            return res.status(403).json({ message: "Chỉ admin mới có quyền đuổi thành viên." });
        }

        // Thực hiện đuổi
        const deleteRequest = pool.request();
        deleteRequest.input('conversationId', sql.BigInt, conversationId);
        deleteRequest.input('userIdToKick', sql.VarChar(26), userIdToKick);
        
        const result = await deleteRequest.query(`
            DELETE FROM [Conversation_Participants]
            WHERE Conversation_id = @conversationId AND User_id = @userIdToKick
        `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Không tìm thấy thành viên này trong nhóm." });
        }
        
        res.status(200).json({ message: "Đã đuổi thành viên khỏi nhóm." });

    } catch (err) {
        console.error("❌ Lỗi kickParticipant:", err);
        res.status(500).json({ message: "Lỗi server khi đuổi thành viên." });
    }
};

/**
 * 11. Nhường quyền Admin (Cho Admin)
 * PUT /api/conversations/:conversationId/promote
 */
export const promoteAdmin = async (req, res) => {
    const { conversationId } = req.params;
    const { newAdminUserId } = req.body;
    const requesterId = req.user.id; // Admin cũ

    if (requesterId === newAdminUserId) {
        return res.status(400).json({ message: "Bạn đã là admin rồi." });
    }

    const pool = await connection();
    const transaction = new sql.Transaction(pool); // Dùng Transaction để đảm bảo an toàn

    try {
        await transaction.begin();

        // Kiểm tra admin (phải làm trong transaction)
        const checkRequest = new sql.Request(transaction);
        checkRequest.input('requesterId', sql.VarChar(26), requesterId);
        checkRequest.input('conversationId', sql.BigInt, conversationId);
        const checkResult = await checkRequest.query(`
            SELECT Role_IsAdmin FROM [Conversation_Participants]
            WHERE User_id = @requesterId AND Conversation_id = @conversationId
        `);
        
        if (checkResult.recordset.length === 0 || !checkResult.recordset[0].Role_IsAdmin) {
            await transaction.rollback();
            return res.status(403).json({ message: "Bạn không có quyền nhường admin." });
        }

        // 1. Hạ admin cũ (chính mình)
        const demoteRequest = new sql.Request(transaction);
        demoteRequest.input('conversationId', sql.BigInt, conversationId);
        demoteRequest.input('requesterId', sql.VarChar(26), requesterId);
        await demoteRequest.query(`
            UPDATE [Conversation_Participants] SET Role_IsAdmin = 0
            WHERE Conversation_id = @conversationId AND User_id = @requesterId
        `);

        // 2. Nâng admin mới
        const promoteRequest = new sql.Request(transaction);
        promoteRequest.input('conversationId', sql.BigInt, conversationId);
        promoteRequest.input('newAdminUserId', sql.VarChar(26), newAdminUserId);
        await promoteRequest.query(`
            UPDATE [Conversation_Participants] SET Role_IsAdmin = 1
            WHERE Conversation_id = @conversationId AND User_id = @newAdminUserId
        `);

        await transaction.commit();
        res.status(200).json({ message: "Nhường quyền admin thành công." });

    } catch (err) {
        await transaction.rollback();
        console.error("❌ Lỗi promoteAdmin:", err);
        res.status(500).json({ message: "Lỗi server khi nhường quyền admin." });
    }
};

/**
 * 12. Rời khỏi nhóm (Cho thành viên thường)
 * DELETE /api/conversations/:conversationId/leave
 */
export const leaveGroup = async (req, res) => {
    const { conversationId } = req.params;
    const requesterId = req.user.id;

    const pool = await connection();
    
    try {
        // Kiểm tra nếu là Admin
        if (await isUserAdminOfGroup(pool, requesterId, conversationId)) {
            // Kiểm tra xem có phải admin CUỐI CÙNG không
            const adminCountRequest = pool.request();
            adminCountRequest.input('conversationId', sql.BigInt, conversationId);
            const adminCountResult = await adminCountRequest.query(`
                SELECT COUNT(*) as AdminCount FROM [Conversation_Participants]
                WHERE Conversation_id = @conversationId AND Role_IsAdmin = 1
            `);
            
            // Nếu là admin cuối cùng, không cho rời
            if (adminCountResult.recordset[0].AdminCount <= 1) {
                 return res.status(403).json({ message: "Bạn là admin cuối cùng. Phải nhường quyền admin hoặc giải tán nhóm." });
            }
        }
        
        // Nếu không phải admin, hoặc là admin nhưng còn admin khác -> cho phép rời
        const deleteRequest = pool.request();
        deleteRequest.input('conversationId', sql.BigInt, conversationId);
        deleteRequest.input('requesterId', sql.VarChar(26), requesterId);
        await deleteRequest.query(`
            DELETE FROM [Conversation_Participants]
            WHERE Conversation_id = @conversationId AND User_id = @requesterId
        `);
        
        res.status(200).json({ message: "Đã rời khỏi nhóm." });

    } catch (err) {
        console.error("❌ Lỗi leaveGroup:", err);
        res.status(500).json({ message: "Lỗi server khi rời nhóm." });
    }
};

/**
 * 13. Xóa chat (1-1) hoặc Giải tán nhóm (Admin)
 * DELETE /api/conversations/:conversationId
 */
export const deleteConversation = async (req, res) => {
    const { conversationId } = req.params;
    const requesterId = req.user.id;

    const pool = await connection();
    
    try {
        const checkRequest = pool.request();
        checkRequest.input('requesterId', sql.VarChar(26), requesterId);
        checkRequest.input('conversationId', sql.BigInt, conversationId);
        
        // Lấy loại chat và vai trò của người yêu cầu
        const checkResult = await checkRequest.query(`
            SELECT C.[Type], CP.Role_IsAdmin
            FROM [Conversations] C
            LEFT JOIN [Conversation_Participants] CP 
                ON C.Conversation_id = CP.Conversation_id AND CP.User_id = @requesterId
            WHERE C.Conversation_id = @conversationId
        `);

        if (checkResult.recordset.length === 0) {
             return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện." });
        }
        
        const chatInfo = checkResult.recordset[0];

        // Nếu user không có trong nhóm (bị lỗi gì đó)
        if (chatInfo.Role_IsAdmin === null) {
            return res.status(403).json({ message: "Bạn không có trong cuộc trò chuyện này." });
        }

        // Nếu là nhóm, chỉ admin mới được xóa (giải tán)
        if (chatInfo.Type === 'group' && !chatInfo.Role_IsAdmin) {
            return res.status(403).json({ message: "Chỉ admin mới có quyền giải tán nhóm." });
        }
        
        // Nếu là chat 1-1, hoặc là Admin của nhóm -> cho phép xóa
        const deleteRequest = pool.request();
        deleteRequest.input('conversationId', sql.BigInt, conversationId);
        await deleteRequest.query(`
            DELETE FROM [Conversations] WHERE Conversation_id = @conversationId
        `);
        // ON DELETE CASCADE sẽ tự động xóa Messages và Participants

        res.status(200).json({ message: "Đã xóa cuộc trò chuyện." });

    } catch (err) {
        console.error("❌ Lỗi deleteConversation:", err);
        res.status(500).json({ message: "Lỗi server khi xóa cuộc trò chuyện." });
    }
};

/**
 * 14. Thêm thành viên mới vào nhóm (Cho Admin)
 * POST /api/conversations/:conversationId/participants
 * Body: { "userIdsToAdd": ["id1", "id2", ...] }
 */
export const addParticipants = async (req, res) => {
    const { conversationId } = req.params;
    const requesterId = req.user.id;
    const { userIdsToAdd } = req.body;

    // --- 1. Kiểm tra dữ liệu ---
    if (!userIdsToAdd || !Array.isArray(userIdsToAdd) || userIdsToAdd.length === 0) {
        return res.status(400).json({ message: "Danh sách thành viên thêm vào không hợp lệ." });
    }

    const pool = await connection();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // --- 2. Kiểm tra quyền Admin (phải làm trong transaction) ---
        const checkRequest = new sql.Request(transaction);
        checkRequest.input('requesterId', sql.VarChar(26), requesterId);
        checkRequest.input('conversationId', sql.BigInt, conversationId);
        const checkResult = await checkRequest.query(`
            SELECT Role_IsAdmin FROM [Conversation_Participants]
            WHERE User_id = @requesterId AND Conversation_id = @conversationId
        `);
        
        if (checkResult.recordset.length === 0 || !checkResult.recordset[0].Role_IsAdmin) {
            await transaction.rollback();
            return res.status(403).json({ message: "Chỉ admin mới có quyền thêm thành viên." });
        }

        // --- 3. Lấy danh sách thành viên HIỆN TẠI để lọc ---
        const currentMembersRequest = new sql.Request(transaction);
        currentMembersRequest.input('conversationId', sql.BigInt, conversationId);
        const currentMembersResult = await currentMembersRequest.query(
            `SELECT User_id FROM [Conversation_Participants] WHERE Conversation_id = @conversationId`
        );
        const currentMemberIds = currentMembersResult.recordset.map(u => u.User_id);

        // Lọc ra những ID thực sự mới
        const newMemberIds = userIdsToAdd.filter(id => !currentMemberIds.includes(id));

        if (newMemberIds.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: "Tất cả người dùng này đã ở trong nhóm." });
        }
        
        // --- 4. Thêm thành viên MỚI (luôn là Role 0) ---
        let values = [];
        for (const userId of newMemberIds) {
            values.push(`('${userId}', ${conversationId}, 0)`); // (User_id, Conversation_id, Role_IsAdmin=0)
        }
        
        const insertQuery = `
            INSERT INTO [Conversation_Participants] (User_id, Conversation_id, Role_IsAdmin) 
            VALUES ${values.join(', ')};
        `;
        
        const insertRequest = new sql.Request(transaction);
        await insertRequest.query(insertQuery);

        // --- 5. Lấy thông tin của những người vừa thêm để trả về cho UI ---
        const newUsersInfoRequest = new sql.Request(transaction);
        // Tạo danh sách param động (@id0, @id1, ...)
        const idParams = newMemberIds.map((id, index) => `@id${index}`);
        newMemberIds.forEach((id, index) => {
            newUsersInfoRequest.input(`id${index}`, sql.VarChar(26), id);
        });

        const newUsers = await newUsersInfoRequest.query(`
            SELECT 
                U.User_id,
                U.First_Name,
                U.Last_Name,
                U.Profile_Picture,
                0 AS Role_IsAdmin  -- Họ luôn là member thường khi mới vào
            FROM [Users] AS U
            WHERE U.User_id IN (${idParams.join(', ')})
        `);

        await transaction.commit();
        
        // Trả về danh sách người vừa thêm
        res.status(201).json(newUsers.recordset);

    } catch (err) {
        await transaction.rollback();
        console.error("❌ Lỗi addParticipants:", err);
        res.status(500).json({ message: "Lỗi server khi thêm thành viên." });
    }
};
