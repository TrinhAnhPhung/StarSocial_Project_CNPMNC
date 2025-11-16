import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

// THAY ĐỔI: Thêm `isDark` vào props
const AddUserModal = ({ onClose, onSubmit, initialData, loading = false, isDark = false }) => {
  const isEditMode = Boolean(initialData);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && initialData) {
      setEmail(initialData.email || '');
      setRole(initialData.role || 'user');
      setPassword(''); 
      
      if (initialData.full_name) {
        const nameParts = initialData.full_name.trim().split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      } else {
        setFirstName(initialData.first_name || '');
        setLastName(initialData.last_name || '');
      }
    } else {
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('user');
    }
    setErrors({});
    setShowPassword(false);
  }, [initialData, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!firstName.trim()) {
      newErrors.firstName = 'Họ không được để trống';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Tên không được để trống';
    }

    if (!isEditMode && !password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống khi tạo người dùng mới';
    } else if (!isEditMode && password.trim().length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({ 
        email: email.trim(), 
        password: password.trim(), 
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role 
      });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: "-50vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { delay: 0.2, type: 'spring', stiffness: 120 } },
    exit: { y: "50vh", opacity: 0 }
  };

  // THAY ĐỔI: Áp dụng đúng backdrop đã thống nhất
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.30)] backdrop-blur-[1px] flex justify-center items-center"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        // THAY ĐỔI: Đồng bộ Dark/Light theme
        className={`relative rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto ${
          isDark 
            ? 'bg-slate-900 border border-slate-700' 
            : 'bg-white'
        }`}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-6 text-center ${
          isDark ? 'text-slate-100' : 'text-gray-800'
        }`}>
          {isEditMode ? '📝 Chỉnh sửa người dùng' : '✨ Thêm người dùng mới'}
        </h2>

        <div className="space-y-4">
          {/* First Name và Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Họ</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors({ ...errors, firstName: '' });
                }}
                placeholder="Nguyễn"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                    : 'border-gray-300'
                } ${errors.firstName ? 'border-red-500' : (isDark ? 'border-slate-700' : 'border-gray-300')}`}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Tên</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors({ ...errors, lastName: '' });
                }}
                placeholder="Văn A"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                    : 'border-gray-300'
                } ${errors.lastName ? 'border-red-500' : (isDark ? 'border-slate-700' : 'border-gray-300')}`}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="johndoe@mail.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isEditMode 
                  ? (isDark ? 'bg-slate-700 cursor-not-allowed' : 'bg-gray-200 cursor-not-allowed') 
                  : (isDark ? 'bg-slate-800' : '')
              } ${errors.email ? 'border-red-500' : (isDark ? 'border-slate-700' : 'border-gray-300')} ${
                isDark ? 'text-slate-100 placeholder-slate-400' : ''
              }`}
              readOnly={isEditMode}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Vai trò</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-100' 
                  : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="handlereport">Handle Report</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Mật khẩu 
              {isEditMode && <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}> (Để trống nếu không muốn đổi)</span>}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder={isEditMode ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu (ít nhất 6 ký tự)'}
              className={`w-full px-4 py-2 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                  : 'border-gray-300'
              } ${errors.password ? 'border-red-500' : (isDark ? 'border-slate-700' : 'border-gray-300')}`}
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className={`absolute top-8 right-3 ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={loading}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button 
            onClick={onClose} 
            className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'text-slate-300 bg-slate-700 hover:bg-slate-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            onClick={handleSave} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            {loading && <FiLoader className="animate-spin" />}
            {isEditMode ? 'Lưu thay đổi' : 'Thêm người dùng'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddUserModal;