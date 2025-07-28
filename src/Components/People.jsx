import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const People = () => {
    // Dữ liệu người dùng (không đổi)
    const [users, setUsers] = useState([
        { id: 1, name: 'Trinhanhphung', username: 'Trinhanhphung', avatar: 'https://i.pravatar.cc/40?img=5', isFollowing: false },
        { id: 2, name: 'Siddharth', username: 'Siddharth', avatar: 'https://i.pravatar.cc/40?img=6', isFollowing: false },
        { id: 3, name: 'shivam', username: 'shivam79', avatar: 'https://i.pravatar.cc/40?img=7', isFollowing: true },
        { id: 4, name: 'Sanayaa', username: 'Arii', avatar: 'https://i.pravatar.cc/40?img=8', isFollowing: false },
        { id: 5, name: 'Kritika Roy', username: 'elysian_07', avatar: 'https://i.pravatar.cc/40?img=9', isFollowing: true },
        { id: 6, name: 'Ronny', username: 'Roney', avatar: 'https://i.pravatar.cc/40?img=10', isFollowing: false },
        { id: 7, name: 'Rahul', username: 'rahul_dev', avatar: 'https://i.pravatar.cc/40?img=11', isFollowing: false },
        { id: 8, name: 'Deepak', username: 'deepak_dev', avatar: 'https://i.pravatar.cc/40?img=12', isFollowing: true },
        { id: 9, name: 'Aisha Khan', username: 'aisha_k', avatar: 'https://i.pravatar.cc/40?img=13', isFollowing: false },
        { id: 10, name: 'Ben Carter', username: 'bencarter', avatar: 'https://i.pravatar.cc/40?img=14', isFollowing: true },
        { id: 11, name: 'Chloe Davis', username: 'chloe_d', avatar: 'https://i.pravatar.cc/40?img=15', isFollowing: false },
        { id: 12, name: 'David Wilson', username: 'davidw', avatar: 'https://i.pravatar.cc/40?img=16', isFollowing: false },
        { id: 13, name: 'Emily Brown', username: 'emily_b', avatar: 'https://i.pravatar.cc/40?img=17', isFollowing: true },
        { id: 14, name: 'Frank Miller', username: 'frank_m', avatar: 'https://i.pravatar.cc/40?img=18', isFollowing: false },
        { id: 15, name: 'Grace Lee', username: 'grace_lee', avatar: 'https://i.pravatar.cc/40?img=19', isFollowing: true },
        { id: 16, name: 'Henry Garcia', username: 'henry_g', avatar: 'https://i.pravatar.cc/40?img=20', isFollowing: false },
    ]);

    // ✅ 1. State để lưu trữ từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    const handleFollowToggle = (userId) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
            )
        );
        console.log(`User ${userId} - ${users.find(u => u.id === userId)?.isFollowing ? 'Unfollowed' : 'Followed'}`);
    };

    // ✅ 2. Lọc danh sách người dùng dựa trên searchTerm
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen p-6">
            <h1 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                <span className="material-icons text-blue-500">people</span>
                <span>All Users</span>
            </h1>
            {/* ✅ 3. Thêm thanh tìm kiếm */}
            <div className="mb-8 relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                    type="text"
                    placeholder="Search users by name or username..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* ✅ 4. Hiển thị danh sách đã lọc hoặc thông báo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white rounded-lg p-4 flex flex-col items-center justify-between text-center border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-400 transition-all duration-300"
                        >
                            <Link to={`/profile/${user.username}`} className="flex flex-col items-center flex-grow mb-4 cursor-pointer">
                                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-blue-100 flex items-center justify-center text-4xl font-bold">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <h2 className="text-lg font-semibold">{user.name}</h2>
                                <p className="text-gray-500 text-sm">@{user.username}</p>
                            </Link>

                            <button
                                onClick={() => handleFollowToggle(user.id)}
                                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${user.isFollowing ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                            >
                                {user.isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 mt-8">
                        No users found matching "{searchTerm}".
                    </p>
                )}
            </div>
        </div>
    );
};

export default People;