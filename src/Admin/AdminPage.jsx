import React, { useState } from 'react';
import {
  FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreHorizontal,
  FiChevronDown, FiLogOut, FiSettings
} from 'react-icons/fi';
import { CgData } from "react-icons/cg";
import { Link } from 'react-router-dom';
import AddUserModal from '../Components/AddUserModal';
import { AnimatePresence } from 'framer-motion';

// Dữ liệu người dùng ban đầu
const initialUsers = [
  { email: 'john.smith@gmail.com', status: 'Active', role: 'Admin', joinedDate: 'March 12, 2023', password: 'password123' },
  { email: 'dwarren3@gmail.com', status: 'Banned', role: 'User', joinedDate: 'January 8, 2024', password: 'password123' },
  { email: 'belleclark@gmail.com', status: 'Active', role: 'Handle Report', joinedDate: 'August 30, 2022', password: 'password123' },
  { email: 'lucamich@gmail.com', status: 'Active', role: 'User', joinedDate: 'April 23, 2024', password: 'password123' },
  { email: 'markwill32@gmail.com', status: 'Banned', role: 'User', joinedDate: 'November 14, 2020', password: 'password123' },
  { email: 'noemivill99@gmail.com', status: 'Active', role: 'Admin', joinedDate: 'August 10, 2024', password: 'password123' },
];

// --- Các Component con ---

const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-sm rounded-full font-semibold";
  const statusClasses = {
    Active: 'bg-green-100 text-green-700',
    Banned: 'bg-red-200 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const Sidebar = () => {
  const [showMore, setShowMore] = useState(false);
  return (
    <aside className="w-64 bg-white fixed top-0 left-0 bottom-0 border-r shadow z-50 flex flex-col justify-between">
      <div>
        <div className="h-20 flex items-center px-6 border-b">
          <Link to="/admin" className="flex items-center pl-3 group mr-3">
            <img src="/src/assets/Logo.png" alt="Logo" className="w-10 h-10 object-contain hover:scale-105 transition-all" />
          </Link>
          <h1 className="text-xl font-bold">Hello <span className="text-blue-600">Admin</span></h1>
        </div>
        <nav className="px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <CgData className="mr-3 text-xl" />
            Decentralization
          </a>
        </nav>
      </div>
      <div className="px-4 py-4 relative">
        <button onClick={() => setShowMore(!showMore)} className="flex items-center w-full text-left text-gray-700 hover:text-black cursor-pointer">
          <FiMoreHorizontal className="mr-3 text-xl" />
          More
        </button>
        {showMore && (
          <div className="absolute bottom-16 left-4 bg-white border shadow-lg rounded w-40 z-10">
            <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer">
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

const Header = ({ searchTerm, setSearchTerm, onOpenModal }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b w-full">
      <div className="relative w-full mr-4">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={onOpenModal}
        className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer whitespace-nowrap"
      >
        <FiPlus className="mr-2" /> Add User
      </button>
    </header>
  );
};

const UserTable = ({ users, searchTerm, onEdit, onDelete }) => {
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 py-4">
      <table className="min-w-full bg-white">
        <thead>
          <tr className='text-left text-gray-500'>
            <th className="p-4">Email <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Status <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Role <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Joined Date <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.email} className="border-t hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-800">{user.email}</td>
              <td className="p-4"><StatusBadge status={user.status} /></td>
              <td className="p-4 text-gray-600">{user.role}</td>
              <td className="p-4 text-gray-600">{user.joinedDate}</td>
              <td className="p-4 text-center">
                <button onClick={() => onEdit(user)} className="text-gray-500 hover:text-blue-600 mr-4"><FiEdit size={18} /></button>
                <button onClick={() => onDelete(user.email)} className="text-gray-500 hover:text-red-600"><FiTrash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// --- Component chính: AdminPage ---

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);

  // Mở modal để thêm user mới
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  // Mở modal để sửa user
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };
  
  // Hàm xóa user
  const handleDeleteUser = (emailToDelete) => {
    if (window.confirm(`Are you sure you want to delete user: ${emailToDelete}?`)) {
      setUsers(users.filter(user => user.email !== emailToDelete));
    }
  };

  // Hàm xử lý Thêm và Sửa user
  const handleSaveUser = (userData) => {
    // Logic SỬA
    if (editingUser) {
      setUsers(users.map(user => {
        if (user.email === editingUser.email) {
          // Chỉ cập nhật mật khẩu nếu người dùng nhập mật khẩu mới
          const newPassword = userData.password ? userData.password : user.password;
          return { ...user, ...userData, password: newPassword };
        }
        return user;
      }));
    } else {
      // Logic THÊM
      const newUser = {
        ...userData,
        joinedDate: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setUsers(prevUsers => [newUser, ...prevUsers]);
    }
    // Đóng modal và reset trạng thái
    setModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen font-sans">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col">
        <div className="m-6 bg-white rounded-lg shadow">
          <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} onOpenModal={handleOpenAddModal} />
          <UserTable 
            searchTerm={searchTerm} 
            users={users} 
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteUser}
          />
        </div>
        
        <AnimatePresence>
          {modalOpen && (
            <AddUserModal
              onClose={() => {
                setModalOpen(false);
                setEditingUser(null);
              }}
              onSubmit={handleSaveUser}
              initialData={editingUser}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPage;