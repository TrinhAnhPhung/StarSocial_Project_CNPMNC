import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUserCheck, FiUserPlus } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUtils';
import axios from 'axios';

const People = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [followingLoading, setFollowingLoading] = useState(new Set());
    const navigate = useNavigate();
    const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';

    // Lấy current user ID từ token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id);
            } catch (err) {
                console.error('Error parsing token:', err);
            }
        }
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                
                const response = await fetch(`${linkBackend}/api/users`, {
                    headers
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        // Token không hợp lệ, nhưng vẫn cho phép xem danh sách
                        console.warn('Token không hợp lệ, hiển thị danh sách không có follow status');
                    } else {
                        throw new Error(`Network response was not ok: ${response.status}`);
                    }
                }
                
                const data = await response.json();
                
                // Đảm bảo data là một mảng
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received from server');
                }
                
                // Format tất cả users được tải lên và loại bỏ user hiện tại
                const formattedUsers = data
                    .filter(user => user.id !== currentUserId) // Loại bỏ user hiện tại
                    .map(user => ({
                        id: user.id,
                        name: user.full_name || 'Unnamed User',
                        username: user.username || user.Email || '',
                        avatar: user.profile_picture_url || null,
                        isFollowing: user.isFollowing || false
                    }));
                
                // Lưu tất cả danh sách người dùng được tải lên
                setUsers(formattedUsers);
                console.log(`✅ Đã tải ${formattedUsers.length} người dùng`);
            } catch (err) {
                // Gán lỗi vào state để hiển thị
                console.error('❌ Lỗi khi tải danh sách người dùng:', err);
                setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [linkBackend, currentUserId]);

    // Chuẩn hoá username để không hiển thị toàn bộ email
    const formatUsername = (value) => {
        if (!value) return '';
        const str = String(value);
        return str.includes('@') ? str.split('@')[0] : str;
    };

    const handleFollowToggle = async (userId, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Bạn cần đăng nhập để thực hiện hành động này.");
            navigate('/Login');
            return;
        }

        // Set loading state
        setFollowingLoading(prev => {
            const newSet = new Set(prev);
            newSet.add(userId);
            return newSet;
        });

        // Optimistic update
        const originalState = users.find(u => u.id === userId)?.isFollowing;
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
            )
        );

        try {
            const response = await axios.post(
                `${linkBackend}/api/users/${userId}/follow`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            // Cập nhật từ response
            if (response.data.isFollowing !== undefined) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, isFollowing: response.data.isFollowing } : user
                    )
                );
            }
        } catch (err) {
            console.error("Lỗi khi follow/unfollow:", err);
            // Rollback nếu có lỗi
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, isFollowing: originalState } : user
                )
            );
            
            if (err.response?.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                localStorage.clear();
                navigate('/Login');
            } else {
                alert(err.response?.data?.error || err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } finally {
            setFollowingLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Memoize filtered users để tối ưu performance
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        return users.filter(user =>
            (user.name && user.name.toLowerCase().includes(lowerSearchTerm)) ||
            (user.username && user.username.toLowerCase().includes(lowerSearchTerm))
        );
    }, [users, searchTerm]);

    // Skeleton loading component
    const UserCardSkeleton = () => (
        <div className="bg-white rounded-lg p-5 flex flex-col items-center text-center border shadow-md animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gray-300 mb-4"></div>
            <div className="h-5 w-32 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-4"></div>
            <div className="h-10 w-full bg-gray-300 rounded-full"></div>
        </div>
    );

    // Giao diện Loading với skeleton
    if (loading) {
        return (
            <div className="bg-gray-50 text-gray-900 min-h-screen p-6 font-sans">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore People</h1>
                <div className="mb-8 relative">
                    <div className="w-full h-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <UserCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-gray-50 text-gray-900 min-h-screen p-6 font-sans">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Explore People</h1>
                    <div className="text-gray-600">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'}
                    </div>
                </div>
                
                {/* Thanh tìm kiếm với Icon */}
                <div className="mb-8 relative max-w-2xl">
                    <FiSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or username..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover-lift"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Grid Users */}
                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredUsers.map((user) => (
                            <div 
                                key={user.id} 
                                className="bg-white rounded-xl p-6 flex flex-col items-center text-center border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover-lift animate-fade-in"
                            >
                                <Link 
                                    to={`/profile/${user.id || user.email || user.username}`} 
                                    className="flex flex-col items-center flex-grow mb-4 w-full cursor-pointer group"
                                >
                                    <div className="relative mb-4">
                                        <img
                                            src={getImageUrl(user.avatar, linkBackend)}
                                            alt={`${user.name}'s Avatar`}
                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-all"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=96`;
                                            }}
                                        />
                                        {user.isFollowing && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                                <FiUserCheck className="text-white" size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                                        {user.name || 'Unnamed User'}
                                    </h2>
                                    <p className="text-gray-500 text-sm max-w-[180px] truncate" title={user.username || ''}>@{formatUsername(user.username) || 'user'}</p>
                                </Link>
                                <button
                                    onClick={(e) => handleFollowToggle(user.id, e)}
                                    disabled={followingLoading.has(user.id)}
                                    className={`w-full py-2.5 px-4 rounded-full font-semibold text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover-lift
                                        ${user.isFollowing 
                                            ? 'bg-white text-blue-600 border-2 border-blue-500 hover:bg-blue-50 focus:ring-blue-500' 
                                            : 'btn-gradient text-white'
                                        }`}
                                >
                                    {followingLoading.has(user.id) ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            {user.isFollowing ? (
                                                <>
                                                    <FiUserCheck size={16} />
                                                    <span>Following</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUserPlus size={16} />
                                                    <span>Follow</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4">
                            <FiSearch size={64} className="mx-auto" />
                        </div>
                        <p className="text-gray-600 text-lg font-medium mb-2">No users found</p>
                        <p className="text-gray-500">
                            {searchTerm 
                                ? `No users match "${searchTerm}". Try a different search term.`
                                : "No users available at the moment."
                            }
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default People;