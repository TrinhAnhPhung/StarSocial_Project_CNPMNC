import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- CÁC COMPONENT ICON (Giữ nguyên) ---
const HeartIcon = ({ isLiked }) => (
  <svg
    aria-label={isLiked ? "Bỏ thích" : "Thích"}
    className={`w-7 h-7 transition-transform duration-200 ease-in-out transform hover:scale-110 ${
      isLiked ? 'text-red-500' : 'text-black'
    }`}
    fill={isLiked ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);

const CommentIcon = () => (
  <svg
    aria-label="Bình luận"
    className="w-7 h-7 text-black transform hover:scale-110 transition-transform duration-200 ease-in-out"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const ShareIcon = () => (
  <svg
    aria-label="Chia sẻ"
    className="w-7 h-7 text-black transform hover:scale-110 transition-transform duration-200 ease-in-out"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const BookmarkIcon = () => (
  <svg
    aria-label="Lưu"
    className="w-7 h-7 text-black transform hover:scale-110 transition-transform duration-200 ease-in-out"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

// --- COMPONENT POSTCARD ---
const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || post.like_count || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || post.comments?.length || 0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editLocation, setEditLocation] = useState(post.location || '');
  const [editHashtags, setEditHashtags] = useState(post.hashtags || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const menuRef = useRef(null);

  const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';
  const API_URL = `${linkBackend}/api`;

  // Lấy current user ID từ token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);

  // Reset error states when post changes
  useEffect(() => {
    setImageError(false);
    setVideoError(false);
  }, [post.id, post.image_url, post.video_url]);

  // Kiểm tra xem user hiện tại có phải chủ sở hữu bài viết không
  const isPostOwner = currentUserId && post.user_id && String(currentUserId) === String(post.user_id);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // --- Xử lý LIKE ---
  const handleLike = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    const originalLiked = isLiked;
    const originalCount = likeCount;
    setIsLiked(!originalLiked);
    setLikeCount(originalLiked ? originalCount - 1 : originalCount + 1);

    try {
      const response = await axios.post(`${API_URL}/posts/${post.id}/like`, {}, { headers });
      // Cập nhật từ response nếu có
      if (response.data.likes_count !== undefined) {
        setLikeCount(response.data.likes_count);
      }
      if (response.data.is_liked !== undefined) {
        setIsLiked(response.data.is_liked);
      }
    } catch (error) {
      console.error("Lỗi khi like:", error);
      // Rollback nếu có lỗi
      setIsLiked(originalLiked);
      setLikeCount(originalCount);
      alert("Đã có lỗi xảy ra khi thả tim. Vui lòng thử lại.");
    }
  };

  // --- Load comments khi mở phần bình luận ---
  const loadComments = async () => {
    if (comments.length > 0 && showComments) return; // Đã load rồi
    
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/posts/${post.id}/comments`, { headers });
      setComments(response.data.comments || []);
      setCommentsCount(response.data.comments?.length || 0);
    } catch (error) {
      console.error("Lỗi khi load bình luận:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // --- Xử lý mở/đóng phần bình luận ---
  const handleToggleComments = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    if (newShowComments && comments.length === 0) {
      loadComments();
    }
  };

  // --- Xử lý BÌNH LUẬN ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.post(
        `${API_URL}/posts/${post.id}/comments`,
        { content: newComment },
        { headers }
      );

      // Thêm bình luận mới vào đầu danh sách với likes_count và is_liked_by_user mặc định
      const newCommentData = {
        ...response.data.comment,
        likes_count: 0,
        is_liked_by_user: false
      };
      setComments([newCommentData, ...comments]);
      setCommentsCount(commentsCount + 1);
      setNewComment("");
    } catch (error) {
      console.error("Lỗi khi bình luận:", error);
      alert("Đã xảy ra lỗi khi gửi bình luận.");
    }
  };

  // --- Xử lý LIKE BÌNH LUẬN ---
  const handleCommentLike = async (commentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const headers = getAuthHeaders();
    if (!headers) return;

    // Tìm comment trong danh sách
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const originalLiked = comment.is_liked_by_user || false;
    const originalCount = comment.likes_count || 0;

    // Optimistic update
    setComments(prevComments =>
      prevComments.map(c =>
        c.id === commentId
          ? {
              ...c,
              is_liked_by_user: !originalLiked,
              likes_count: originalLiked ? originalCount - 1 : originalCount + 1
            }
          : c
      )
    );

    try {
      const response = await axios.post(
        `${API_URL}/posts/${post.id}/comments/${commentId}/like`,
        {},
        { headers }
      );

      // Cập nhật từ response
      if (response.data.likes_count !== undefined || response.data.is_liked !== undefined) {
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId
              ? {
                  ...c,
                  is_liked_by_user: response.data.is_liked || false,
                  likes_count: response.data.likes_count || 0
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi like comment:", error);
      // Rollback nếu có lỗi
      setComments(prevComments =>
        prevComments.map(c =>
          c.id === commentId
            ? {
                ...c,
                is_liked_by_user: originalLiked,
                likes_count: originalCount
              }
            : c
        )
      );
      alert("Đã có lỗi xảy ra khi thả tim bình luận. Vui lòng thử lại.");
    }
  };

  // --- Xử lý SỬA BÀI VIẾT ---
  const handleEditPost = () => {
    // Kiểm tra quyền sở hữu trước khi sửa
    if (!isPostOwner) {
      alert("Bạn không có quyền sửa bài viết này.");
      setIsMenuOpen(false);
      return;
    }

    setEditCaption(post.caption || '');
    setEditLocation(post.location || '');
    setEditHashtags(post.hashtags || '');
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_URL}/posts/${post.id}`,
        {
          caption: editCaption.trim(),
          location: editLocation.trim(),
          hashtags: editHashtags.trim()
        },
        { headers }
      );

      // Cập nhật post trong parent component nếu có callback
      if (response.data.post) {
        const updatedPost = {
          ...post,
          caption: response.data.post.caption || editCaption.trim(),
          location: response.data.post.location || editLocation.trim(),
          hashtags: response.data.post.hashtags || editHashtags.trim()
        };
        
        // Gọi callback để cập nhật post trong Feed
        if (onPostUpdated) {
          onPostUpdated(post.id, updatedPost);
        }
        
        alert("Đã cập nhật bài viết thành công!");
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Lỗi khi sửa bài viết:", error);
      alert(`Lỗi: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Xử lý XÓA BÀI VIẾT ---
  const handleDeletePost = async () => {
    // Kiểm tra quyền sở hữu trước khi xóa
    if (!isPostOwner) {
      alert("Bạn không có quyền xóa bài viết này.");
      setIsMenuOpen(false);
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      const headers = getAuthHeaders();
      if (!headers) return;

      try {
        await axios.delete(`${API_URL}/posts/${post.id}`, { headers });
        alert("Bài viết đã được xóa");
        setIsMenuOpen(false);

        if (onPostDeleted) {
          onPostDeleted(post.id);
        }
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
        alert(`Lỗi: ${errorMessage}`);
        setIsMenuOpen(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý URL hình ảnh
  const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl.trim() === '') {
      return null;
    }
    const url = String(imageUrl).trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/') || url.startsWith('/')) {
      return `${linkBackend}${url}`;
    }
    return `${linkBackend}/uploads/${url}`;
  };

  // Xử lý URL video
  const getVideoUrl = (videoUrl) => {
    if (!videoUrl || videoUrl === 'null' || videoUrl === 'undefined' || videoUrl.trim() === '') {
      return null;
    }
    const url = String(videoUrl).trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/') || url.startsWith('/')) {
      return `${linkBackend}${url}`;
    }
    return `${linkBackend}/uploads/${url}`;
  };

  const postTime = formatDistanceToNowStrict(new Date(post.created_at), {
    locale: vi,
    addSuffix: true,
  });

  // Lấy URL hình ảnh và video đã được xử lý
  const imageUrl = getImageUrl(post.image_url);
  const videoUrl = getVideoUrl(post.video_url);

  // --- JSX GIỮ NGUYÊN ---
  return (
    <div className="bg-white max-w-lg mx-auto border-b border-gray-200 pb-4 mb-6 w-full">
      <div className="px-2 sm:px-4 py-3 flex justify-between items-center">
        <Link to={`/profile/${post.user_id || post.Email || post.username}`} className="flex items-center gap-3">
          <img
            src={(() => {
              if (!post.profile_picture_url || post.profile_picture_url === 'null' || post.profile_picture_url === 'undefined') {
                return '/default-avatar.png';
              }
              if (post.profile_picture_url.startsWith('http://') || post.profile_picture_url.startsWith('https://')) {
                return post.profile_picture_url;
              }
              if (post.profile_picture_url.startsWith('/uploads/') || post.profile_picture_url.startsWith('/')) {
                return `${linkBackend}${post.profile_picture_url}`;
              }
              return `${linkBackend}/uploads/${post.profile_picture_url}`;
            })()}
            alt={post.username}
            className="w-9 h-9 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
          <div>
            <p className="text-sm">
              <span className="font-bold">{post.full_name || post.First_Name + ' ' + post.Last_name || post.username}</span>
              <span className="text-gray-500 font-normal">
                {" "}
                &middot; {postTime.replace("trước", "").trim()}
              </span>
            </p>
          </div>
        </Link>

        {/* Chỉ hiển thị menu nếu user là chủ sở hữu bài viết */}
        {isPostOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-800 p-1 rounded-full"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  onClick={handleEditPost}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sửa bài viết
                </button>
                <button
                  onClick={handleDeletePost}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-semibold"
                >
                  Xóa bài viết
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption hiển thị dưới avatar, trước hình ảnh */}
      {post.caption && (
        <div className="px-2 sm:px-4 py-3">
          <p className={`text-gray-900 font-semibold text-base sm:text-lg leading-relaxed ${!expandedCaption && post.caption.length > 100 ? 'line-clamp-2' : ''}`}>
            <Link to={`/profile/${post.user_id || post.Email || post.username}`} className="font-bold hover:underline">
              {post.full_name || post.First_Name + ' ' + post.Last_name || post.username}
            </Link>
            {' '}
            <span>{post.caption}</span>
          </p>
          {post.caption.length > 100 && (
            <button
              onClick={() => setExpandedCaption(!expandedCaption)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium mt-1"
            >
              {expandedCaption ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
          {post.hashtags && (
            <div className="flex flex-wrap gap-x-2 mt-2">
              {post.hashtags.split(' ').filter(tag => tag.trim()).map((tag, index) => (
                <Link key={index} to={`/hashtags/${tag.replace('#','')}`} className="text-blue-500 hover:underline font-medium text-sm">
                  #{tag.replace('#','')}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {imageUrl && !imageError && (
        <img
          src={imageUrl}
          alt="Nội dung bài viết"
          className="w-full h-auto object-cover"
          loading="lazy"
          onError={(e) => {
            // Chỉ log lỗi trong development mode
            if (import.meta.env.DEV) {
              console.warn('⚠️ Không thể tải ảnh bài viết (có thể đã được migrate lên Cloudinary):', {
                url: imageUrl,
                original_url: post.image_url,
                post_id: post.id
              });
            }
            e.target.onerror = null;
            setImageError(true);
          }}
          onLoad={() => {
            // Chỉ log trong development mode
            if (import.meta.env.DEV) {
              console.log('✅ Post image loaded:', imageUrl);
            }
          }}
        />
      )}
      {imageUrl && imageError && (
        <div className="w-full bg-gray-100 flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm">Không thể tải hình ảnh</p>
            <button
              onClick={() => {
                setImageError(false);
              }}
              className="mt-2 text-blue-500 text-xs hover:underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
      {videoUrl && !videoError && (
        <video
          src={videoUrl}
          controls
          className="w-full h-auto object-cover"
          onError={(e) => {
            // Chỉ log lỗi trong development mode
            if (import.meta.env.DEV) {
              console.warn('⚠️ Không thể tải video bài viết (có thể đã được migrate lên Cloudinary):', {
                url: videoUrl,
                original_url: post.video_url,
                post_id: post.id
              });
            }
            e.target.onerror = null;
            setVideoError(true);
          }}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      )}
      {videoUrl && videoError && (
        <div className="w-full bg-gray-100 flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-sm">Không thể tải video</p>
            <button
              onClick={() => {
                setVideoError(false);
              }}
              className="mt-2 text-blue-500 text-xs hover:underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="px-2 sm:px-4 pt-4 pb-2 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={handleLike} className="focus:outline-none">
            <HeartIcon isLiked={isLiked} />
          </button>
          <button onClick={handleToggleComments} className="focus:outline-none">
            <CommentIcon />
          </button>
          <button className="focus:outline-none"><ShareIcon /></button>
        </div>
        <button className="focus:outline-none"><BookmarkIcon /></button>
      </div>

      <div className="px-2 sm:px-4 pb-2">
        <p className="font-semibold text-sm">{likeCount.toLocaleString('en-US')} lượt thích</p>
      </div>


      <div className="px-2 sm:px-4 pt-2 text-sm">
        {commentsCount > 0 && (
          <button onClick={handleToggleComments} className="text-gray-500 hover:text-gray-700">
            Xem tất cả {commentsCount} bình luận
          </button>
        )}
      </div>

      {showComments && (
        <div className="px-2 sm:px-4 pt-4 mt-2 border-t border-gray-100">
          {isLoadingComments ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500">Đang tải bình luận...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="text-sm flex items-start gap-2">
                    <img 
                      src={(() => {
                        if (!comment.profile_picture_url || comment.profile_picture_url === 'null' || comment.profile_picture_url === 'undefined') {
                          return '/default-avatar.png';
                        }
                        if (comment.profile_picture_url.startsWith('http://') || comment.profile_picture_url.startsWith('https://')) {
                          return comment.profile_picture_url;
                        }
                        if (comment.profile_picture_url.startsWith('/uploads/') || comment.profile_picture_url.startsWith('/')) {
                          return `${linkBackend}${comment.profile_picture_url}`;
                        }
                        return `${linkBackend}/uploads/${comment.profile_picture_url}`;
                      })()}
                      alt={comment.username} 
                      className="w-7 h-7 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-xl px-3 py-2">
                        <Link to={`/profile/${comment.user_id || comment.Email || comment.username}`} className="font-bold mr-2 hover:underline">
                          {comment.username || comment.Email}
                        </Link>
                        <span>{comment.content}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-3">
                        <button
                          onClick={(e) => handleCommentLike(comment.id, e)}
                          className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors focus:outline-none"
                        >
                          <svg
                            className={`w-4 h-4 ${comment.is_liked_by_user ? 'text-red-500 fill-current' : ''}`}
                            fill={comment.is_liked_by_user ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                            />
                          </svg>
                          {comment.likes_count > 0 && (
                            <span className="text-xs">{comment.likes_count}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center">Chưa có bình luận nào.</p>
              )}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
            <img 
              src={(() => {
                if (!post.profile_picture_url || post.profile_picture_url === 'null' || post.profile_picture_url === 'undefined') {
                  return '/default-avatar.png';
                }
                if (post.profile_picture_url.startsWith('http://') || post.profile_picture_url.startsWith('https://')) {
                  return post.profile_picture_url;
                }
                if (post.profile_picture_url.startsWith('/uploads/') || post.profile_picture_url.startsWith('/')) {
                  return `${linkBackend}${post.profile_picture_url}`;
                }
                return `${linkBackend}/uploads/${post.profile_picture_url}`;
              })()}
              alt="your-avatar" 
              className="w-7 h-7 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Thêm bình luận..."
              className="flex-grow bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="text-blue-500 font-semibold text-sm hover:text-blue-700 disabled:text-blue-300 disabled:cursor-not-allowed"
              disabled={!newComment.trim()}
            >
              Đăng
            </button>
          </form>
        </div>
      )}

      {/* Modal Sửa Bài Viết */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Sửa bài viết</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài viết
                </label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  rows="4"
                  placeholder="Nhập nội dung bài viết..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Nhập địa điểm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags (cách nhau bằng dấu cách)
                </label>
                <input
                  type="text"
                  value={editHashtags}
                  onChange={(e) => setEditHashtags(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="#hashtag1 #hashtag2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={isUpdating}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
