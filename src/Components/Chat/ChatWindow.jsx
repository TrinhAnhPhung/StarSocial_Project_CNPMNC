import React, { useState, useEffect, useRef } from "react";
import { FaInfoCircle, FaPaperPlane, FaThumbtack, FaTrash } from "react-icons/fa";

/* ---------------------------------------------------
 * 2️⃣ KHUNG CHAT (GIỮA)
 * --------------------------------------------------- */
function ChatWindow({
    user, selectedConversation, onOpenSettings,
    linkBackend, navigate, socket,
}) {
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const messageEndRef = useRef(null);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    // --- Logic tải và nhận tin nhắn ---
    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }
        if (socket) {
            socket.emit("join_room", selectedConversation.Conversation_id);
        }
        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const authHeaders = { Authorization: `Bearer ${token}` };
            try {
                const response = await fetch(
                    `${linkBackend}/api/conversations/${selectedConversation.Conversation_id}/messages`,
                    { headers: authHeaders }
                );
                if (!response.ok) throw new Error("Lỗi tải tin nhắn");
                const data = await response.json();
                setMessages(data);
            } catch (err) {
                console.error("Lỗi fetchMessages:", err);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
        const handleReceiveMessage = (newMsg) => {
            if (newMsg.Conversation_id == selectedConversation.Conversation_id) {
                const msgWithSender = { ...newMsg };
                if (newMsg.Sender_id === user.id) { 
                    msgWithSender.First_Name = user.First_Name;
                    msgWithSender.Last_name = user.Last_name;
                    msgWithSender.profile_picture_url = user.Profile_Picture;
                } else {
                    // Cần cải thiện logic này cho nhóm
                    msgWithSender.First_Name = selectedConversation.DisplayName?.split(' ')[0] || "Người dùng";
                    msgWithSender.Last_name = selectedConversation.DisplayName?.split(' ').slice(1).join(' ') || "";
                    msgWithSender.profile_picture_url = selectedConversation.Profile_Picture_Url;
                }
                setMessages((prev) => [...prev, msgWithSender]);
            }
        };
        const handleMessageDeleted = (data) => {
            const { messageId, newContent } = data;
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.Message_id == messageId
                        ? { ...msg, Content: newContent, Is_Deleted: true }
                        : msg
                )
            );
        };
        if (socket) {
            socket.on("receive_message", handleReceiveMessage);
            socket.on("message_deleted_update", handleMessageDeleted); 
        }
        return () => {
            if (socket) {
                socket.off("receive_message", handleReceiveMessage);
                socket.off("message_deleted_update", handleMessageDeleted); 
            }
        };
    }, [selectedConversation, socket, linkBackend, navigate, user]);

    // Cuộn xuống cuối
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- Logic gửi và xóa tin nhắn ---
    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation || !socket || !user) return; 
        const msgData = {
            conversationId: selectedConversation.Conversation_id,
            senderId: user.id, 
            content: newMessage,
        };
        socket.emit("send_message", msgData);
        setNewMessage("");
    };
    const isDeletable = (sentAt) => {
        try {
            const sentTime = new Date(sentAt);
            const now = new Date();
            const oneHour = 60 * 60 * 1000; 
            return (now - sentTime) < oneHour;
        } catch (e) {
            return false;
        }
    };
    const handleDeleteMessage = async (messageId, conversationId) => {
        if (!window.confirm("Bạn có chắc muốn thu hồi tin nhắn này?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${linkBackend}/api/conversations/messages/${messageId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Không thể thu hồi tin nhắn.");
            }
            const data = await response.json();
            socket.emit('message_deleted_by_sender', {
                messageId: data.messageId,
                conversationId: data.conversationId,
                newContent: data.newContent
            });
        } catch (error) {
            console.error("Lỗi handleDeleteMessage:", error);
            alert(`Lỗi: ${error.message}`);
        }
    };

    if (!selectedConversation)
        return (
            <main className="flex flex-1 flex-col items-center justify-center bg-white min-w-0">
                <p className="text-2xl text-gray-500">Hãy chọn một cuộc trò chuyện</p>
            </main>
        );

    const displayName = selectedConversation.DisplayName || selectedConversation.Conversation_Name;
    const profilePic = selectedConversation.Profile_Picture_Url || "https://placehold.co/150";

    return (
        <main className="flex flex-1 flex-col bg-white min-w-0">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-200 p-5">
                <div className="flex items-center gap-3">
                    <img 
                        src={profilePic} 
                        alt={displayName} 
                        className="h-14 w-14 rounded-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150?text=Loi"; }}
                    />
                    <div>
                        <p className="font-semibold text-black text-xl">{displayName}</p>
                        <p className="text-lg text-gray-500">Hoạt động</p>
                    </div>
                </div>
                <button onClick={onOpenSettings} className="text-blue-500 hover:text-blue-400">
                    <FaInfoCircle size={28} />
                </button>
            </header>

            {/* Khu vực tin nhắn */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                {isLoadingMessages && <p className="text-center text-gray-500">Đang tải tin nhắn...</p>}
                {!isLoadingMessages &&
                    messages.map((m) => {
                        const isMyMessage = user && m.Sender_id === user.id; 
                        const isDeleted = m.Is_Deleted || m.Content === 'Tin nhắn đã bị thu hồi';
                        const isHovered = hoveredMessageId === m.Message_id;
                        const showDeleteButton = isMyMessage && !isDeleted && isDeletable(m.Sent_at);
                        return (
                            <div 
                                key={m.Message_id || Math.random()} 
                                className={`mb-4 flex items-end gap-2 group relative z-10 ${isMyMessage ? "justify-end" : "justify-start"}`}
                                onMouseEnter={() => setHoveredMessageId(m.Message_id)}
                                onMouseLeave={() => setHoveredMessageId(null)}
                            >
                                {!isMyMessage && (
                                    <img
                                        src={m.profile_picture_url || "https://placehold.co/100"}
                                        alt={m.First_Name}
                                        className="h-10 w-10 rounded-full"
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100?text=Loi"; }}
                                    />
                                )}
                                {isMyMessage && isHovered && (
                                    <div className="flex gap-1">
                                        <button 
                                            title="Ghim tin nhắn"
                                            onClick={() => alert('Chức năng Ghim đang phát triển!')}
                                            className="flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200"
                                        >
                                            <FaThumbtack size={16}/>
                                        </button>
                                        {showDeleteButton && (
                                            <button 
                                                title="Thu hồi tin nhắn"
                                                onClick={() => handleDeleteMessage(m.Message_id, m.Conversation_id)}
                                                className="flex items-center justify-center h-8 w-8 rounded-full text-red-500 hover:bg-gray-200"
                                            >
                                                <FaTrash size={16}/>
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div 
                                    className={`max-w-xl rounded-3xl p-5 shadow text-lg ${
                                        isMyMessage 
                                        ? (isDeleted ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white")
                                        : (isDeleted ? "bg-gray-200 text-gray-500" : "bg-gray-200 text-black")
                                    }`}
                                >
                                    <p className={isDeleted ? "italic" : ""}>{m.Content}</p>
                                </div>
                                {!isMyMessage && isHovered && (
                                    <div className="flex gap-1">
                                        <button 
                                            title="Ghim tin nhắn"
                                            onClick={() => alert('Chức năng Ghim đang phát triển!')}
                                            className="flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200"
                                        >
                                            <FaThumbtack size={16}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })
                }
                <div ref={messageEndRef} />
            </div>

            {/* Footer nhập liệu */}
            <footer className="flex items-center gap-3 border-t border-gray-200 p-4">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Aa"
                    className="flex-1 rounded-full border border-gray-300 px-5 py-3 text-lg focus:outline-none bg-gray-100"
                />
                <button onClick={handleSendMessage} className="text-blue-500 hover:text-blue-400">
                    <FaPaperPlane size={28} />
                </button>
            </footer>
        </main>
    );
}

export default ChatWindow;
