import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

/* ---------------------------------------------------
 * 5️⃣ MODAL THÊM THÀNH VIÊN
 * --------------------------------------------------- */
function AddMemberModal({ 
    isOpen, onClose, user, linkBackend, 
    chatInfo, // Thông tin chat (để lấy ID)
    currentParticipants, // Danh sách thành viên HIỆN TẠI
    onMembersAdded // Callback báo cho cha
}) {
    if (!isOpen) return null;

    const [friendsList, setFriendsList] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Tải danh sách bạn bè (mutuals) và lọc những người đã có trong nhóm
    useEffect(() => {
        if (isOpen) {
            // Reset state
            setSelectedUsers([]);
            setSearchTerm("");
            setError("");
            
            const fetchFriends = async () => {
                setIsLoading(true);
                const token = localStorage.getItem("token");
                try {
                    // 1. Lấy danh sách TẤT CẢ bạn bè
                    const response = await fetch(
                        `${linkBackend}/api/conversations/mutual-followers`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    if (!response.ok) throw new Error("Lỗi tải danh sách bạn bè");
                    const allMutuals = await response.json();
                    
                    // 2. Lấy ID của những người đã ở trong nhóm
                    const participantIds = currentParticipants.map(p => p.User_id);

                    // 3. Lọc ra những người CHƯA ở trong nhóm
                    const friendsToAdd = allMutuals.filter(friend => !participantIds.includes(friend.User_id));
                    
                    setFriendsList(friendsToAdd);

                } catch (err) {
                    console.error("Lỗi fetchFriends (AddMemberModal):", err);
                    setError("Không thể tải danh sách bạn bè.");
                    setFriendsList([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchFriends(); 
        }
    }, [isOpen, linkBackend, currentParticipants]); // Chạy lại khi danh sách thành viên thay đổi

    // Hàm xử lý gọi API thêm
    const handleAddMembers = async () => {
        setError(""); 
        if (selectedUsers.length === 0) {
            setError("Bạn phải chọn ít nhất 1 người.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${linkBackend}/api/conversations/${chatInfo.Conversation_id}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userIdsToAdd: selectedUsers
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Không thể thêm thành viên.");
            }

            const newlyAddedUsers = await response.json();
            
            // Báo cho component cha biết đã thêm xong
            onMembersAdded(newlyAddedUsers);
            onClose(); // Đóng modal

        } catch (err) {
            console.error("Lỗi handleAddMembers:", err);
            setError(err.message);
        }
    };

    // Hàm chọn/bỏ chọn
    const toggleUserSelect = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };
    
    // Lọc danh sách bạn bè dựa trên tìm kiếm
    const filteredFriends = friendsList.filter(friend => {
        const fullName = `${friend.First_Name || ''} ${friend.Last_Name || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-50 border-2 border-blue-500">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Thêm thành viên</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <div className="mb-4">
                    <label className="block text-lg text-gray-600 mb-2">Tìm bạn bè</label>
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên..."
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="h-64 overflow-y-auto mb-4 border rounded-lg p-2">
                    {isLoading && <p className="p-3 text-center text-gray-500">Đang tải danh sách...</p>}
                    
                    {!isLoading && friendsList.length === 0 && !error && (
                        <p className="p-3 text-center text-gray-500">Tất cả bạn bè của bạn đã ở trong nhóm.</p>
                    )}
                    
                    {!isLoading && filteredFriends.length > 0 && filteredFriends.map(friend => (
                        <div 
                            key={friend.User_id} 
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => toggleUserSelect(friend.User_id)}
                        >
                            <div className="flex items-center gap-3">
                                <img 
                                    src={friend.Profile_Picture || "https://placehold.co/100"}
                                    alt={friend.First_Name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <span className="text-lg">{friend.First_Name} {friend.Last_Name}</span>
                            </div>
                            <input 
                                type="checkbox" 
                                className="form-checkbox h-5 w-5"
                                readOnly
                                checked={selectedUsers.includes(friend.User_id)}
                            />
                        </div>
                    ))}
                    
                    {!isLoading && friendsList.length > 0 && filteredFriends.length === 0 && (
                         <p className="p-3 text-center text-gray-500">Không tìm thấy bạn bè nào.</p>
                    )}
                </div>

                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}

                <button 
                    onClick={handleAddMembers}
                    className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-blue-600"
                    disabled={selectedUsers.length === 0}
                >
                    Thêm vào nhóm
                </button>
            </div>
        </div>
    );
}

export default AddMemberModal;
