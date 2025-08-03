import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Giả sử bạn có component này

const EditProfile = () => {
  // State để lưu thông tin từ API
  const [userProfile, setUserProfile] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State để lưu trữ file ảnh đã chọn và các giá trị đang chỉnh sửa
  const [editedFullName, setEditedFullName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // State cho file ảnh
  const [previewImage, setPreviewImage] = useState(null); // State cho ảnh xem trước

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 1. Fetch dữ liệu người dùng khi component được tải
  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem('email');
      if (!email) {
        setError('Không tìm thấy email người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/profile/info?email=${email}`);
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu hồ sơ.');
        }
        const data = await response.json();
        setUserProfile(data);
        setEditedFullName(data.full_name || '');
        setEditedBio(data.bio || '');
        setPreviewImage(data.profile_picture_url); // Đặt ảnh xem trước ban đầu
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // 2. Xử lý khi người dùng chọn ảnh mới
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file); // Lưu file thật để upload
      setPreviewImage(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước
      setError(null);
    } else {
      setError('Vui lòng chọn một tập tin ảnh hợp lệ.');
    }
  };

  // 3. Xử lý khi nhấn nút "Save"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setError(null);

    const email = localStorage.getItem('email');
    if (!email) {
      setError('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.');
      return;
    }

    // Sử dụng FormData để gửi cả text và file
    const formData = new FormData();
    formData.append('email', email);
    formData.append('full_name', editedFullName);
    formData.append('bio', editedBio);
    if (selectedFile) {
      formData.append('profile_picture', selectedFile); // Tên field phải khớp với backend: 'profile_picture'
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        body: formData, // Không cần set header 'Content-Type', browser sẽ tự động làm
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Cập nhật thất bại.');
      }

      setSuccessMessage('Cập nhật hồ sơ thành công!');
      // Cập nhật lại ảnh preview với URL thật từ server
      setPreviewImage(result.user.profile_picture_url); 
      // Tùy chọn: chuyển hướng về trang profile sau 2 giây
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeItem="profile" /> {/* Giả sử Sidebar có prop này */}
      <div className="flex-1 flex justify-center py-10 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="relative flex justify-center items-center mb-8">
            <Link to="/profile" className="absolute left-0 text-gray-600 hover:text-gray-900">
              <span className="material-icons text-3xl">arrow_back</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa trang cá nhân</h2>
          </div>

          {/* User Info Section */}
          <div className="flex items-center mb-8">
             <img
                src={previewImage || 'https://via.placeholder.com/150'}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-300"
              />
            <div className="flex-grow">
              <p className="text-lg font-semibold text-gray-800">@{userProfile?.username}</p>
              <button
                type="button"
                onClick={handleImageClick}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Thay đổi ảnh đại diện
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Form for editing */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
                Tên đầy đủ
              </label>
              <input
                type="text"
                id="fullName"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline focus:border-blue-500"
                value={editedFullName}
                onChange={(e) => setEditedFullName(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">
                Tiểu sử
              </label>
              <textarea
                id="bio"
                rows="3"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline focus:border-blue-500"
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
              ></textarea>
            </div>

            {successMessage && <p className="text-green-600 text-sm mb-4 text-center">{successMessage}</p>}
            {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
            
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;