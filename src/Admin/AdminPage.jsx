// AdminPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreHorizontal,
  FiChevronDown, FiLogOut, FiSettings, FiLock, FiUnlock, FiLoader
} from 'react-icons/fi';
import { CgData } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom';
import AddUserModal from '../Components/AddUserModal';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ToastContainer } from '../Components/Toast';

const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';

// --- Sub-Components ---

const StatusBadge = ({ status, isLocked }) => {
  const baseClasses = "px-3 py-1 text-sm rounded-full font-semibold";
  
  // Nếu bị khóa, hiển thị là Banned
  if (isLocked) {
    return <span className={`${baseClasses} bg-red-200 text-red-800`}>Banned</span>;
  }
  
  const statusClasses = {
    Active: 'bg-green-100 text-green-700',
    active: 'bg-green-100 text-green-700',
    Banned: 'bg-red-200 text-red-800',
    banned: 'bg-red-200 text-red-800',
    Inactive: 'bg-gray-100 text-gray-700',
    inactive: 'bg-gray-100 text-gray-700',
    Pending: 'bg-blue-100 text-blue-700',
    pending: 'bg-blue-100 text-blue-700',
    Suspended: 'bg-orange-100 text-orange-700',
    suspended: 'bg-orange-100 text-orange-700',
  };
  
  const displayStatus = status || 'Active';
  return <span className={`${baseClasses} ${statusClasses[displayStatus] || statusClasses.Active}`}>
    {displayStatus}
  </span>;
};

const Sidebar = ({ onLogout }) => {
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
            <button 
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-600 cursor-pointer"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

const Header = ({ searchTerm, setSearchTerm, onOpenModal, loading }) => {
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
        disabled={loading}
        className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
      >
        <FiPlus className="mr-2" /> Add User
      </button>
    </header>
  );
};

const MonthlyStats = ({ users }) => {
  const monthlyData = useMemo(() => {
    const stats = {};
    users.forEach(user => {
      if (user.joined_date) {
        const date = new Date(user.joined_date);
        const month = date.toLocaleString('en-us', { month: 'long' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
        stats[key] = (stats[key] || 0) + 1;
      }
    });
    return stats;
  }, [users]);

  if (Object.keys(monthlyData).length === 0) {
    return null;
  }

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly User Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(monthlyData).map(([month, count]) => (
          <div key={month} className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">{month}</p>
            <p className="text-2xl font-bold text-blue-700">{count}</p>
            <p className="text-sm text-gray-500">new users</p>
          </div>
        ))}
      </div>
    </div>
  );
};


