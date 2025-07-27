import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const [profilePic, setProfilePic] = useState(null);

    // Giả sử username được lưu trong localStorage khi user login
    const username = localStorage.getItem('username');

    // Fetch profile data từ API
    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        if (username) {
            fetch(`http://localhost:5000/api/profile/${username}`)
                .then(res => res.json())
                .then(data => {
                    setProfilePic(data.profile_picture_url);
                })
                .catch(err => console.error('Error fetching profile:', err));
        }
    }, [username]);

    const menuItems = [
        { name: "Home", path: "/", icon: "home" },
        
        { name: "Explore", path: "/explore", icon: "explore" },
        { name: "People", path: "/people", icon: "group" },
        { name: "Messages", path: "/messages", icon: "chat" },
        { name: "Notifications", path: "/Notification", icon: "favorite_border" },
        { name: "Create", path: "/create-post", icon: "add_circle_outline" },
        { name: "Profile", path: "/profile", icon: null }, // Không dùng icon mặc định
    ];

    return (
        <div className="w-64 h-screen bg-gray-100 text-gray-800 p-4 flex flex-col">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 mb-10 pl-3 group">
                <img src="./src/assets/Logo.png" alt="StarSocial Logo" className="w-10 h-10 object-contain hover:scale-105 transition-all" />
                <div className="text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-blue-300">
                    StarSocial
                </div>
            </Link>

            {/* Menu Items */}
            <div className="flex flex-col flex-grow space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setActiveLink(item.path)}
                        className={`
                            flex items-center space-x-4 p-3 rounded-xl font-semibold
                            transition-all duration-200 ease-in-out transform
                            ${activeLink === item.path
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 hover:scale-105 hover:shadow-md'
                            }
                        `}
                    >
                        {item.name === "Profile" && profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <span className="material-icons text-2xl">{item.icon}</span>
                        )}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* Logout Button */}
            <Link to="/Login" className="flex items-center space-x-4 p-3 rounded-xl text-gray-700 mt-auto hover:bg-gray-200 hover:scale-105 hover:shadow-md transition-all duration-200">
                <span className="material-icons text-2xl">logout</span>
                <span>Logout</span>
            </Link>
        </div>
    );
};

export default Sidebar;
