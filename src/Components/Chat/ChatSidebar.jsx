import React from 'react';
import { FaEllipsisH, FaEdit, FaSearch, FaPlusCircle } from "react-icons/fa";

/* ---------------------------------------------------
 * 1️⃣ SIDEBAR (DANH SÁCH CUỘC TRÒ CHUYỆN)
 * --------------------------------------------------- */
function ChatSidebar({
    user,
    conversations,
    onSelectConversation,
    activeConversationId,
    isLoading,
    onSelectChat,
    activeTab,
    searchTerm,
    onSearchChange,
    onOpenCreateGroup,
}) {
    // (Toàn bộ code của ChatSidebar giữ nguyên như cũ)
    return (
        <aside className="flex w-[20rem] flex-col border-r border-gray-300 bg-white text-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <h1 className="text-4xl font-bold text-black">Đoạn chat</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={onOpenCreateGroup}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                        title="Tạo nhóm mới"
                    >
                        <FaPlusCircle size={24} />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                        <FaEllipsisH size={24} />
                    </button>
                </div>
            </div>
            {/* Thanh tìm kiếm */}
            <div className="p-2">
                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-4">
                    <FaSearch className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm trên Messenger"
                        className="w-full bg-transparent text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            {/* Bộ lọc */}
            <div className="flex gap-2 p-2">
                <button
                    onClick={() => onSelectChat("all")}
                    className={`rounded-full px-5 py-3 text-lg font-semibold ${
                        activeTab === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => onSelectChat("unread")}
                    className={`rounded-full px-5 py-3 text-lg font-semibold ${
                        activeTab === "unread" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Chưa đọc
                </button>
            </div>
            {/* Danh sách Chat */}
            <div className="flex-1 overflow-y-auto">
                <ul className="p-2">
                    {isLoading && (
                        <li className="p-4 text-center text-gray-500">Đang tải cuộc trò chuyện...</li>
                    )}
                    {!isLoading &&
                        conversations
                            .filter(c => (activeTab === "unread" ? c.UnreadCount > 0 : true))
                            .map((convo) => {
                                const displayName = convo.DisplayName || convo.Conversation_Name || "Người dùng";
                                const profilePic = convo.Profile_Picture_Url || "https://placehold.co/150"; 
                                const isActive = convo.Conversation_id === activeConversationId;
                                const isUnread = convo.UnreadCount > 0;
                                return (
                                    <li
                                        key={convo.Conversation_id}
                                        onClick={() => onSelectConversation(convo)}
                                        className={`mt-1 flex cursor-pointer items-center gap-3 rounded-lg p-4 ${
                                            isActive ? "bg-gray-100" : "hover:bg-gray-100"
                                        }`}
                                    >
                                        <img
                                            src={profilePic}
                                            alt={displayName}
                                            className="h-16 w-16 rounded-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150?text=Loi"; }}
                                        />
                                        <div className="flex-1 overflow-hidden">
                                            <p className={`text-xl text-black truncate ${isUnread ? "font-bold" : "font-semibold"}`}>
                                                {displayName}
                                            </p>
                                            <p className={`text-lg truncate ${isUnread ? "font-bold text-black" : "text-gray-500"}`}>
                                                {convo.LastMessageContent || "Chưa có tin nhắn"}
                                            </p>
                                        </div>
                                        {isUnread && (
                                            <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                                {convo.UnreadCount > 9 ? "9+" : convo.UnreadCount}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        {!isLoading && conversations.length === 0 && searchTerm && (
                            <li className="p-4 text-center text-gray-500">Không tìm thấy kết quả nào cho "{searchTerm}".</li>
                        )}
                        {!isLoading && conversations.length === 0 && !searchTerm && (
                            <li className="p-4 text-center text-gray-500">Không tìm thấy đoạn chat nào.</li>
                        )}
                </ul>
            </div>
        </aside>
    );
}

export default ChatSidebar;
