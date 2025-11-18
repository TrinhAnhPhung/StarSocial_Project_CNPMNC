import React, { useState, useMemo, useEffect } from 'react';
import {
  FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreHorizontal,
  FiChevronDown, FiLogOut, FiSettings, FiLock, FiUnlock, FiLoader, FiAlertTriangle
} from 'react-icons/fi';
import { CgData } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom';
import AddUserModal from '../Components/AddUserModal';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ToastContainer } from '../Components/Toast';

const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';

// --- Sub-Components (Dark Theme) ---

const StatusBadge = ({ status, isLocked }) => {
  const baseClasses = "px-3 py-1 text-xs rounded-full font-bold";

  if (isLocked) {
    return <span className={`${baseClasses} bg-red-900/50 text-red-300`}>Banned</span>;
  }

  const statusClasses = {
    Active: 'bg-green-900/50 text-green-300',
    active: 'bg-green-900/50 text-green-300',
    Banned: 'bg-red-900/50 text-red-300',
    banned: 'bg-red-900/50 text-red-300',
    Inactive: 'bg-slate-700 text-slate-300',
    inactive: 'bg-slate-700 text-slate-300',
    Pending: 'bg-blue-900/50 text-blue-300',
    pending: 'bg-blue-900/50 text-blue-300',
    Suspended: 'bg-orange-900/50 text-orange-300',
    suspended: 'bg-orange-900/50 text-orange-300',
  };

  const displayStatus = status || 'Active';
  return <span className={`${baseClasses} ${statusClasses[displayStatus] || statusClasses.Active}`}>
    {displayStatus}
  </span>;
};

/**
 * THAY ĐỔI: Sidebar phiên bản Dark Theme (Đã đồng bộ)
 */
const Sidebar = ({ onLogoutClick, userEmail }) => {
  return (
    <aside className="w-64 bg-slate-900 fixed top-0 left-0 bottom-0 border-r border-slate-700 shadow z-50 flex flex-col justify-between">
      <div>
        <div className="h-20 flex items-center px-6 border-b border-slate-700">
          <Link to="/admin" className="flex items-center pl-3 group mr-3">
            <img src="/src/assets/Logo.png" alt="Logo" className="w-10 h-10 object-contain hover:scale-105 transition-all" />
          </Link>
          <h1 className="text-xl font-bold text-white">Hello <span className="text-blue-400">Admin</span></h1>
        </div>
        <nav className="px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <CgData className="mr-3 text-xl" />
            Decentralization
          </a>
        </nav>
      </div>

      {/* THAY ĐỔI: User Info và Logout (Dark Theme) */}
      <div className="border-t border-slate-700 p-4">
        {/* Box thông tin user */}
        <div className="flex items-center w-full p-3 rounded-lg bg-slate-800">
          <img 
            className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-sm"
            src={`https://ui-avatars.com/api/?name=${userEmail ? userEmail.charAt(0) : 'A'}&background=3B82F6&color=FFFFFF`}
            alt="User Avatar"
          />
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userEmail || 'admin@email.com'}
            </p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>

        {/* Nút Logout */}
        <button
          onClick={onLogoutClick}
          className="flex items-center w-full px-4 py-3 mt-2 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <FiLogOut className="mr-3 text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
};

const Header = ({ searchTerm, setSearchTerm, onOpenModal, loading }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700 w-full">
      <div className="relative w-full mr-4">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-400"
        />
      </div>
      <button
        onClick={onOpenModal}
        disabled={loading}
        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50"
      >
        <FiPlus className="mr-2" /> Add User
      </button>
    </header>
  );
};

