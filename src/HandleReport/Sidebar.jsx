import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { BiBlock } from 'react-icons/bi';
import { BsTextParagraph } from 'react-icons/bs';
import { FiMoreHorizontal, FiSettings, FiLogOut } from 'react-icons/fi';

const navItems = [
  { href: '/processor', icon: HiOutlineDocumentReport, text: 'Violating posts' },
  { href: '/blockaccount', icon: BiBlock, text: 'Block account' },
  // Sửa dòng này: đổi '/' thành '/keyword-statistics'
  { href: '/keyword-statistics', icon: BsTextParagraph, text: 'Sensitive keyword statistics' },
];

const Sidebar = () => {
  const { pathname } = useLocation(); // Hook để lấy URL hiện tại
  const [showMore, setShowMore] = useState(false);

  return (
    <aside className="w-64 bg-white fixed top-0 left-0 bottom-0 border-r shadow-sm flex flex-col justify-between z-50">
      <div>
        <div className="h-20 flex items-center px-6 border-b">
          <FaStar className="text-blue-500 text-3xl mr-3" />
          <h1 className="text-xl font-bold leading-5">
            Hello <span className="text-blue-600">Report<br />Processor</span>
          </h1>
        </div>
        <nav className="px-4 py-6 space-y-2 text-sm font-medium text-gray-700">
          {navItems.map((item) => (
            <Link
              key={item.text}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-lg ${
                pathname === item.href
                  ? 'bg-blue-500 text-white' // Lớp cho trạng thái active
                  : 'hover:bg-gray-100'     // Lớp cho trạng tháiปกติ
              }`}
            >
              <item.icon className="mr-3 text-xl" />
              {item.text}
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-4 py-4 relative">
        <button onClick={() => setShowMore(!showMore)} className="flex items-center w-full text-left text-gray-700 hover:text-black">
          <FiMoreHorizontal className="mr-3 text-xl" /> More
        </button>
        {showMore && (
          <div className="absolute bottom-16 left-4 bg-white border shadow-lg rounded w-40 z-10">
            <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
              <FiSettings className="mr-2" /> Settings
            </button>
           <Link to="/login" className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-600">
                         <FiLogOut className="mr-2" /> Logout
                       </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;