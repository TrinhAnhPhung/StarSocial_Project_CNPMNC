import React, { useState, useEffect } from "react";
import { 
    FaTimes, FaEdit, FaCrown, FaUserTimes, FaUserShield,
    FaSignOutAlt, FaAddressCard, FaTrash, FaUserPlus
} from "react-icons/fa";

/* ---------------------------------------------------
 * 3️⃣ PANEL THÔNG TIN (PHẢI)
 * --------------------------------------------------- */
function ChatSettingsPanel({ 
    chatInfo, user, onClose, linkBackend, navigate, 
    onConversationDeleted, onConversationUpdated,
    participants, 
    isLoadingParticipants,
    onOpenAddMember 
}) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);

    // Lấy thông tin của CHÍNH MÌNH trong nhóm (để biết có phải admin không)
    const myParticipantInfo = participants.find(p => p.User_id === user.id);
    const amIAdmin = myParticipantInfo?.Role_IsAdmin || false;
    
    // Đồng bộ tên nhóm vào ô input khi chatInfo thay đổi
    useEffect(() => {
        if (chatInfo) {
            setRenameValue(chatInfo.DisplayName);
            setIsRenaming(false); // Reset
        }
    }, [chatInfo]); 

    // --- CÁC HÀM XỬ LÝ GỌI API ---
    const handleRenameGroup = async () => {
        if (renameValue.trim() === "" || renameValue.trim() === chatInfo.DisplayName) {
            setIsRenaming(false); 
            setRenameValue(chatInfo.DisplayName);
            return;
        }
        setIsSavingName(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${linkBackend}/api/conversations/${chatInfo.Conversation_id}/rename`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newGroupName: renameValue.trim() })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
            onConversationUpdated({ 
                Conversation_id: chatInfo.Conversation_id,
                DisplayName: renameValue.trim(),
                Conversation_Name: renameValue.trim()
            });
            setIsRenaming(false); 
        } catch (err) {
            console.error("Lỗi đổi tên nhóm:", err);
            alert(`Lỗi: ${err.message}`);
        } finally {
            setIsSavingName(false);
        }
    };
    const cancelRename = () => {
        setIsRenaming(false);
        setRenameValue(chatInfo.DisplayName); 
    };
    const handleKickUser = async (userIdToKick) => {
        if (!window.confirm("Bạn có chắc muốn đuổi thành viên này?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${linkBackend}/api/conversations/${chatInfo.Conversation_id}/participants/${userIdToKick}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
            onConversationUpdated({ 
                Conversation_id: chatInfo.Conversation_id,
                _memberChange: 'kicked' 
            });
            alert("Đuổi thành viên thành công.");
        } catch (err) {
            console.error("Lỗi handleKickUser:", err);
            alert(`Lỗi: ${err.message}`);
        }
    };
    const handleMakeAdmin = async (userIdToPromote) => {
        if (!window.confirm("Bạn có chắc muốn nhường quyền admin cho người này?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${linkBackend}/api/conversations/${chatInfo.Conversation_id}/promote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newAdminUserId: userIdToPromote })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
            onConversationUpdated({ 
                Conversation_id: chatInfo.Conversation_id,
                _memberChange: 'promoted'
            });
            alert("Nhường quyền admin thành công.");
        } catch (err) {
            console.error("Lỗi handleMakeAdmin:", err);
            alert(`Lỗi: ${err.message}`);
        }
    };
    const handleLeaveOrDisbandGroup = async () => {
        if (amIAdmin) {
            const confirmText = "Bạn là Admin. Bạn có chắc muốn GIẢI TÁN nhóm này? Hành động này không thể hoàn tác.";
            if (window.confirm(confirmText)) {
                try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${linkBackend}/api/conversations/${chatInfo.Conversation_id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
                    onConversationDeleted(chatInfo.Conversation_id); 
                } catch (err) {
                    console.error("Lỗi giải tán nhóm:", err);
                    alert(`Lỗi: ${err.message}`);
                }
            }
        } else {
            if (window.confirm("Bạn có chắc muốn rời khỏi nhóm này?")) {
                try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${linkBackend}/api/conversations/${chatInfo.Conversation_id}/leave`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
                    onConversationDeleted(chatInfo.Conversation_id);
                } catch (err) {
                    console.error("Lỗi rời nhóm:", err);
                    alert(`Lỗi: ${err.message}`);
                }
            }
        }
    };
    const handleDeleteChat = async () => {
        if (window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.")) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${linkBackend}/api/conversations/${chatInfo.Conversation_id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
                onConversationDeleted(chatInfo.Conversation_id);
            } catch (err) {
                console.error("Lỗi xóa chat:", err);
                alert(`Lỗi: ${err.message}`);
            }
        }
    };
    
    // ----- RENDER -----
    if (!chatInfo) return null; 

    const isGroupChat = chatInfo.Type === 'group';
    const displayName = chatInfo?.DisplayName || "Không có thông tin";
    const profilePic = chatInfo?.Profile_Picture_Url || (isGroupChat ? "https://placehold.co/150?text=Group" : "https://placehold.co/150");
    
    return (
        <aside className="w-[25rem] flex-col border-l border-gray-200 bg-white p-6 flex-shrink-0 flex">
            {/* 1. Nút Đóng & Thông tin cơ bản */}
            <div className="flex justify-end mb-4">
                 <button onClick={onClose} className="text-gray-500 hover:text-black">
                     <FaTimes size={20} />
                 </button>
            </div>
            <div className="flex flex-col items-center text-center">
                <img 
                    src={profilePic} 
                    alt={displayName} 
                    className="h-24 w-24 rounded-full object-cover mb-4" 
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150?text=Loi"; }}
                />
                {!isRenaming ? (
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-semibold">{displayName}</h2>
                        {isGroupChat && amIAdmin && (
                            <button 
                                onClick={() => setIsRenaming(true)}
                                className="text-gray-500 hover:text-blue-500 p-1"
                                title="Đổi tên nhóm"
                            >
                                <FaEdit />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        <input 
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="w-full p-2 border rounded-lg text-center text-lg"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameGroup()}
                        />
                        <div className="flex gap-2 justify-center mt-2">
                            <button
                                onClick={handleRenameGroup}
                                className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                disabled={isSavingName}
                            >
                                {isSavingName ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                                onClick={cancelRename}
                                className="bg-gray-200 text-black px-4 py-1 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <hr className="my-6" />

            {/* 2. NỘI DUNG ĐỘNG (NHÓM vs 1-1) */}
            {isGroupChat ? (
                /* --- NẾU LÀ NHÓM --- */
                <>
                    {/* NÚT THÊM THÀNH VIÊN */}
                    {amIAdmin && (
                         <button 
                            onClick={onOpenAddMember}
                            className="flex items-center gap-3 w-full p-3 mb-4 rounded-lg hover:bg-gray-100 text-lg text-blue-500"
                        >
                            <FaUserPlus className="text-blue-500" />
                            <span>Thêm thành viên</span>
                        </button>
                    )}

                    <div className="mb-6 flex-1 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-500 mb-2 px-3">
                            Thành viên ({participants.length})
                        </h3>
                        {isLoadingParticipants && <p className="px-3 text-gray-500">Đang tải...</p>}
                        
                        <ul className="max-h-[50vh] overflow-y-auto">
                            {participants.map(p => {
                                const isThisMemberMe = p.User_id === user.id;
                                const isThisMemberAnAdmin = p.Role_IsAdmin;
                                return (
                                    <li key={p.User_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <img 
                                                src={p.Profile_Picture || "https://placehold.co/100"} 
                                                className="h-10 w-10 rounded-full flex-shrink-0"
                                                alt={p.First_Name}
                                            />
                                            <span className="truncate">{p.First_Name} {p.Last_Name}</span>
                                            {isThisMemberAnAdmin && (
                                                <FaCrown className="text-yellow-500 flex-shrink-0" title="Trưởng nhóm" />
                                            )}
                                        </div>
                                        {amIAdmin && !isThisMemberMe && (
                                            <div className="flex flex-shrink-0">
                                                <button 
                                                    onClick={() => handleKickUser(p.User_id)}
                                                    className="text-red-500 p-2 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100"
                                                    title="Đuổi thành viên"
                                                >
                                                    <FaUserTimes />
                                                </button>
                                                <button 
                                                    onClick={() => handleMakeAdmin(p.User_id)}
                                                    className="text-blue-500 p-2 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                                                    title="Nhường quyền Admin"
                                                >
                                                    <FaUserShield /> 
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="mt-auto">
                        <button 
                            onClick={handleLeaveOrDisbandGroup}
                            className="flex items-center justify-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 text-lg text-red-600"
                        >
                            <FaSignOutAlt />
                            <span>{amIAdmin ? "Giải tán nhóm" : "Rời khỏi nhóm"}</span>
                        </button>
                    </div>
                </>
            ) : (
                /* --- NẾU LÀ CHAT 1-1 --- */
                <>
                    <div className="mb-6 flex-1">
                        <button 
                            onClick={() => alert('Chuyển sang trang profile (chưa làm)')}
                            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 text-lg"
                        >
                            <FaAddressCard className="text-gray-600" />
                            <span>Xem trang cá nhân</span>
                        </button>
                    </div>
                    <div className="mt-auto">
                        <button 
                            onClick={handleDeleteChat}
                            className="flex items-center justify-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 text-lg text-red-600"
                        >
                            <FaTrash />
                            <span>Xóa đoạn chat</span>
                        </button>
                    </div>
                </>
            )}
        </aside>
    );
}

export default ChatSettingsPanel;
