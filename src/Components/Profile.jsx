import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');

    const { username } = useParams(); // ✅ Lấy username từ URL

    useEffect(() => {
        if (!username) {
            setLoading(false);
            setError('Không tìm thấy username trong URL.');
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            try {
                // ✅ Gọi đến API đã sửa ở backend
                const response = await fetch(`http://localhost:5000/api/profile/${username}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Không tìm thấy người dùng');
                }

                const data = await response.json();
                setUserProfile(data.user);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin profile:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]); // ✅ Chạy lại useEffect khi username trên URL thay đổi

    if (loading) {
        return <div className="text-white flex justify-center items-center h-screen">Đang tải...</div>;
    }

    if (error || !userProfile) {
        return <div className="text-red-500 flex justify-center items-center h-screen">{error || 'Không thể tải hồ sơ người dùng.'}</div>;
    }

  return (
    <div className="bg-black text-white min-h-screen p-6">
      {/* Header Profile */}
      <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <img 
                        src={userProfile.profile_picture_url || 'https://via.placeholder.com/150'} 
                        alt="Profile Avatar" 
                        className="w-24 h-24 rounded-full object-cover" 
                    />
                    <div>
                        <h1 className="text-3xl font-bold">{userProfile.full_name}</h1>
                        <p className="text-gray-400 text-lg">@{userProfile.username}</p>
                    </div>
                </div>
                <Link 
                    to="/editprofile" 
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                >
                    Chỉnh sửa hồ sơ
                </Link>
            </div>

            <p className="text-gray-300 mb-6">{userProfile.bio || 'Chưa có tiểu sử.'}</p>

      {/* Stats */}
      <div className="flex space-x-8 mb-8 text-lg">
        <div>
          <span className="font-semibold">{userProfile.postsCount}</span> Posts
        </div>
        <div>
          <span className="font-semibold">{userProfile.followersCount}</span> Followers
        </div>
        <div>
          <span className="font-semibold">{userProfile.followingCount}</span> Following
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 ${
              activeTab === 'posts' ? 'border-purple-500 text-purple-500' : 'border-transparent text-gray-400 hover:text-white'
            } transition-colors`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="material-icons">dashboard</span>
            <span>Posts</span>
          </button>
          <button
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 ${
              activeTab === 'liked' ? 'border-purple-500 text-purple-500' : 'border-transparent text-gray-400 hover:text-white'
            } transition-colors`}
            onClick={() => setActiveTab('liked')}
          >
            <span className="material-icons">favorite_border</span>
            <span>Liked Posts</span>
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 border rounded-lg overflow-hidden relative group">
            <img src="https://i.ibb.co/s3p12J2/coding-setup.png" alt="Post" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center text-white text-lg">
                <span className="material-icons text-xl mr-1">favorite</span> 0
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Chưa có bài viết đã thích.</div>
      )}
    </div>
  );
};

export default Profile;
