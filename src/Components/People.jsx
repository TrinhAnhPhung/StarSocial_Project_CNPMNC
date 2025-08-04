import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi'; // Import icon tìm kiếm

const People = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // SỬA: Gọi đúng API để lấy tất cả user
                const response = await fetch('http://localhost:5000/api/users');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const formattedUsers = data.map(user => ({
                    id: user.id,
                    name: user.full_name,
                    username: user.username,
                    avatar: user.profile_picture_url,
                    isFollowing: false // Trạng thái follow mặc định
                }));
                setUsers(formattedUsers);
            } catch  {
                // Gán lỗi vào state để hiển thị
                setError("Could not load users. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleFollowToggle = (userId) => {
        // Tạm thời chỉ thay đổi state ở client
        // Trong thực tế, bạn sẽ gọi API để cập nhật trạng thái follow ở đây
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
            )
        );
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Giao diện Loading với spinner
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-500 border-solid rounded-full animate-spin border-t-transparent"></div>
            </div>
        );
    }
    
    if (error) {
         return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen p-6 font-sans">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore People</h1>
            
            {/* Thanh tìm kiếm với Icon */}
            <div className="mb-8 relative">
                <FiSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or username..."
                    className="w-full pl-12 pr-4 py-3 border rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 cursor-pointer">
                {filteredUsers.map((user) => (
                    // Card User với hiệu ứng
                    <div 
                        key={user.id} 
                        className="bg-white rounded-lg p-5 flex flex-col items-center text-center border shadow-md transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2"
                    >
                        <Link to={`/profile/${user.username}`} className="flex flex-col items-center flex-grow mb-4 w-full cursor-pointer">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt={`${user.name}'s Avatar`}
                                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200"
                            />
                            <h2 className="text-lg font-semibold text-gray-800">{user.name || 'Unnamed User'}</h2>
                            <p className="text-gray-500 text-sm">@{user.username}</p>
                        </Link>
                        <button
                            onClick={() => handleFollowToggle(user.id)}
                            className={`cursor-pointer w-full py-2 px-4 rounded-full font-semibold text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                                ${user.isFollowing 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'
                                }`}
                        >
                            {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>
            
            {/* Thông báo khi không có kết quả tìm kiếm */}
            {filteredUsers.length === 0 && !loading && (
                <div className="text-center col-span-full py-10">
                    <p className="text-gray-500 text-lg">No users found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default People;