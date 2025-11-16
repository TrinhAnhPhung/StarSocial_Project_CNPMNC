// src/HandleReport/Blockaccount.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiMoreHorizontal } from 'react-icons/fi';

const getToken = () => localStorage.getItem('token');

const API_URL = 'http://localhost:5000/api/handle'; 


const BlockAccountTable = () => {
  // State (không thay đổi)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data (không thay đổi)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = getToken(); 
        if (!token) {
          throw new Error('Chưa đăng nhập hoặc không có token.');
        }

        const response = await fetch(`${API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Không thể tải danh sách người dùng. Bạn có quyền truy cập không?');
        }

        const data = await response.json();
        setUsers(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // API Handlers (không thay đổi)
  const handleUnban = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/unban-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }), 
      });

      if (!response.ok) {
        throw new Error('Mở khóa thất bại');
      }

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.User_id === userId ? { ...user, isLocked: 0 } : user
        )
      );
      setActiveMenu(null);
    } catch (err) {
      alert(`Lỗi: ${err.message}`); // Cân nhắc đổi alert sang modal/toast
    }
  };

  const handleBan = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/ban-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Khóa thất bại');
      }

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.User_id === userId ? { ...user, isLocked: 1 } : user
        )
      );
      setActiveMenu(null);
    } catch (err) {
      alert(`Lỗi: ${err.message}`); // Cân nhắc đổi alert sang modal/toast
    }
  };

  // Logic (không thay đổi)
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const toggleMenu = (userId) => {
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  // THIẾT KẾ MỚI: Loading/Error cho Dark Theme
  if (loading) {
    return <div className="p-5 text-center text-slate-300">Đang tải danh sách người dùng...</div>;
  }

  if (error) {
    return <div className="p-5 text-center text-red-400">Lỗi: {error}</div>;
  }

  return (
    // THIẾT KẾ MỚI: Card nền `slate-900`
    <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      {/* Search bar */}
      <div className="p-5 border-b border-slate-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email..."
            // THIẾT KẾ MỚI: Input `slate-800`
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-100 placeholder-slate-400 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-900 text-sm">
          {/* THIẾT KẾ MỚI: Thead `slate-800` */}
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Banned Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          {/* THIẾT KẾ MỚI: Body `slate-700` */}
          <tbody className="divide-y divide-slate-700">
            {filteredUsers.map((user) => (
              <tr key={user.User_id} className="hover:bg-slate-800/60 transition-colors duration-150">
                
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-100">{user.Email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* THIẾT KẾ MỚI: Pill (viên thuốc) cho Dark Theme */}
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    user.isLocked 
                      ? 'bg-red-900/50 text-red-300' 
                      : 'bg-green-900/50 text-green-300'
                  }`}>
                    {user.isLocked ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{user.Role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right relative">
                  <button
                    className="text-slate-400 hover:text-slate-100 p-2 rounded-full hover:bg-slate-700 transition-colors duration-150"
                    onClick={() => toggleMenu(user.User_id)}
                  >
                    <FiMoreHorizontal size={20} />
                  </button>
                  {activeMenu === user.User_id && (
                    // THIẾT KẾ MỚI: Menu dropdown Dark Theme
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-slate-800 shadow-lg ring-1 ring-slate-700 z-10 animate-fade-in border border-slate-700">
                      <div className="py-1">
                        {user.isLocked ? (
                          <button
                            onClick={() => handleUnban(user.User_id)}
                            className="block px-4 py-2 text-sm text-slate-300 w-full text-left hover:bg-green-900/50 hover:text-green-300 transition-colors"
                          >
                            Unban User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user.User_id)}
                            className="block px-4 py-2 text-sm text-red-400 w-full text-left hover:bg-red-900/50 hover:text-red-300 transition-colors"
                          >
                            Ban User
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Blockaccount = () => {
  return (
    // THIẾT KẾ MỚI: Nền `slate-800`
    // SỬA LỖI: Thêm `w-full` để component này lấp đầy chiều rộng
    <div className="p-4 md:p-6 bg-slate-800 min-h-full w-full">
      {/* THIẾT KẾ MỚI: Tiêu đề `slate-100` */}
      <h1 className="text-3xl font-extrabold text-slate-100 mb-6">Manage Accounts</h1>
      <BlockAccountTable />
    </div>
  );
};

export default Blockaccount;