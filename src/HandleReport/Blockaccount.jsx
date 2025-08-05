import React, { useState, useMemo } from 'react';
import { FiSearch, FiMoreHorizontal } from 'react-icons/fi';

// Dữ liệu mẫu mới cho các tài khoản, chỉ một vài tài khoản bị 'Banned'
const initialUsers = [
  { email: 'tramy@gmail.com', status: 'Banned', role: 'User', bandDate: 'August 5, 2024' },
  { email: 'tranthib@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'admin@gmail.com', status: 'Active', role: 'Admin', bandDate: null },
  { email: 'handlerreport@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'lehuuc@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'hai@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'nguyenvanc@example.com', status: 'Banned', role: 'User', bandDate: 'April 10, 2024' },
  { email: 'nguyenvand@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'nguyennguyen@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'taki1@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'nguyenvana@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'phunggaming@gmail.com', status: 'Banned', role: 'User', bandDate: 'October 3, 2023' },
  { email: 'taki@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'haiga@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'haiphong@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'haigagaming1123@gmail.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'phuongthao.design@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'minhanh.photo@example.com', status: 'Banned', role: 'User', bandDate: 'May 2, 2023' },
  { email: 'giabao.dev@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'trinhA@gmail.com', status: 'Active', role: 'User', bandDate: null },
];

const BlockAccountTable = () => {
  const [users, setUsers] = useState(initialUsers);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Hàm xử lý unban một người dùng
  const handleUnban = (email) => {
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        return { ...user, status: 'Active', bandDate: null };
      }
      return user;
    });
    setUsers(updatedUsers);
    setActiveMenu(null);
  };

  // Hàm xử lý ban một người dùng
  const handleBan = (email) => {
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        // Sử dụng ngày hiện tại khi ban tài khoản
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);
        return { ...user, status: 'Banned', bandDate: formattedDate };
      }
      return user;
    });
    setUsers(updatedUsers);
    setActiveMenu(null);
  };

  // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Kiểm tra xem tất cả người dùng hiển thị có được chọn không
  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every(user => selectedEmails.has(user.email));

  // Hàm xử lý khi click vào checkbox "chọn tất cả"
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedEmails(new Set());
    } else {
      // Ngược lại, chọn tất cả người dùng đang hiển thị
      const allEmails = new Set(filteredUsers.map(user => user.email));
      setSelectedEmails(allEmails);
    }
  };

  // Hàm xử lý khi click vào checkbox của từng hàng
  const handleSelectOne = (email) => {
    const newSelectedEmails = new Set(selectedEmails);
    if (newSelectedEmails.has(email)) {
      newSelectedEmails.delete(email);
    } else {
      newSelectedEmails.add(email);
    }
    setSelectedEmails(newSelectedEmails);
  };

  // Hàm xử lý hiển thị/ẩn menu hành động
  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead className="text-gray-600 text-left bg-gray-50">
            <tr>
              <th className="p-4 font-medium">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Band Date</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedEmails.has(user.email)}
                    onChange={() => handleSelectOne(user.email)}
                  />
                </td>
                <td className="p-4 font-medium text-gray-900">{user.email}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${user.status === 'Banned' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{user.role}</td>
                <td className="p-4 text-gray-600">{user.bandDate || 'N/A'}</td>
                <td className="p-4 relative">
                  <button
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => toggleMenu(index)}
                  >
                    <FiMoreHorizontal size={20} />
                  </button>
                  {activeMenu === index && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {user.status === 'Banned' ? (
                          <button
                            onClick={() => handleUnban(user.email)}
                            className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
                          >
                            Unban User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user.email)}
                            className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 text-red-600"
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

// Component chính của trang Blockaccount
const Blockaccount = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <BlockAccountTable />
    </div>
  );
};

export default Blockaccount;