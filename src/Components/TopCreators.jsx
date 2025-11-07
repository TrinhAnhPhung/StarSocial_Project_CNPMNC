import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const TopCreators = () => {
    // State để lưu trữ dữ liệu
    const [currentUser, setCurrentUser] = useState(null);
    const [suggestedCreators, setSuggestedCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';

    // useEffect để lấy dữ liệu một lần khi component được render
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            let userId = null;

            // 1. Lấy thông tin người dùng hiện tại từ API (thay vì localStorage để có data đầy đủ)
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userResponse = await fetch(`${linkBackend}/api/profile/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        // Normalize data để đảm bảo có đầy đủ fields
                        const normalizedUser = {
                            ...userData,
                            id: userData.id || userData.User_id,
                            username: userData.username || userData.Email,
                            email: userData.Email || userData.email,
                            full_name: userData.full_name || `${userData.First_Name || ''} ${userData.Last_name || ''}`.trim(),
                            profile_picture_url: userData.Profile_Picture || userData.profile_picture_url || userData.profilePicture || null
                        };
                        setCurrentUser(normalizedUser);
                        userId = normalizedUser.id;
                    } else {
                        // Fallback: Lấy từ localStorage nếu API fail
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            const parsedUser = JSON.parse(storedUser);
                            setCurrentUser(parsedUser);
                            userId = parsedUser.id;
                        }
                    }
                } catch (error) {
                    console.error("Lỗi khi fetch user:", error);
                    // Fallback: Lấy từ localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const parsedUser = JSON.parse(storedUser);
                        setCurrentUser(parsedUser);
                        userId = parsedUser.id;
                    }
                }
            } else {
                // Fallback: Lấy từ localStorage nếu không có token
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setCurrentUser(parsedUser);
                    userId = parsedUser.id;
                }
            }

            // 2. Gọi API để lấy danh sách người dùng gợi ý
            try {
                // Xây dựng URL an toàn, loại trừ người dùng hiện tại
                const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';
                let apiUrl = `${linkBackend}/api/users/suggestions`;
                if (userId) {
                    apiUrl += `?exclude=${userId}`;
                }

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }

                const data = await response.json();

                // Chuyển đổi dữ liệu cho khớp với cấu trúc component
                let formattedData = data.map(user => ({
                    id: user.id,
                    name: user.full_name || 'Unnamed User',
                    username: user.username || user.Email || '',
                    avatar: user.profile_picture_url || null,
                    profile_picture_url: user.profile_picture_url || null,
                    isFollowing: user.is_following || false // Lấy từ API nếu có
                }));

                // Nếu có token, kiểm tra follow status cho từng user
                if (token && formattedData.length > 0) {
                    const followStatusPromises = formattedData.map(async (user) => {
                        try {
                            const statusResponse = await fetch(
                                `${linkBackend}/api/users/${user.id}/follow-status`,
                                {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                }
                            );
                            if (statusResponse.ok) {
                                const statusData = await statusResponse.json();
                                return { ...user, isFollowing: statusData.isFollowing || false };
                            }
                        } catch (error) {
                            console.error(`Lỗi khi kiểm tra follow status cho ${user.id}:`, error);
                        }
                        return user;
                    });

                    formattedData = await Promise.all(followStatusPromises);
                }

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
    const handleFollow = async (creatorId, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Bạn cần đăng nhập để thực hiện hành động này.");
            return;
        }

        // Optimistic update
        const originalState = suggestedCreators.find(c => c.id === creatorId)?.isFollowing;
        setSuggestedCreators(prevCreators =>
            prevCreators.map(creator =>
                creator.id === creatorId
                    ? { ...creator, isFollowing: !creator.isFollowing }
                    : creator
            )
        );

        try {
            const response = await fetch(
                `${linkBackend}/api/users/${creatorId}/follow`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to follow/unfollow');
            }

            const data = await response.json();
            
            // Cập nhật từ response
            if (data.isFollowing !== undefined) {
                setSuggestedCreators(prevCreators =>
                    prevCreators.map(creator =>
                        creator.id === creatorId
                            ? { ...creator, isFollowing: data.isFollowing }
                            : creator
                    )
                );
            }
        } catch (error) {
            console.error("Lỗi khi follow/unfollow:", error);
            // Rollback nếu có lỗi
            setSuggestedCreators(prevCreators =>
                prevCreators.map(creator =>
                    creator.id === creatorId
                        ? { ...creator, isFollowing: originalState }
                        : creator
                )
            );
            alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
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
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                            <img 
                                src={(() => {
                                    const profilePic = currentUser.profile_picture_url || 
                                                      currentUser.Profile_Picture || 
                                                      currentUser.profilePicture || 
                                                      null;
                                    return getImageUrl(profilePic, linkBackend);
                                })()}
                                alt="User Avatar" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/default-avatar.png';
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">
                                {currentUser.username || currentUser.Email || currentUser.email || 'User'}
                            </span>
                            <span className="text-sm text-gray-500">
                                {currentUser.full_name || 
                                 (currentUser.First_Name && currentUser.Last_name ? `${currentUser.First_Name} ${currentUser.Last_name}` : '') ||
                                 ''}
                            </span>
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
                {suggestedCreators.length > 0 ? (
                    suggestedCreators.map((creator) => (
                        <div
                            key={creator.id}
                            className="flex items-center justify-between p-2 rounded-lg transition-colors duration-300 ease-in-out hover:bg-gray-100"
                        >
                            <Link to={`/profile/${creator.id || creator.email || creator.username}`} className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                    <img 
                                        src={getImageUrl(creator.avatar || creator.profile_picture_url, linkBackend)} 
                                        alt={`${creator.username || creator.name}'s Avatar`} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            // Fallback to UI Avatars với tên người dùng
                                            const name = creator.name || creator.username || 'User';
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-semibold text-base truncate">{creator.username || creator.name}</span>
                                    <span className="text-sm text-gray-500 truncate">{creator.name || ''}</span>
                                </div>
                            </Link>
                            {/* Chỉ hiển thị nút Follow nếu chưa theo dõi */}
                            {!creator.isFollowing && (
                                <button
                                    onClick={(e) => handleFollow(creator.id, e)}
                                    className="ml-2 w-24 px-4 py-1.5 rounded-lg font-semibold cursor-pointer text-sm transition-all duration-300 active:scale-95 flex-shrink-0 bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    Follow
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                        Không có gợi ý nào
                    </div>
                )}
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