import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const userPosts = [
  { id: 1, imageUrl: 'https://i.pinimg.com/736x/22/44/21/2244217fa39ce3be3c6c0147b14e3be5.jpg', likes: 128 },
  { id: 2, imageUrl: 'https://i.pinimg.com/1200x/28/5c/b5/285cb5a878f3eb2852e75703359cab91.jpg', likes: 74 },
  { id: 3, imageUrl: 'https://i.pinimg.com/736x/10/1d/52/101d52fffd7d467b3f75db8c2753aa3a.jpg', likes: 256 },
  { id: 4, imageUrl: 'https://i.pinimg.com/736x/2b/c4/f2/2bc4f2bd32bb63a80c74fa13165f3b3a.jpg', likes: 99 },
  { id: 5, imageUrl: 'https://i.pinimg.com/736x/ca/79/6c/ca796c51d6d40a9ab4cb8d4f18180683.jpg', likes: 150 },
];

// Dữ liệu cho các bài viết người dùng đã thích
const likedPosts = [
    { id: 101, imageUrl: 'https://i.pinimg.com/1200x/33/a5/61/33a5614b3b437ae9c4a4aaf7a110de3b.jpg', likes: 987 },
    { id: 102, imageUrl: 'https://i.pinimg.com/1200x/17/59/ee/1759eebc6d98608a77a51acc983d45d2.jpg', likes: 1204 },
]




const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const email = localStorage.getItem("email"); // Lấy email người dùng từ localStorage

    const fetchProfileInfo = async () => {
      setLoading(true);
      try {
        // Gửi yêu cầu API để lấy thông tin người dùng
        const response = await fetch(
          `http://localhost:5000/api/profile/info?email=${email}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Không thể tải hồ sơ người dùng"
          );
        }

        const data = await response.json();
        setUserProfile(data); // Lưu thông tin người dùng vào state
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfileImage = async () => {
      try {
        // Gửi yêu cầu API để lấy hình ảnh người dùng
        const imageResponse = await fetch(
          `http://localhost:5000/api/profile/image?email=${email}`
        );

        if (!imageResponse.ok) {
          throw new Error("Không thể lấy hình ảnh người dùng");
        }

        const imageData = await imageResponse.json();
        setProfileImage(imageData.profile_picture_url); // Lưu URL hình ảnh vào state
      } catch (error) {
        console.error("Lỗi khi lấy hình ảnh người dùng:", error);
      }
    };

    if (email) {
      fetchProfileInfo();
      fetchProfileImage();
    } else {
      setError("Không tìm thấy email người dùng. Vui lòng đăng nhập lại.");
      setLoading(false);
    }
  }, []); // Chạy 1 lần khi component được mount

  if (loading) {
    return <div className="text-gray-800 flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (error || !userProfile) {
    return <div className="text-red-500 flex justify-center items-center h-screen">{error || 'Không thể tải hồ sơ người dùng.'}</div>;
  }

  return (
    <div className="bg-white text-gray-800 min-h-screen p-6">
      {/* Header Profile */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={profileImage || 'https://via.placeholder.com/150'}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-full object-cover border border-gray-200"
          />
          <div>
            <h1 className="text-3xl font-bold">{userProfile.full_name}</h1>
            <p className="text-gray-500 text-lg">@{userProfile.username}</p>
          </div>
        </div>
        <Link
          to="/editprofile"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg border border-gray-300"
        >
          Chỉnh sửa hồ sơ
        </Link>
      </div>

      <p className="text-gray-600 mb-6">{userProfile.bio || 'Chưa có tiểu sử.'}</p>

      {/* Stats - DỮ LIỆU ĐƯỢC CẬP NHẬT TỪ OBJECT userProfile */}
      <div className="flex space-x-8 mb-8 text-lg">
        <div>
          <span className="font-semibold">{userProfile.postsCount || 8}</span> Posts
        </div>
        <div>
          <span className="font-semibold">{userProfile.followersCount || 15}</span> Followers
        </div>
        <div>
          <span className="font-semibold">{userProfile.followingCount || 85}</span> Following
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 ${
              activeTab === 'posts' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-800'
            } transition-colors font-medium`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="material-icons">dashboard</span>
            <span>Posts</span>
          </button>
          <button
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 ${
              activeTab === 'liked' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-800'
            } transition-colors font-medium`}
            onClick={() => setActiveTab('liked')}
          >
            <span className="material-icons">favorite_border</span>
            <span>Liked Posts</span>
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        // --- THAY ĐỔI: Lặp qua mảng userPosts để hiển thị các bài viết ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden relative group">
              <img src={post.imageUrl} alt={`Post ${post.id}`} className="w-full h-60 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center text-white text-lg">
                  {/* --- THAY ĐỔI: Hiển thị số like từ dữ liệu của post --- */}
                  <span className="material-icons text-xl mr-1">favorite</span> {post.likes}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // --- THAY ĐỔI: Hiển thị các bài viết đã thích ---
        likedPosts.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden relative group">
                    <img src={post.imageUrl} alt={`Liked Post ${post.id}`} className="w-full h-60 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center text-white text-lg">
                        <span className="material-icons text-xl mr-1">favorite</span> {post.likes}
                        </div>
                    </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="text-center text-gray-500 py-10">Chưa có bài viết đã thích.</div>
        )
      )}
    </div>
  );
};

export default Profile;