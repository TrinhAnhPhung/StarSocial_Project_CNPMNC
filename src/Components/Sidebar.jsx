import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePopup } from './IsPopup';
import { getImageUrl } from '../utils/imageUtils';
import NotificationBell from './NotificationBell';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const [profilePic, setProfilePic] = useState(null);
    const { isPopup, setIsPopup } = usePopup();
    
    // Lấy thông tin user từ localStorage
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const isLoggedIn = email && email.trim() !== "" && token;

    // Cập nhật active link khi route thay đổi
    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location.pathname]);

    // Fetch profile picture khi user đã đăng nhập
    useEffect(() => {
        if (isLoggedIn && email && token) {
            const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';
            fetch(`${linkBackend}/api/profile/image?email=${email}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    if (res.status === 401) {
                        // Token không hợp lệ, clear và redirect
                        localStorage.clear();
                        navigate('/Login');
                        return null;
                    }
                    if (!res.ok) {
                        setProfilePic('/default-avatar.png');
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    if (data && data.profile_picture_url) {
                        setProfilePic(getImageUrl(data.profile_picture_url));
                    } else {
                        setProfilePic('/default-avatar.png');
                    }
                })
                .catch(err => {
                    console.error('Sidebar: Lỗi fetch profile picture:', err);
                    setProfilePic('/default-avatar.png');
                });
        } else {
            setProfilePic(null);
        }
    }, [isLoggedIn, email, token, location.pathname, navigate]);

    // Xử lý logout
    const handleLogout = () => {
        localStorage.clear();
        navigate('/Login');
    };

    // Toggle sidebar (collapse/expand)
    const toggleSidebar = () => {
        setIsPopup(!isPopup);
    };

    const menuItems = [
        { name: "Home", path: "/", icon: "home", requiresAuth: false },
        { name: "Explore", path: "/explore", icon: "explore", requiresAuth: false },
        { name: "People", path: "/people", icon: "group", requiresAuth: false },
        { name: "Messages", path: "/messages", icon: "chat", requiresAuth: true },
        { name: "Notifications", path: "/notification", icon: "notifications", requiresAuth: true },
        { name: "Create", path: "/create-post", icon: "add_circle_outline", requiresAuth: true },
        { name: "Profile", path: "/profile", icon: null, requiresAuth: true },
    ];

    // Mobile bottom navigation items (chỉ hiển thị một số items quan trọng)
    const mobileMenuItems = [
        { name: "Home", path: "/", icon: "home", requiresAuth: false },
        { name: "Explore", path: "/explore", icon: "explore", requiresAuth: false },
        { name: "Create", path: "/create-post", icon: "add_circle_outline", requiresAuth: true },
        { name: "Notifications", path: "/notification", icon: "notifications", requiresAuth: true },
        { name: "Profile", path: "/profile", icon: null, requiresAuth: true },
    ];

    // Kiểm tra nếu đang render mobile bottom nav (dựa vào parent class)
    const isMobileNav = typeof window !== 'undefined' && window.innerWidth < 768;

    // Kiểm tra nếu đang trong mobile bottom nav context
    const isMobileBottomNav = typeof window !== 'undefined' && window.innerWidth < 768 && 
        document.querySelector('.md\\:hidden.fixed.bottom-0');

    return (
        <>
            {/* Mobile Bottom Navigation - chỉ hiển thị trên mobile */}
            <div className="md:hidden flex items-center justify-around px-1 py-2 bg-white border-t border-gray-200 safe-area-bottom">
                {mobileMenuItems
                    .filter(item => !item.requiresAuth || isLoggedIn)
                    .map((item) => (
                        <div key={item.name} className="flex-1 flex justify-center max-w-[20%]">
                            {item.name === "Notifications" ? (
                                <div className="w-full flex flex-col items-center justify-center">
                                    <NotificationBell isCollapsed={true} />
                                    <span className="text-xs mt-1 text-gray-600">Thông báo</span>
                                </div>
                            ) : (
                                <Link
                                    to={item.path}
                                    onClick={() => setActiveLink(item.path)}
                                    className={`
                                        flex flex-col items-center justify-center p-1 rounded-lg w-full
                                        transition-all duration-200 ease-in-out
                                        ${activeLink === item.path || (item.path === '/profile' && location.pathname.startsWith('/profile'))
                                            ? 'text-blue-500'
                                            : 'text-gray-600'
                                        }
                                    `}
                                    title={item.name}
                                >
                                    {item.name === "Profile" && profilePic ? (
                                        <>
                                            <img
                                                src={profilePic}
                                                alt="Profile"
                                                className="w-6 h-6 rounded-full object-cover aspect-square border border-gray-200"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                            <span className="text-xs mt-1">{item.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons text-2xl">{item.icon}</span>
                                            <span className="text-xs mt-1">{item.name}</span>
                                        </>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
            </div>

            {/* Desktop Sidebar - ẩn trên mobile */}
            <div className="hidden md:block">
            {isPopup ? (
                <div className="w-64 h-screen bg-white text-gray-800 p-4 flex flex-col border-r border-gray-200 shadow-sm overflow-visible">
                    {/* Logo với toggle button */}
                    <div className="flex items-center justify-between mb-10 pl-3">
                        <Link to="/" className="flex items-center space-x-2 group flex-1">
                            <img 
                                src="./src/assets/Logo.png" 
                                alt="StarSocial Logo" 
                                className="w-10 h-10 object-contain hover:scale-105 transition-all" 
                            />
                            <div className="text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-blue-300 transition-all duration-500">
                                StarSocial
                            </div>
                        </Link>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Thu gọn sidebar"
                        >
                            <span className="material-icons text-xl">chevron_left</span>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col flex-grow space-y-2">
                        {menuItems
                            .filter(item => !item.requiresAuth || isLoggedIn)
                            .map((item) => (
                                <div key={item.name} className="relative">
                                    {item.name === "Notifications" ? (
                                        <NotificationBell />
                                    ) : (
                                        <Link
                                            to={item.path}
                                            onClick={() => setActiveLink(item.path)}
                                            className={`
                                                flex items-center space-x-4 p-3 rounded-xl font-semibold
                                                transition-all duration-200 ease-in-out transform
                                                ${activeLink === item.path || (item.path === '/profile' && location.pathname.startsWith('/profile'))
                                                    ? 'bg-blue-500 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:scale-105 hover:shadow-md'
                                                }
                                            `}
                                        >
                                            {item.name === "Profile" && profilePic ? (
                                                <img
                                                    src={profilePic}
                                                    alt="Profile"
                                                    className="w-8 h-8 rounded-full object-cover aspect-square border-2 border-gray-200"
                                                    style={{ objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-avatar.png';
                                                    }}
                                                />
                                            ) : (
                                                <span className="material-icons text-2xl" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                                            )}
                                            <span>{item.name}</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Logout/Login Button */}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-4 p-3 rounded-xl text-gray-700 mt-auto hover:bg-red-50 hover:text-red-600 hover:scale-105 hover:shadow-md transition-all duration-200"
                        >
                            <span className="material-icons text-2xl">logout</span>
                            <span>Logout</span>
                        </button>
                    ) : (
                        <Link
                            to="/Login"
                            className="flex items-center space-x-4 p-3 rounded-xl text-gray-700 mt-auto hover:bg-blue-50 hover:text-blue-600 hover:scale-105 hover:shadow-md transition-all duration-200"
                        >
                            <span className="material-icons text-2xl">login</span>
                            <span>Login</span>
                        </Link>
                    )}

                </div>
            ) : (
                <div className="w-20 h-screen bg-white text-gray-800 p-4 flex flex-col border-r border-gray-200 shadow-sm overflow-visible">
                    {/* Logo với toggle button */}
                    <div className="flex flex-col items-center mb-10">
                        <Link to="/" className="flex items-center justify-center mb-2 group">
                            <img 
                                src="./src/assets/Logo.png" 
                                alt="StarSocial Logo" 
                                className="w-10 h-10 object-contain hover:scale-110 transition-all" 
                            />
                        </Link>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Mở rộng sidebar"
                        >
                            <span className="material-icons text-xl">chevron_right</span>
                        </button>
                    </div>

                    {/* Menu Items - Chỉ hiển thị icon */}
                    <div className="flex flex-col flex-grow space-y-2">
                        {menuItems
                            .filter(item => !item.requiresAuth || isLoggedIn)
                            .map((item) => (
                                <div key={item.name} className="relative flex items-center justify-center">
                                    {item.name === "Notifications" ? (
                                        <div className="w-full flex items-center justify-center">
                                            <NotificationBell isCollapsed={true} />
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            onClick={() => setActiveLink(item.path)}
                                            className={`
                                                flex items-center justify-center p-3 rounded-xl font-semibold w-full
                                                transition-all duration-200 ease-in-out transform
                                                ${activeLink === item.path || (item.path === '/profile' && location.pathname.startsWith('/profile'))
                                                    ? 'bg-blue-500 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:scale-110 hover:shadow-md'
                                                }
                                            `}
                                            title={item.name}
                                        >
                                            {item.name === "Profile" && profilePic ? (
                                                <img
                                                    src={profilePic}
                                                    alt="Profile"
                                                    className="w-8 h-8 rounded-full object-cover aspect-square border-2 border-gray-200"
                                                    style={{ objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-avatar.png';
                                                    }}
                                                />
                                            ) : (
                                                <span className="material-icons text-2xl" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                                            )}
                                        </Link>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Logout/Login Button - Chỉ icon */}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center p-3 rounded-xl text-gray-700 mt-auto hover:bg-red-50 hover:text-red-600 hover:scale-110 hover:shadow-md transition-all duration-200"
                            title="Logout"
                        >
                            <span className="material-icons text-2xl">logout</span>
                        </button>
                    ) : (
                        <Link
                            to="/Login"
                            className="flex items-center justify-center p-3 rounded-xl text-gray-700 mt-auto hover:bg-blue-50 hover:text-blue-600 hover:scale-110 hover:shadow-md transition-all duration-200"
                            title="Login"
                        >
                            <span className="material-icons text-2xl">login</span>
                        </Link>
                    )}
                </div>
            )}
            </div>
        </>
    );
};

export default Sidebar;