const MonthlyStats = ({ users }) => {
  const [isOpen, setIsOpen] = useState(false); 

  const monthlyData = useMemo(() => {
    const stats = {};
    users.forEach(user => {
      if (user.joined_date) {
        const date = new Date(user.joined_date);
        // FIX: Bỏ qua ngày không hợp lệ
        if (isNaN(date.getTime())) return; 
        
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
    <div className="p-6 border-b border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full"
      >
        <h3 className="text-xl font-bold text-slate-100">Monthly User Statistics</h3>
        <FiChevronDown 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in mt-4">
          {Object.entries(monthlyData).map(([month, count]) => (
            <div key={month} className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-slate-400">{month}</p>
              <p className="text-2xl font-bold text-blue-400">{count}</p>
              <p className="text-sm text-slate-400">new users</p>
            </div>
          ))}
        </div>
      )}
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
        <FiLoader className="inline-block animate-spin text-slate-400 text-2xl mb-2" />
        <p className="text-slate-400">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-slate-400">Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 overflow-x-auto">
      <table className="min-w-full bg-slate-900">
        <thead>
          <tr className='text-left text-slate-400 text-xs uppercase'>
            <th className="p-4">Email <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Full Name</th>
            <th className="p-4">Status <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Role <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4">Joined Date <FiChevronDown className="inline ml-1" /></th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {filteredUsers.map((user) => {
            const isActionLoading = actionLoading[user.id];
            const isCurrentUser = user.id === currentUserId;
            const isAdmin = user.role?.toLowerCase() === 'admin';

            return (
              <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-800/60">
                <td className="p-4 font-medium text-slate-100">{user.email}</td>
                <td className="p-4 text-slate-300">{user.full_name || 'N/A'}</td>
                <td className="p-4"><StatusBadge status={user.status} isLocked={user.isLocked} /></td>
                <td className="p-4 text-slate-300">{user.role || 'user'}</td>
                <td className="p-4 text-slate-300">
                  {/* SỬA CHỮA: Xử lý ngày tháng */}
                  {(() => {
                    if (!user.joined_date) return 'N/A';
                    const date = new Date(user.joined_date);
                    // Kiểm tra nếu là ngày không hợp lệ
                    if (isNaN(date.getTime())) return 'Invalid Date'; 

                    return date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  })()}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit(user)} 
                      className="text-slate-400 hover:text-blue-400 p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                      title="Edit"
                      disabled={isActionLoading}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button 
                      onClick={() => onToggleLock(user)} 
                      className={`p-1 ${user.isLocked ? 'text-green-400 hover:text-green-300' : 'text-orange-400 hover:text-orange-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
                      className="text-slate-400 hover:text-red-400 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

const ConfirmModal = ({ isOpen, onClose, onConfirm, loading, title, message, confirmText, icon, confirmColor }) => {
  if (!isOpen) return null;

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  const iconBgClasses = {
    red: 'bg-red-900/50',
    orange: 'bg-orange-900/50',
    blue: 'bg-blue-900/50', // Thêm màu xanh cho Unlock
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] z-[99] flex justify-center items-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClasses[confirmColor]} sm:mx-0`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 bg-slate-800 p-4 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white ${colorClasses[confirmColor]} rounded-lg disabled:opacity-50`}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] z-[99] flex justify-center items-center p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50`}>
              <FiLogOut className='h-6 w-6 text-red-300'/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Xác nhận Đăng xuất</h3>
              <p className="mt-2 text-sm text-slate-400">
                Bạn có chắc chắn muốn đăng xuất không?
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 bg-slate-800 p-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};


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

  const [userToActOn, setUserToActOn] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || localStorage.getItem('id');

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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

      const usersData = (response.data || []).map(user => ({
        ...user,
        id: user.id,
        email: user.email,
        full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'user',
        status: user.status || (user.isLocked ? 'Banned' : 'Active'),
        // SỬA: Đảm bảo có giá trị ngày tháng, nếu không có thì là null
        joined_date: user.joined_date || user.created_at || null, 
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

  const handleDeleteUser = (userToDelete) => {
    if (userToDelete.id === currentUserId) {
      showToast('Bạn không thể xóa chính mình', 'error');
      return;
    }
    if (userToDelete.role?.toLowerCase() === 'admin') {
      showToast('Bạn không thể xóa người dùng có vai trò Admin', 'error');
      return;
    }
    setUserToActOn(userToDelete);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToActOn) return;

    try {
      setActionLoading((prev) => ({ ...prev, [userToActOn.id]: true }));

      await axios.delete(`${linkBackend}/api/admin/users/${userToActOn.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await fetchUsers();
      showToast(`Đã xóa người dùng ${userToActOn.email} thành công`, 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Không thể xóa người dùng';
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userToActOn.id];
        return newState;
      });
      setIsDeleteModalOpen(false);
      setUserToActOn(null);
    }
  };

  const handleToggleLock = (user) => {
    if (user.id === currentUserId) {
      showToast('Bạn không thể khóa/mở khóa chính mình', 'error');
      return;
    }
    setUserToActOn(user);
    setIsLockModalOpen(true);
  };

  const confirmToggleLock = async () => {
    if (!userToActOn) return;
    const action = userToActOn.isLocked ? 'mở khóa' : 'khóa';

    try {
      setActionLoading((prev) => ({ ...prev, [userToActOn.id]: true }));

      await axios.patch(
        `${linkBackend}/api/admin/users/${userToActOn.id}/lock`,
        { isLocked: !userToActOn.isLocked },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await fetchUsers();
      showToast(`Đã ${action} người dùng ${userToActOn.email} thành công`, 'success');
    } catch (err) {
      console.error('Error toggling lock:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || `Không thể ${action} người dùng`;
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userToActOn.id];
        return newState;
      });
      setIsLockModalOpen(false);
      setUserToActOn(null);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      setModalLoading(true);

      if (editingUser) {
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

      await fetchUsers();
      setModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Không thể lưu người dùng';
      showToast(errorMessage, 'error');
      throw err; 
    } finally {
      setModalLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('role');

    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  return (
    <div className="flex bg-slate-800 min-h-screen font-sans">
      <Sidebar onLogoutClick={handleLogout} userEmail={user.email} />
      <main className="ml-64 flex-1 flex flex-col">
        <div className="m-6 bg-slate-900 rounded-lg shadow border border-slate-700">
          <Header 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            onOpenModal={handleOpenAddModal}
            loading={loading}
          />
          {error && (
            <div className="px-6 py-4 bg-red-900/50 border-l-4 border-red-400 text-red-300">
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
              isDark={true}
            />
          )}

          {isDeleteModalOpen && (
            <ConfirmModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={confirmDeleteUser}
              loading={actionLoading[userToActOn?.id]}
              title="Xóa người dùng"
              message={`Bạn có chắc muốn xóa ${userToActOn?.email}? Hành động này không thể hoàn tác.`}
              confirmText="Xác nhận Xóa"
              confirmColor="red"
              icon={<FiAlertTriangle className="h-6 w-6 text-red-300" />}
            />
          )}

          {isLockModalOpen && (
            <ConfirmModal
              isOpen={isLockModalOpen}
              onClose={() => setIsLockModalOpen(false)}
              onConfirm={confirmToggleLock}
              loading={actionLoading[userToActOn?.id]}
              title={userToActOn?.isLocked ? "Mở khóa người dùng" : "Khóa người dùng"}
              message={`Bạn có chắc muốn ${userToActOn?.isLocked ? 'mở khóa' : 'khóa'} ${userToActOn?.email}?`}
              confirmText={userToActOn?.isLocked ? "Mở khóa" : "Khóa"}
              confirmColor={userToActOn?.isLocked ? "blue" : "orange"}
              icon={userToActOn?.isLocked ? <FiUnlock className='h-6 w-6 text-blue-300' /> : <FiLock className='h-6 w-6 text-orange-300' />}
            />
          )}

          {isLogoutModalOpen && (
            <LogoutConfirmModal
              isOpen={isLogoutModalOpen}
              onClose={() => setIsLogoutModalOpen(false)}
              onConfirm={confirmLogout}
            />
          )}

        </AnimatePresence>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    </div>
  );
};

export default AdminPage;