import React, { useState, useMemo } from 'react';
import { FiSearch, FiMoreHorizontal } from 'react-icons/fi';

const initialUsers = [
  { email: 'john.doe@example.com', status: 'Banned', role: 'User', bandDate: 'August 5, 2024' },
  { email: 'jane.smith@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'admin@example.com', status: 'Active', role: 'Admin', bandDate: null },
  { email: 'report.handler@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'lehuuc@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'hai@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'nguyenvanc@example.com', status: 'Banned', role: 'User', bandDate: 'April 10, 2024' },
  { email: 'david.lee@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'sarah.jones@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'mark.taylor@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'lisa.wong@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'phung.gaming@example.com', status: 'Banned', role: 'User', bandDate: 'October 3, 2023' },
  { email: 'taki@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'haiga@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'haiphong@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'gaming1123@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'phuongthao.design@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'minhanh.photo@example.com', status: 'Banned', role: 'User', bandDate: 'May 2, 2023' },
  { email: 'giabao.dev@example.com', status: 'Active', role: 'User', bandDate: null },
  { email: 'trinhA@example.com', status: 'Active', role: 'User', bandDate: null },
];

const BlockAccountTable = () => {
  const [users, setUsers] = useState(initialUsers);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleUnban = (email) => {
    const updatedUsers = users.map(user => 
      user.email === email ? { ...user, status: 'Active', bandDate: null } : user
    );
    setUsers(updatedUsers);
    setActiveMenu(null);
  };

  const handleBan = (email) => {
    const updatedUsers = users.map(user => {
      if (user.email === email) {
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

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every(user => selectedEmails.has(user.email));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmails(new Set());
    } else {
      const allEmails = new Set(filteredUsers.map(user => user.email));
      setSelectedEmails(allEmails);
    }
  };

  const handleSelectOne = (email) => {
    const newSelectedEmails = new Set(selectedEmails);
    if (newSelectedEmails.has(email)) {
      newSelectedEmails.delete(email);
    } else {
      newSelectedEmails.add(email);
    }
    setSelectedEmails(newSelectedEmails);
  };

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  return (
    // Card background changed to a very light blue pastel, slightly transparent
    <div className="bg-blue-100/50 rounded-xl shadow-sm overflow-hidden border border-blue-100">
      {/* Search bar styling */}
      <div className="p-5 border-b border-blue-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 text-sm transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent text-sm"> {/* Table background also transparent */}
          <thead className="bg-blue-50"> {/* Table header a slightly darker pastel */}
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Banned Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-blue-100"> {/* Lighter divider */}
            {filteredUsers.map((user, index) => (
              <tr key={user.email} className="hover:bg-blue-100 transition-colors duration-150"> {/* Light blue hover */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                    checked={selectedEmails.has(user.email)}
                    onChange={() => handleSelectOne(user.email)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    user.status === 'Banned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700' // Lighter pastel reds and greens
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.bandDate || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right relative">
                  <button
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                    onClick={() => toggleMenu(index)}
                  >
                    <FiMoreHorizontal size={20} />
                  </button>
                  {activeMenu === index && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10 animate-fade-in"> {/* White background for dropdown, still provides contrast */}
                      <div className="py-1">
                        {user.status === 'Banned' ? (
                          <button
                            onClick={() => handleUnban(user.email)}
                            className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-green-50 hover:text-green-700 transition-colors"
                          >
                            Unban User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user.email)}
                            className="block px-4 py-2 text-sm text-red-600 w-full text-left hover:bg-red-50 transition-colors"
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
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Manage Accounts</h1>
      <BlockAccountTable />
    </div>
  );
};

export default Blockaccount;