const UserTable = ({ users, searchTerm, onEdit, onDelete, onToggleLock, loading, currentUserId, actionLoading }) => {
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="px-6 py-12 text-center">
        <FiLoader className="inline-block animate-spin text-gray-500 text-2xl mb-2" />
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-500">Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className='text-left text-gray-500'>
            <th className="p-4">Email <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Full Name</th>
            <th className="p-4">Status <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Role <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Joined Date <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => {
            const isActionLoading = actionLoading[user.id];
            const isCurrentUser = user.id === currentUserId;
            const isAdmin = user.role?.toLowerCase() === 'admin';
            
            return (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{user.email}</td>
                <td className="p-4 text-gray-600">{user.full_name || 'N/A'}</td>
                <td className="p-4"><StatusBadge status={user.status} isLocked={user.isLocked} /></td>
                <td className="p-4 text-gray-600">{user.role || 'user'}</td>
                <td className="p-4 text-gray-600">
                  {user.joined_date 
                    ? new Date(user.joined_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit(user)} 
                      className="text-gray-500 hover:text-blue-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                      title="Edit"
                      disabled={isActionLoading}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button 
                      onClick={() => onToggleLock(user)} 
                      className={`p-1 ${user.isLocked ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={user.isLocked ? 'Unlock' : 'Lock'}
                      disabled={isCurrentUser || isActionLoading}
                    >
                      {isActionLoading ? (
                        <FiLoader className="animate-spin" size={18} />
                      ) : user.isLocked ? (
                        <FiUnlock size={18} />
                      ) : (
                        <FiLock size={18} />
                      )}
                    </button>
                    <button 
                      onClick={() => onDelete(user)} 
                      className="text-gray-500 hover:text-red-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                      disabled={isCurrentUser || isAdmin || isActionLoading}
                    >
                      {isActionLoading ? (
                        <FiLoader className="animate-spin" size={18} />
                      ) : (
                        <FiTrash2 size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


// --- Main Component: AdminPage ---

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  // Lấy token và userId từ localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || localStorage.getItem('id');

  // Toast helper functions
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch users từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${linkBackend}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Xử lý dữ liệu từ API - đảm bảo có đầy đủ các trường
      const usersData = (response.data || []).map(user => ({
        ...user,
        // Đảm bảo có đầy đủ các trường cần thiết
        id: user.id,
        email: user.email,
        full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'user',
        status: user.status || (user.isLocked ? 'Banned' : 'Active'),
        joined_date: user.joined_date || user.created_at,
        created_at: user.created_at,
        isLocked: user.isLocked || false,
      }));
      
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Không thể tải danh sách người dùng';
      setError(errorMessage);
      if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập');
        showToast('Bạn không có quyền truy cập trang này', 'error');
      } else if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUserId(userId);
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };
  
  const handleDeleteUser = async (userToDelete) => {
    // Prevent deleting current user or admin
    if (userToDelete.id === currentUserId) {
      showToast('Bạn không thể xóa chính mình', 'error');
      return;
    }

    if (userToDelete.role?.toLowerCase() === 'admin') {
      showToast('Bạn không thể xóa người dùng có vai trò Admin', 'error');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng: ${userToDelete.email}?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [userToDelete.id]: true }));
      
      await axios.delete(`${linkBackend}/api/admin/users/${userToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh danh sách
      await fetchUsers();
      showToast(`Đã xóa người dùng ${userToDelete.email} thành công`, 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Không thể xóa người dùng';
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userToDelete.id];
        return newState;
      });
    }
  };

  const handleToggleLock = async (user) => {
    // Prevent locking current user
    if (user.id === currentUserId) {
      showToast('Bạn không thể khóa/mở khóa chính mình', 'error');
      return;
    }

    const action = user.isLocked ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} người dùng: ${user.email}?`)) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [user.id]: true }));
      
      await axios.patch(
        `${linkBackend}/api/admin/users/${user.id}/lock`,
        { isLocked: !user.isLocked },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh danh sách
      await fetchUsers();
      showToast(`Đã ${action} người dùng ${user.email} thành công`, 'success');
    } catch (err) {
      console.error('Error toggling lock:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || `Không thể ${action} người dùng`;
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[user.id];
        return newState;
      });
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      setModalLoading(true);
      
      if (editingUser) {
        // Update user
        const updateData = {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
        };
        
        if (userData.password && userData.password.trim()) {
          updateData.password = userData.password;
        }

        await axios.put(
          `${linkBackend}/api/admin/users/${editingUser.id}`,
          updateData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        showToast(`Đã cập nhật người dùng ${editingUser.email} thành công`, 'success');
      } else {
        // Create user
        await axios.post(
          `${linkBackend}/api/admin/users`,
          {
            email: userData.email,
            password: userData.password,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        showToast(`Đã tạo người dùng ${userData.email} thành công`, 'success');
      }
      
      // Refresh danh sách
      await fetchUsers();
      setModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Không thể lưu người dùng';
      showToast(errorMessage, 'error');
      throw err; // Re-throw để modal có thể xử lý
    } finally {
      setModalLoading(false);
    }
  };

  // Hàm xử lý logout
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // Xóa tất cả thông tin đăng nhập khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('email');
      localStorage.removeItem('username');
      localStorage.removeItem('id');
      localStorage.removeItem('role');
      
      // Chuyển hướng về trang login
      navigate('/login');
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen font-sans">
      <Sidebar onLogout={handleLogout} />
      <main className="ml-64 flex-1 flex flex-col">
        <div className="m-6 bg-white rounded-lg shadow">
          <Header 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            onOpenModal={handleOpenAddModal}
            loading={loading}
          />
          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}
          <MonthlyStats users={users} />
          <UserTable 
            searchTerm={searchTerm} 
            users={users} 
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteUser}
            onToggleLock={handleToggleLock}
            loading={loading}
            currentUserId={currentUserId}
            actionLoading={actionLoading}
          />
        </div>
        
        <AnimatePresence>
          {modalOpen && (
            <AddUserModal
              onClose={() => {
                if (!modalLoading) {
                  setModalOpen(false);
                  setEditingUser(null);
                }
              }}
              onSubmit={handleSaveUser}
              initialData={editingUser}
              loading={modalLoading}
            />
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    </div>
  );
};

export default AdminPage;
