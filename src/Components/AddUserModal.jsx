import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AddUserModal = ({ onClose, onSubmit, initialData }) => {
  const isEditMode = Boolean(initialData);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');

  // SỬA LỖI TẠI ĐÂY: Thêm khối 'else' để reset form
  useEffect(() => {
    if (isEditMode && initialData) {
      // Chế độ Sửa: điền dữ liệu có sẵn
      setEmail(initialData.email || '');
      setRole(initialData.role || 'user');
      setPassword(''); // Mật khẩu luôn trống khi sửa
      
      // Parse full_name thành first_name và last_name
      if (initialData.full_name) {
        const nameParts = initialData.full_name.trim().split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      } else {
        setFirstName(initialData.first_name || '');
        setLastName(initialData.last_name || '');
      }
    } else {
      // Chế độ Thêm: reset tất cả các trường về mặc định
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('user');
    }
  }, [initialData, isEditMode]);

  const handleSave = () => {
    if (!email) {
      alert('Email không được để trống.');
      return;
    }
    if (!firstName || !lastName) {
      alert('Họ và tên không được để trống.');
      return;
    }
    if (!isEditMode && !password) {
      alert('Mật khẩu không được để trống khi tạo người dùng mới.');
      return;
    }
    
    onSubmit({ 
      email, 
      password, 
      first_name: firstName,
      last_name: lastName,
      role 
    });
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

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 backdrop-blur-sm flex justify-center items-center"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isEditMode ? '📝 Chỉnh sửa người dùng' : '✨ Thêm người dùng mới'}
        </h2>

        <div className="space-y-4">
          {/* First Name và Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nguyễn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Văn A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@mail.com"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditMode ? 'bg-gray-200 cursor-not-allowed' : ''}`}
              readOnly={isEditMode}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="handlereport">Handle Report</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu 
              {isEditMode && <span className="text-xs text-gray-500"> (Để trống nếu không muốn đổi)</span>}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditMode ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute top-8 right-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button 
            onClick={onClose} 
            className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditMode ? 'Lưu thay đổi' : 'Thêm người dùng'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddUserModal;
