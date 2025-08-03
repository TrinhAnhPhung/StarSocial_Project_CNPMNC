import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const People = () => {
    // Dữ liệu người dùng (không đổi)
    const [users, setUsers] = useState([
    { id: 1, name: 'Nguyễn Minh Quân', username: 'quan.nguyen', avatar: 'https://picsum.photos/id/21/200/200', isFollowing: false },
    { id: 2, name: 'Trần Thị Ngọc Anh', username: 'ngocanh.tran', avatar: 'https://picsum.photos/id/22/200/200', isFollowing: false },
    { id: 3, name: 'Lê Hoàng Long', username: 'longle.dev', avatar: 'https://picsum.photos/id/23/200/200', isFollowing: true },
    { id: 4, name: 'Phạm Thu Hà', username: 'hanoi.pho', avatar: 'https://picsum.photos/id/24/200/200', isFollowing: false },
    { id: 5, name: 'Vũ Đức Minh', username: 'minhvu.it', avatar: 'https://picsum.photos/id/25/200/200', isFollowing: true },
    { id: 6, name: 'Hoàng Kiều Trang', username: 'trang.hoang98', avatar: 'https://picsum.photos/id/26/200/200', isFollowing: false },
    { id: 7, name: 'Đặng Thành Nam', username: 'namthanh.dang', avatar: 'https://picsum.photos/id/27/200/200', isFollowing: false },
    { id: 8, name: 'Bùi Thanh Thảo', username: 'thaobui.art', avatar: 'https://picsum.photos/id/28/200/200', isFollowing: true },
    { id: 9, name: 'Hồ Anh Tuấn', username: 'tuanho.official', avatar: 'https://picsum.photos/id/29/200/200', isFollowing: false },
    { id: 10, name: 'Ngô Phương Linh', username: 'linhngo.sg', avatar: 'https://picsum.photos/id/30/200/200', isFollowing: true },
    { id: 11, name: 'Dương Gia Huy', username: 'huyduong.coder', avatar: 'https://picsum.photos/id/31/200/200', isFollowing: false },
    { id: 12, name: 'Mai Thị Bích Phượng', username: 'phuongmai.25', avatar: 'https://picsum.photos/id/32/200/200', isFollowing: false },
    { id: 13, name: 'Lý Quốc Bảo', username: 'baoly.photo', avatar: 'https://picsum.photos/id/33/200/200', isFollowing: true },
    { id: 14, name: 'Phan Thảo Nguyên', username: 'thaonguyen.p', avatar: 'https://picsum.photos/id/34/200/200', isFollowing: false },
    { id: 15, name: 'Châu Minh Khôi', username: 'khoichau.dev', avatar: 'https://picsum.photos/id/35/200/200', isFollowing: true },
    { id: 16, name: 'Đỗ Mỹ Tâm', username: 'mytam.singer', avatar: 'https://picsum.photos/id/36/200/200', isFollowing: false },
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