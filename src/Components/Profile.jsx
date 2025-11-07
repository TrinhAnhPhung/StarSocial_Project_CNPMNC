import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// 1. Import Modal (Xóa 'Link')
import EditProfileModal from './EditProfileModal';
import PostDetailModal from './PostDetailModal'; 

// Không cần dữ liệu giả lập nữa, sẽ fetch từ API

const Profile = () => {
  const { userId } = useParams(); // Lấy userId từ URL params
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const linkBackend = import.meta.env.VITE_Link_backend || "http://localhost:5000";
  const [lovedPostState, setlovedPostState] =useState({});
  const navigate = useNavigate();

  // 2. Thêm state cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleLoved = (post) => {
    // ... (Giữ nguyên logic toggleLoved) ...
  };

  // --- 3. SỬA LẠI HOÀN TOÀN useEffect ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    const fetchProfile = async () => {
      setLoading(true);
      try {
        let response;
        
        // Nếu có userId trong URL params, lấy profile của người dùng đó (có thể xem công khai)
        // Nếu không, lấy profile của chính mình (cần đăng nhập)
        if (userId) {
          // Lấy profile của người dùng khác - có thể xem công khai (không cần token)
          response = await fetch(
            `${linkBackend}/api/profile/${encodeURIComponent(userId)}`,
            { headers: authHeaders }
          );
        } else {
          // Lấy profile của chính mình - cần đăng nhập
          if (!token) {
            navigate('/login');
            setError("Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
          }
          
          response = await fetch(
            `${linkBackend}/api/profile/me`,
            { headers: authHeaders }
          );
        }

        if (!response.ok) {
          // Chỉ redirect đến login nếu là profile của chính mình (401)
          // Nếu là profile của người khác (404), chỉ hiển thị lỗi
          if (response.status === 401 && !userId) {
            navigate('/login'); 
            throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Không thể tải hồ sơ người dùng");
        }

        const data = await response.json();
        
        // Nếu gọi /api/profile/me, tự động set isOwnProfile = true
        if (!userId) {
          data.isOwnProfile = true;
        }
        
        setUserProfile(data); 
        setProfileImage(data.Profile_Picture);
     
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

  }, [linkBackend, navigate, userId]);
  // --- KẾT THÚC SỬA useEffect ---

  // Fetch posts của người dùng
  useEffect(() => {
    if (!userProfile?.id) return;

    const fetchUserPosts = async () => {
      setLoadingPosts(true);
      try {
        const token = localStorage.getItem("token");
        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Fetch tất cả posts và filter theo userId
        const response = await fetch(
          `${linkBackend}/api/posts`,
          { headers: authHeaders }
        );

        if (response.ok) {
          const allPosts = await response.json();
          // Filter posts của người dùng này
          const filteredPosts = allPosts.filter(post => String(post.user_id) === String(userProfile.id));
          // Log để debug (có thể xóa sau)
          console.log('User posts loaded:', filteredPosts.length, filteredPosts);
          console.log('Sample post data:', filteredPosts[0]);
          setUserPosts(filteredPosts);
        } else {
          console.error('Failed to fetch posts:', response.status, response.statusText);
        }
      } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (activeTab === 'posts') {
      fetchUserPosts();
    }
  }, [userProfile?.id, activeTab, linkBackend]);

  // Fetch liked posts (tạm thời để trống, có thể implement sau)
  useEffect(() => {
    if (activeTab === 'liked') {
      // TODO: Implement fetch liked posts
      setLikedPosts([]);
    }
  }, [activeTab]);

  // 4. Thêm hàm callback để nhận dữ liệu từ Modal
  const handleProfileUpdate = (updatedProfile) => {
      // Cập nhật lại state của trang Profile với dữ liệu mới từ modal
      setUserProfile(updatedProfile);
      setProfileImage(updatedProfile.Profile_Picture);
  };

  // 5. Xử lý Follow/Unfollow
  const handleFollowToggle = async () => {
    if (!userProfile?.id || userProfile?.isOwnProfile) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      navigate('/Login');
      return;
    }

    setIsFollowingLoading(true);
    
    // Optimistic update
    const originalState = userProfile.isFollowing;
    setUserProfile(prev => ({
      ...prev,
      isFollowing: !prev.isFollowing
    }));

    try {
      const response = await fetch(
        `${linkBackend}/api/users/${userProfile.id}/follow`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow');
      }

      const data = await response.json();
      
      // Cập nhật từ response
      if (data.isFollowing !== undefined) {
        setUserProfile(prev => ({
          ...prev,
          isFollowing: data.isFollowing
        }));
      }
    } catch (error) {
      console.error("Lỗi khi follow/unfollow:", error);
      // Rollback nếu có lỗi
      setUserProfile(prev => ({
        ...prev,
        isFollowing: originalState
      }));
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsFollowingLoading(false);
    }
  };


  if (loading) {
    return <div className="text-gray-800 flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (error || !userProfile) {
    return <div className="text-red-500 flex justify-center items-center h-screen">{error || 'Không thể tải hồ sơ người dùng.'}</div>;
  }

  return (
    <>
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
              {/* Sửa: Hiển thị Email (vì username không có trong API) */}
              <p className="text-gray-500 text-lg">@{userProfile.Email}</p>
            </div>
          </div>
          
          {/* 5. Chỉ hiển thị nút "Chỉnh sửa hồ sơ" nếu là profile của chính mình */}
          {userProfile?.isOwnProfile && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg border border-gray-300"
            >
              Chỉnh sửa hồ sơ
            </button>
          )}
          
          {/* Hiển thị nút Follow/Unfollow nếu là profile của người khác */}
          {!userProfile?.isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              disabled={isFollowingLoading}
              className={`font-semibold py-2 px-4 rounded-lg border transition-all ${
                userProfile?.isFollowing 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
              } ${isFollowingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isFollowingLoading ? 'Đang xử lý...' : (userProfile?.isFollowing ? 'Đang theo dõi' : 'Theo dõi')}
            </button>
          )}
        </div>

        {/* Dữ liệu từ API */}
        <p className="text-gray-600 mb-6">{userProfile.bio || 'Chưa có tiểu sử.'}</p>

        {/* Stats (Dữ liệu từ API 'getMe') */}
        <div className="flex space-x-8 mb-8 text-lg">
          <div>
            <span className="font-semibold">{userProfile.postsCount || 0}</span> Posts
          </div>
          <div>
            <span className="font-semibold">{userProfile.followersCount || 0}</span> Followers
          </div>
          <div>
            <span className="font-semibold">{userProfile.followingCount || 0}</span> Following
          </div>
        </div>

        {/* ... (Tabs và nội dung tab giữ nguyên) ... */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 ${activeTab === 'posts' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-800'} transition-colors font-medium`}
              onClick={() => setActiveTab('posts')}
            >
              <span className="material-icons">dashboard</span>
              <span>Posts</span>
            </button>
            <button
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 ${activeTab === 'liked' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-800'} transition-colors font-medium`}
              onClick={() => setActiveTab('liked')}
            >
              <span className="material-icons">favorite_border</span>
              <span>Liked Posts</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'posts' ? (
          loadingPosts ? (
            <div className="text-center text-gray-500 py-10">Đang tải bài viết...</div>
          ) : userPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.map((post) => {
                return (
                  <div 
                    key={post.id} 
                    className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg"
                    style={{ backgroundColor: '#f3f4f6' }}
                    onClick={() => {
                      // Mở modal xem chi tiết bài viết
                      setSelectedPost(post);
                      setIsPostModalOpen(true);
                    }}
                  >
                    {post.image_url ? (
                      <>
                        <img
                          src={`${linkBackend}${post.image_url}`}
                          alt={post.caption || "Post image"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          style={{ display: 'block', minHeight: '100%' }}
                          onError={(e) => {
                            console.error('❌ Error loading image:', {
                              url: `${linkBackend}${post.image_url}`,
                              original_url: post.image_url,
                              post_id: post.id
                            });
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('✅ Image loaded:', `${linkBackend}${post.image_url}`);
                          }}
                        />
                        {/* Overlay chỉ hiển thị khi hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 flex items-center justify-center pointer-events-none z-10">
                          <div className="text-white flex items-center space-x-6">
                            <span className="flex items-center space-x-2">
                              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              <span className="font-semibold">{post.likes_count || 0}</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                              </svg>
                              <span className="font-semibold">{post.comments_count || 0}</span>
                            </span>
                          </div>
                        </div>
                      </>
                    ) : post.video_url ? (
                      <div className="relative w-full h-full">
                        <video
                          src={`${linkBackend}${post.video_url}`}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                          onError={(e) => {
                            console.error('Error loading video:', `${linkBackend}${post.video_url}`);
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1.5 z-10">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        {/* Overlay cho video */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 flex items-center justify-center pointer-events-none z-10">
                          <div className="text-white flex items-center space-x-6">
                            <span className="flex items-center space-x-2">
                              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              <span className="font-semibold">{post.likes_count || 0}</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                              </svg>
                              <span className="font-semibold">{post.comments_count || 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs">No Media</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Chưa có bài viết nào.</div>
          )
        ) : (
          likedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedPosts.map((post) => {
                // Xử lý URL đơn giản giống PostCard

                return (
                  <div 
                    key={post.id} 
                    className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg bg-white"
                    onClick={() => {
                      // Mở modal xem chi tiết bài viết
                      setSelectedPost(post);
                      setIsPostModalOpen(true);
                    }}
                  >
                    {post.image_url ? (
                      <img
                        src={`${linkBackend}${post.image_url}`}
                        alt={post.caption || "Post image"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Error loading image:', `${linkBackend}${post.image_url}`);
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400?text=Image+Error';
                        }}
                      />
                    ) : post.video_url ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={`${linkBackend}${post.video_url}`}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                          onError={(e) => {
                            console.error('Error loading video:', `${linkBackend}${post.video_url}`);
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1.5 z-10">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs">No Media</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay khi hover - chỉ hiển thị khi có media */}
                    {(post.image_url || post.video_url) && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center pointer-events-none">
                        <div className="text-white opacity-0 group-hover:opacity-100 flex items-center space-x-6">
                          <span className="flex items-center space-x-2">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span className="font-semibold">{post.likes_count || 0}</span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                            </svg>
                            <span className="font-semibold">{post.comments_count || 0}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Chưa có bài viết đã thích.</div>
          )
        )}
      </div>

      {/* 6. Render Modal Edit Profile */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate} // Truyền hàm callback
        linkBackend={linkBackend}
      />

      {/* 7. Render Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setSelectedPost(null);
        }}
        linkBackend={linkBackend}
      />
    </>
  );
};

export default Profile;
