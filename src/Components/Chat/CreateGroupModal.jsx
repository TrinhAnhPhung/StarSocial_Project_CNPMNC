import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

/* ---------------------------------------------------
 * 4️⃣ MODAL TẠO NHÓM
 * --------------------------------------------------- */
function CreateGroupModal({ 
    isOpen, onClose, user, linkBackend, onGroupCreated 
}) {
    if (!isOpen) return null;

    const [mutuals, setMutuals] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [error, setError] = useState("");
    const [groupSearchTerm, setGroupSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            setSelectedUsers([]);
            setGroupName("");
            setError("");
            setGroupSearchTerm("");
            const fetchMutuals = async () => {
                setIsLoading(true);
                const token = localStorage.getItem("token");
                try {
                    const response = await fetch(
                        `${linkBackend}/api/conversations/mutual-followers`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    if (!response.ok) throw new Error("Lỗi tải danh sách bạn bè");
                    const data = await response.json();
                    setMutuals(data);
                } catch (err) {
                    console.error("Lỗi fetchMutuals:", err);
                    setError("Không thể tải danh sách bạn bè.");
                    setMutuals([]); 
                } finally {
                    setIsLoading(false);
                }
            };
            fetchMutuals(); 
        }
    }, [isOpen, linkBackend]); 

    const handleCreateGroup = async () => {
        setError(""); 
        if (groupName.trim() === "") {
            setError("Tên nhóm không được để trống.");
            return;
        }
        if (selectedUsers.length === 0) {
            setError("Bạn phải chọn ít nhất 1 người.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${linkBackend}/api/conversations/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    groupName: groupName,
                    participantIds: selectedUsers
                })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Không thể tạo nhóm.");
            }
            const newGroupData = await response.json();
            onGroupCreated(newGroupData);
            onClose(); 
        } catch (err) {
            console.error("Lỗi handleCreateGroup:", err);
            setError(err.message);
        }
    };
    const toggleUserSelect = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };
    const filteredMutuals = mutuals.filter(friend => {
        const fullName = `${friend.First_Name || ''} ${friend.Last_Name || ''}`.toLowerCase();
        return fullName.includes(groupSearchTerm.toLowerCase());
    });

    return (
        <div className="fixed inset-0  bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-50 border-2 border-gray-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Tạo nhóm mới</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-lg text-gray-600 mb-2">Tên nhóm</label>
                    <input 
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Nhập tên nhóm của bạn..."
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-lg text-gray-600 mb-2">Tìm bạn bè</label>
                    <input 
                        type="text"
                        value={groupSearchTerm}
                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên..."
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="h-64 overflow-y-auto mb-4 border rounded-lg p-2">
                    {isLoading && <p className="p-3 text-center text-gray-500">Đang tải danh sách...</p>}
                    {!isLoading && mutuals.length === 0 && !error && (
                        <p className="p-3 text-center text-gray-500">Bạn chưa có bạn bè chung nào.</p>
                    )}
                    {!isLoading && filteredMutuals.length > 0 && filteredMutuals.map(friend => (
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
                    {!isLoading && mutuals.length > 0 && filteredMutuals.length === 0 && (
                         <p className="p-3 text-center text-gray-500">Không tìm thấy bạn bè nào.</p>
                    )}
                </div>
                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}
                <button 
                    onClick={handleCreateGroup}
                    className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-blue-600"
                >
                    Tạo nhóm
                </button>
            </div>
        </div>
    );
}

export default CreateGroupModal;
