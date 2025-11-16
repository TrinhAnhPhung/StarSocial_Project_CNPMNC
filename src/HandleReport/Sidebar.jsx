// src/HandleReport/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { BiBlock } from 'react-icons/bi';
import { BsTextParagraph } from 'react-icons/bs';
import { FiLogOut } from 'react-icons/fi';

// Danh sách menu (Không đổi)
const navItems = [
  { href: '/processor', icon: HiOutlineDocumentReport, text: 'Violating Posts' },
  { href: '/blockaccount', icon: BiBlock, text: 'Blocked Accounts' },
  { href: '/keyword-statistics', icon: BsTextParagraph, text: 'Sensitive Keywords' },
];

/**
 * Modal xác nhận Đăng xuất
 * (Thay thế cho window.confirm)
 */
const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[99] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Xác nhận Đăng xuất</h3>
          <p className="mt-2 text-sm text-gray-600">
            Bạn có chắc chắn muốn đăng xuất không?
          </p>
        </div>
        <div className="flex justify-end space-x-3 bg-gray-50 p-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};


/**
 * Sidebar (Thiết kế Dark Theme)
 */
const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userEmail = localStorage.getItem('email') || 'admin@example.com';

  // Hàm thực hiện đăng xuất
  const confirmLogout = () => {
    localStorage.clear();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  // Hàm mở modal (thay cho window.confirm)
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  return (
    <>
      {/* THIẾT KẾ MỚI: Dark theme, nền màu Xanh Xám Đậm (Slate) */}
      <aside className="w-64 bg-slate-900 text-white fixed top-0 left-0 bottom-0 shadow-lg flex flex-col z-50">
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Logo/Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-700">
            <FaStar className="text-yellow-400 text-3xl mr-3" />
            <h1 className="text-xl font-bold text-white leading-tight">
              Report Center
            </h1>
          </div>

          {/* Nav Menu */}
          <nav className="px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.text}
                to={item.href}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white font-semibold shadow-md' // Active state: Xanh dương, chữ trắng
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white' // Inactive: Chữ xám nhạt, hover nền xám đậm
                }`}
              >
                <item.icon className={`mr-3 text-xl ${
                  pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`} />
                <span className="text-sm">{item.text}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User/Logout Section */}
        <div className="border-t border-slate-700 p-4">
          {/* Box thông tin user */}
          <div className="flex items-center w-full p-3 rounded-lg bg-slate-800">
            <img 
              className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-sm"
              src={`https://ui-avatars.com/api/?name=${userEmail.charAt(0)}&background=3B82F6&color=FFFFFF`}
              alt="User Avatar"
            />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userEmail}
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          
          {/* Nút Logout */}
          <button
            onClick={handleLogoutClick} // Mở modal
            className="flex items-center w-full px-4 py-3 mt-2 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <FiLogOut className="mr-3 text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Modal Đăng xuất (thay thế window.confirm) */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Sidebar;