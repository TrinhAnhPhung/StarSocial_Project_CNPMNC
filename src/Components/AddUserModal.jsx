import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AddUserModal = ({ onClose, onSubmit, initialData }) => {
  const isEditMode = Boolean(initialData);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('User');
  const [status, setStatus] = useState('Active');

  // SỬA LỖI TẠI ĐÂY: Thêm khối 'else' để reset form
  useEffect(() => {
    if (isEditMode) {
      // Chế độ Sửa: điền dữ liệu có sẵn
      setEmail(initialData.email);
      setRole(initialData.role);
      setStatus(initialData.status);
      setPassword(''); // Mật khẩu luôn trống khi sửa
    } else {
      // Chế độ Thêm: reset tất cả các trường về mặc định
      setEmail('');
      setPassword('');
      setRole('User');
      setStatus('Active');
    }
  }, [initialData, isEditMode]);

  const handleSave = () => {
    if (!email) {
      alert('Email cannot be empty.');
      return;
    }
    if (!isEditMode && !password) {
        alert('Password cannot be empty for a new user.');
        return;
    }
    
    onSubmit({ email, role, status, password });
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
        className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isEditMode ? '📝 Edit User' : '✨ Add New User'}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Handle Report">Handle Report</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Active">Active</option>
            <option value="Banned">Banned</option>
          </select>
        </div>

        <div className="mb-4">
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

        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password 
            {isEditMode && <span className="text-xs text-gray-500"> (Leave blank to keep current password)</span>}
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-8 right-3 text-gray-500 hover:text-gray-700">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button onClick={onClose} className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {isEditMode ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddUserModal;