import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const username = localStorage.getItem('username'); // Lấy username từ localStorage

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/profile/${username}`);
        if (!response.ok) throw new Error('Không tìm thấy user');
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin profile:', error);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (!userProfile) {
    return (
      <div className="text-gray-900 flex justify-center items-center h-screen">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  const userPosts = [
    { id: 1, imageUrl: 'https://i.ibb.co/s3p12J2/coding-setup.png', likes: 0 }
  ];

  const likedPosts = [];

  const renderContent = () => {
    if (activeTab === 'posts') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="bg-gray-50 border rounded-lg overflow-hidden relative group">
                <img src={post.imageUrl} alt="Post" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center text-white text-lg">
                    <span className="material-icons text-xl mr-1">favorite</span> {post.likes}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-8">Chưa có bài viết nào.</p>
          )}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {likedPosts.length > 0 ? (
            likedPosts.map((post) => (
              <div key={post.id} className="bg-gray-50 border rounded-lg overflow-hidden relative group">
                <img src={post.imageUrl} alt="Liked Post" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center text-white text-lg">
                    <span className="material-icons text-xl mr-1">favorite</span> {post.likes}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-8">There are no suitable articles yet..</p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen p-6">
      {/* Header Profile */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-4xl font-bold">
            <img
              src={userProfile.profile_picture_url || './src/assets/default-avatar.png'}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{userProfile.full_name}</h1>
            <p className="text-gray-500 text-lg">@{userProfile.username}</p>
          </div>
        </div>
        <Link
          to="/editprofile"
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span className="material-icons text-lg">edit</span>
          <span>Edit profile</span>
        </Link>
      </div>

      {/* Bio */}
      <p className="text-gray-700 mb-6">{userProfile.bio || 'Chưa có tiểu sử.'}</p>

      {/* Stats */}
      <div className="flex space-x-8 mb-8 text-lg">
        <div><span className="font-semibold">0</span> Posts</div>
        <div><span className="font-semibold">0</span> Followers</div>
        <div><span className="font-semibold">0</span> Following</div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={` cursor-pointer flex items-center space-x-2 py-3 px-4 border-b-2 ${
              activeTab === 'posts' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-900'
            } transition-colors`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="material-icons">dashboard</span>
            <span>Posts</span>
          </button>
          <button
            className={`cursor-pointer flex items-center space-x-2 py-3 px-4 border-b-2 ${
              activeTab === 'liked' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-900'
            } transition-colors`}
            onClick={() => setActiveTab('liked')}
          >
            <span className="material-icons">favorite_border</span>
            <span>Liked Posts</span>
          </button>
        </nav>
      </div>

      {/* Render Posts */}
      {renderContent()}
    </div>
  );
};

export default Profile;