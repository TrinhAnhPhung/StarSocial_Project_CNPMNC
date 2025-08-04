import React from 'react';
import { Link } from 'react-router-dom';

const Modal = ({ isOpen, onClose, title, data = [], loading }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose} // Đóng modal khi nhấn vào nền mờ
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4"
        onClick={e => e.stopPropagation()} // Ngăn việc đóng modal khi nhấn vào nội dung bên trong
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Đang tải...</p>
          ) : (
            data.length > 0 ? (
              <ul className="space-y-3">
                {data.map(user => (
                  <li key={user.id} className="flex items-center justify-between">
                    <Link to={`/profile/${user.username}`} onClick={onClose} className="flex items-center gap-3">
                      <img src={user.profile_picture_url || 'https://via.placeholder.com/150'} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-bold">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.full_name}</p>
                      </div>
                    </Link>
                    <button className="bg-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-lg hover:bg-blue-600">
                      Follow
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">Không có dữ liệu.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;