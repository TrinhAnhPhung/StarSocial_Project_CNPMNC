import React, { useState, useEffect } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaSearch,
} from "react-icons/fa";
import { getImageUrl } from '../utils/imageUtils';
import PostDetailModal from './PostDetailModal';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const linkBackend = import.meta.env.VITE_Link_backend || "http://localhost:5000";

  // Fetch bài viết trending (nhiều likes nhất)
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(
          `${linkBackend}/api/posts/trending`,
          { headers: authHeaders }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Trending posts loaded:', data.length);
          setPosts(data);
        } else {
          console.error('Failed to fetch trending posts:', response.status);
        }
      } catch (error) {
        console.error("Lỗi khi lấy bài viết trending:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, [linkBackend]);

  // Lọc bài viết theo từ khóa tìm kiếm
  const filteredPosts = posts.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    const caption = (post.caption || '').toLowerCase();
    const hashtags = (post.hashtags || '').toLowerCase();
    const location = (post.location || '').toLowerCase();
    const username = (post.username || post.full_name || '').toLowerCase();
    
    return caption.includes(searchLower) || 
           hashtags.includes(searchLower) || 
           location.includes(searchLower) ||
           username.includes(searchLower);
  });

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Đang tải bài viết trending...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Khám phá</h1>
        <p className="text-gray-600">Những bài viết được yêu thích nhất</p>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 shadow-sm">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết theo caption, hashtag, location..."
          className="flex-1 outline-none text-sm text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid bài viết */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const imageUrl = post.image_url || post.video_url;
            if (!imageUrl) return null;

            return (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="relative group bg-gray-100 rounded-lg shadow overflow-hidden cursor-pointer aspect-square"
              >
                {post.image_url ? (
                  <img
                    src={getImageUrl(post.image_url, linkBackend)}
                    alt={post.caption || "Post image"}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400?text=Image+Error';
                    }}
                  />
                ) : post.video_url ? (
                  <video
                    src={getImageUrl(post.video_url, linkBackend)}
                    className="object-cover w-full h-full"
                    muted
                  />
                ) : null}
                
                {/* Overlay hiển thị khi hover */}
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
                  <div className="flex gap-6 text-white text-sm font-semibold">
                    <div className="flex items-center gap-1">
                      <FaHeart className="text-red-500" />
                      {post.likes_count?.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaComment />
                      {post.comments_count || 0}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-full py-12">
            {searchTerm ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết nào."}
          </p>
        )}
      </div>

      {/* Modal xem chi tiết bài viết */}
      {isPostModalOpen && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isPostModalOpen}
          onClose={handleCloseModal}
          linkBackend={linkBackend}
        />
      )}
    </div>
  );
};

export default Explore;