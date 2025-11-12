import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { BiBlock } from 'react-icons/bi';
import { BsTextParagraph } from 'react-icons/bs';
import { FiSettings, FiLogOut } from 'react-icons/fi';

const navItems = [
  { href: '/processor', icon: HiOutlineDocumentReport, text: 'Violating Posts' },
  { href: '/blockaccount', icon: BiBlock, text: 'Blocked Accounts' },
  { href: '/keyword-statistics', icon: BsTextParagraph, text: 'Sensitive Keywords' },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('email') || 'admin@example.com';

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    // Sidebar: a slightly deeper, pleasant pastel blue-purple gradient
    <aside className="w-64 bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100 text-gray-800 fixed top-0 left-0 bottom-0 shadow-lg flex flex-col z-50">
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Logo/Header */}
        <div className="h-20 flex items-center px-6 border-b border-purple-200"> {/* Pastel border */}
          <FaStar className="text-yellow-500 text-3xl mr-3" />
          <h1 className="text-xl font-bold text-gray-800 leading-tight">
            Report Center
          </h1>
        </div>

        {/* Nav Menu */}
        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.text}
              to={item.href}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-green-100 text-green-700 font-semibold shadow-sm' // Active state: light green pastel
                  : 'text-gray-700 hover:bg-purple-50 hover:text-blue-600' // Inactive: hover to very light purple/blue
              }`}
            >
              <item.icon className="mr-3 text-xl" />
              <span className="text-sm">{item.text}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User/Logout Section */}
      <div className="border-t border-purple-200 p-4"> {/* Pastel border */}
        <div className="flex items-center w-full p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"> {/* Pastel background */}
          <img 
            className="h-10 w-10 rounded-full object-cover border-2 border-purple-200 shadow-sm" // Pastel border
            src={`https://ui-avatars.com/api/?name=${userEmail}&background=C7EDEB&color=2D2F46`}
            alt="User Avatar"
          />
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {userEmail}
            </p>
            <p className="text-xs text-gray-600">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 mt-2 rounded-lg text-sm text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors"
        >
          <FiLogOut className="mr-3 text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;