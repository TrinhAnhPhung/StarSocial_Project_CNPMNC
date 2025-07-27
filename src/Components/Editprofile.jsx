import React, { useState, useEffect ,useRef  } from 'react'; // Giữ lại useEffect vì nó được dùng sau này
// import axios from 'axios'; // Bỏ comment nếu bạn muốn sử dụng axios sau này
import Sidebar from './Sidebar';
// import { Link } from 'react-router-dom'; // Giữ lại nếu Sidebar dùng hoặc sẽ dùng sau này
import { Link } from 'react-router-dom';
const EditProfile = () => {
  // Dữ liệu người dùng tĩnh cho mục đích trình diễn
  const [userProfile, setUserProfile] = useState({ // Bỏ comment dòng này
    username: 'trinhanhphung',
    full_name: 'Trịnh Anh Phụng',
    bio: 'Updating my bio, one decade at a time.',
    profile_picture_url: './src/assets/phung.jpg', // Placeholder hoặc đường dẫn avatar mặc định
  });

  // Vì không fetch data, loading luôn là false

  const [error, setError] = useState(null); // Bỏ comment dòng này
  const [successMessage, setSuccessMessage] = useState(null); // Bỏ comment dòng này

  // State để lưu trữ giá trị đang chỉnh sửa của các trường input
  // Khởi tạo với giá trị từ userProfile tĩnh
  const [editedFullName, setEditedFullName] = useState(userProfile.full_name);
  const [editedBio, setEditedBio] = useState(userProfile.bio);

  // State cho Sidebar để biết mục nào đang active
  const [activeSidebarItem, setActiveSidebarItem] = useState('editprofile');


  const fileInputRef = useRef(null); // để điều khiển input file

const handleImageClick = () => {
  fileInputRef.current.click(); // mở hộp thoại chọn file
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const imageUrl = URL.createObjectURL(file);
    setUserProfile(prev => ({ ...prev, profile_picture_url: imageUrl }));
    setSuccessMessage('Ảnh đại diện đã được cập nhật!');
  } else {
    setError('Vui lòng chọn một tập tin ảnh hợp lệ.');
  }
};
  

  // Nếu bạn muốn giữ lại useEffect cho việc fetch data từ backend sau này,
  // bạn có thể giữ cấu trúc này và comment phần nội dung bên trong.
  // Tuy nhiên, nếu bạn muốn loại bỏ hoàn toàn logic backend, bạn có thể xóa cả block này.
  // Trong trường hợp này, tôi sẽ giữ nó nhưng để trống hoặc với logic tối thiểu
  // để không gây lỗi "never read" cho useEffect.
  useEffect(() => {
    // Để useEffect không bị lỗi "never read", bạn có thể để trống hoặc
    // thêm một console.log() đơn giản nếu không có logic async nào.
    // Nếu bạn không có ý định fetch data ở đây trong phiên bản tĩnh, bạn có thể xóa cả useEffect.
    console.log("EditProfile component loaded.");
  }, []); // [] đảm bảo nó chỉ chạy một lần

  // Xử lý gửi form (chỉ ghi log ra console, không gọi backend thực tế)
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage(null); // Xóa các thông báo trước đó
    setError(null);

    // Mô phỏng cập nhật thành công
    const updatedUser = {
      ...userProfile,
      full_name: editedFullName,
      bio: editedBio,
    };
    setUserProfile(updatedUser); // Cập nhật state cục bộ với dữ liệu "đã lưu"
    setSuccessMessage('Cập nhật hồ sơ thành công! (Dữ liệu này chỉ hiển thị ở frontend)');
    console.log('Dữ liệu hồ sơ đã được "cập nhật" (chỉ ở frontend):', updatedUser);

    // Code axios.put đã được comment, nên không có tương tác backend ở đây.
  };

  // Các kiểm tra loading và error có thể được đơn giản hóa hoặc loại bỏ nếu dữ liệu tĩnh
  // Đối với trình diễn, chúng ta sẽ giữ cấu trúc nhưng chúng sẽ không kích hoạt nếu loading luôn là false
  

  // Nếu có lỗi từ một lời gọi backend trước đó (hiện đã bị xóa)
  if (error && !userProfile.username) {
    return (
      <div className="flex">
        <Sidebar activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-100">
          <p className="text-red-500">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  // Nếu userProfile là null (không thể xảy ra với dữ liệu tĩnh, nhưng là một practice tốt)
  if (!userProfile || !userProfile.username) {
      return (
        <div className="flex">
            <Sidebar activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />
            <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-100 text-gray-400">
                Không có dữ liệu hồ sơ để hiển thị.
            </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />

      <div className="flex-1 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg"> {/* Đã đổi shadow-md thành shadow-lg */}
           <div className="relative flex justify-center items-center mb-8">
            <Link
              to="/profile"
              className="absolute left-0 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Quay về trang cá nhân"
            >
              <span className="material-icons text-3xl">arrow_back</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa trang cá nhân</h2>
          </div>

          {/* User Info Section */}
          <div className="flex items-center mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-300 flex-shrink-0">
              <img
                src={userProfile.profile_picture_url || './src/assets/default-avatar.jpg'}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <p className="text-lg font-semibold text-gray-800">@{userProfile.username}</p>
              <p className="text-sm text-gray-600">{userProfile.full_name}</p>
            </div>
           <button
  type="button"
  onClick={handleImageClick}
  className="ml-auto cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
>
  Change image
</button>
<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={handleImageChange}
  style={{ display: 'none' }}
/>
          </div>

          {/* Form for editing profile details */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">
                Add bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="Nhập tiểu sử của bạn..."
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
                Enter Change full name for personal page
              </label>
              <input
                type="text"
                id="fullName"
                name="full_name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="Nhập tên đầy đủ của bạn..."
                value={editedFullName}
                onChange={(e) => setEditedFullName(e.target.value)}
              />
            </div>

            {/* Success and Error Messages */}
            {successMessage && (
              <p className="text-green-600 text-sm mb-4 text-center">{successMessage}</p>
            )}
            {error && (
              <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white cursor-pointer font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors w-full"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;