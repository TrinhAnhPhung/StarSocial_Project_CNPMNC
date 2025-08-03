import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TopCreators = () => {
    // State để lưu trữ dữ liệu
    const [currentUser, setCurrentUser] = useState(null);
    const [suggestedCreators, setSuggestedCreators] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect để lấy dữ liệu một lần khi component được render
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            let userId = null;

            // 1. Lấy thông tin người dùng hiện tại từ localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
                userId = parsedUser.id; // Lấy ID để dùng cho API call
            }

            // 2. Gọi API để lấy danh sách người dùng gợi ý
            try {
                // Xây dựng URL an toàn, loại trừ người dùng hiện tại
                let apiUrl = 'http://localhost:5000/api/users/suggestions';
                if (userId) {
                    apiUrl += `?exclude=${userId}`;
                }

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }

                const data = await response.json();

                // Chuyển đổi dữ liệu cho khớp với cấu trúc component
                const formattedData = data.map(user => ({
                    id: user.id,
                    name: user.full_name,
                    username: user.username,
                    avatar: user.profile_picture_url,
                    isFollowing: false // Trạng thái follow ban đầu
                }));

                setSuggestedCreators(formattedData);
            } catch (error) {
                console.error("Lỗi khi tải danh sách gợi ý:", error);
            } finally {
                setLoading(false); // Dừng trạng thái tải
            }
        };

        fetchInitialData();
    }, []); // Mảng rỗng `[]` đảm bảo useEffect chỉ chạy 1 lần duy nhất

    // Xử lý sự kiện nhấn nút Follow/Following
    const handleFollow = (creatorId) => {
        // TODO: Gửi yêu cầu API đến backend để thực hiện việc follow/unfollow
        // Sau khi API thành công, cập nhật giao diện:
        setSuggestedCreators(prevCreators =>
            prevCreators.map(creator =>
                creator.id === creatorId
                    ? { ...creator, isFollowing: !creator.isFollowing }
                    : creator
            )
        );
    };
    
    // Giao diện khi đang tải dữ liệu
    if (loading) {
        return <div className="text-gray-800 p-6 rounded-lg max-w-sm mx-auto">Đang tải...</div>;
    }

    // Giao diện chính sau khi đã tải xong
    return (
        <div className="text-gray-800 p-6 rounded-lg max-w-sm mx-auto">
            {/* Hiển thị người dùng hiện tại (nếu có) */}
            {currentUser && (
                <div className="flex items-center justify-between mb-8">
                    <Link to={`/profile`} className="flex items-center space-x-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                                src={currentUser.profile_picture_url || 'https://via.placeholder.com/150'} 
                                alt="User Avatar" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">{currentUser.username}</span>
                            <span className="text-sm text-gray-500">{currentUser.full_name}</span>
                        </div>
                    </Link>
                </div>
            )}

            {/* Tiêu đề "Suggestions for you" */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 text-1xl">Suggestions for you</h3>
                <Link to="/people" className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition-colors">
                    See all
                </Link>
            </div>

            {/* Danh sách người dùng được gợi ý */}
            <div className="space-y-2 mb-10">
                {suggestedCreators.map((creator) => (
                    <div
                        key={creator.id}
                        className="flex items-center justify-between p-2 rounded-lg transition-colors duration-300 ease-in-out hover:bg-gray-100"
                    >
                        <Link to={`/profile`} className="flex items-center space-x-3 cursor-pointer">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <img 
                                    src={creator.avatar || 'https://via.placeholder.com/150'} 
                                    alt="User Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">{creator.username}</span>
                                <span className="text-sm text-gray-500">{creator.name}</span>
                            </div>
                        </Link>
                        <button
                            onClick={() => handleFollow(creator.id)}
                            className={`w-24 px-4 py-1.5 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-300 active:scale-95 ${creator.isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            {creator.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-500 space-y-2">
                <p className="leading-relaxed">
                    About . Jobs . Help . API .<br />
                    Privacy . Terms . Locations
                </p>
                <p className="mt-2">© 2025 StarSocial From Starteam</p>
            </div>
        </div>
    );
};

export default TopCreators;