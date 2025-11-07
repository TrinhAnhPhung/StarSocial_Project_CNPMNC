import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PostDetailModal = ({ post, isOpen, onClose, linkBackend }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post?.is_liked_by_user || false);
  const [likeCount, setLikeCount] = useState(post?.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post?.comments_count || 0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
      setIsLiked(post.is_liked_by_user || false);
      setLikeCount(post.likes_count || 0);
      setCommentsCount(post.comments_count || 0);
      setCurrentImageIndex(0);
    }
  }, [isOpen, post]);

  const fetchComments = async () => {
    if (!post?.id) return;
    
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${linkBackend}/api/posts/${post.id}/comments`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      // API trả về { comments: [...] } hoặc mảng trực tiếp
      const commentsData = response.data.comments || response.data || [];
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!post?.id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để thích bài viết');
      return;
    }

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      await axios.post(
        `${linkBackend}/api/posts/${post.id}/like`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      // Rollback
      setIsLiked(!newIsLiked);
      setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !post?.id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để bình luận');
      return;
    }

    setIsSubmittingComment(true);
    const commentText = newComment.trim();
    setNewComment('');

    try {
      const response = await axios.post(
        `${linkBackend}/api/posts/${post.id}/comments`,
        { content: commentText },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Refresh comments
      await fetchComments();
      setCommentsCount(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setNewComment(commentText); // Restore comment text on error
      alert('Không thể đăng bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để thích bình luận');
      return;
    }

    try {
      await axios.post(
        `${linkBackend}/api/comments/${commentId}/like`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      // Refresh comments to update like status
      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Xử lý URL hình ảnh
  const getImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') return null;
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
    if (!videoUrl || videoUrl === 'null' || videoUrl === 'undefined') return null;
    const url = String(videoUrl).trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/') || url.startsWith('/')) {
      return `${linkBackend}${url}`;
    }
    return `${linkBackend}/uploads/${url}`;
  };

  // Lấy tất cả media (hình ảnh và video) từ post
  const getPostMedia = () => {
    const media = [];
    if (post?.image_url) {
      const imgUrl = getImageUrl(post.image_url);
      if (imgUrl) media.push({ type: 'image', url: imgUrl });
    }
    if (post?.video_url) {
      const vidUrl = getVideoUrl(post.video_url);
      if (vidUrl) media.push({ type: 'video', url: vidUrl });
    }
    return media;
  };

  const postMedia = getPostMedia();

  if (!isOpen || !post) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Phần hiển thị media (bên trái) */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative">
          {postMedia.length > 0 ? (
            <>
              {postMedia[currentImageIndex].type === 'image' ? (
                <img
                  src={postMedia[currentImageIndex].url}
                  alt="Post content"
                  className="max-w-full max-h-[90vh] object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500?text=Image+Error';
                  }}
                />
              ) : (
                <video
                  src={postMedia[currentImageIndex].url}
                  controls
                  className="max-w-full max-h-[90vh] object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    console.error('Error loading video');
                  }}
                />
              )}

              {/* Nút chuyển ảnh nếu có nhiều media */}
              {postMedia.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev - 1 + postMedia.length) % postMedia.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev + 1) % postMedia.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots indicator nếu có nhiều media */}
              {postMedia.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {postMedia.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-white text-center p-8">
              <p>No media available</p>
            </div>
          )}
        </div>

        {/* Phần thông tin và bình luận (bên phải) */}
        <div className="w-full md:w-1/2 flex flex-col max-h-[90vh]">
          {/* Header: User info */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <Link 
              to={`/profile/${post.user_id || post.Email || post.username}`}
              onClick={onClose}
              className="flex items-center gap-3"
            >
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
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div>
                <p className="font-semibold text-sm">
                  {post.full_name || post.First_Name + ' ' + post.Last_name || post.username}
                </p>
              </div>
            </Link>
          </div>

          {/* Comments section - scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Caption */}
            <div className="mb-4">
              <p className="text-sm">
                <Link 
                  to={`/profile/${post.user_id || post.Email || post.username}`}
                  onClick={onClose}
                  className="font-bold mr-2 hover:underline"
                >
                  {post.full_name || post.First_Name + ' ' + post.Last_name || post.username}
                </Link>
                <span>{post.caption}</span>
              </p>
              {post.hashtags && (
                <div className="flex flex-wrap gap-x-2 mt-2">
                  {post.hashtags.split(' ').filter(tag => tag.trim()).map((tag, index) => (
                    <Link 
                      key={index} 
                      to={`/hashtags/${tag.replace('#','')}`} 
                      className="text-blue-500 hover:underline font-medium text-sm"
                    >
                      #{tag.replace('#','')}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Comments list */}
            {isLoadingComments ? (
              <div className="text-center text-gray-500 py-4 text-sm">Đang tải bình luận...</div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id || comment.comment_id} className="flex items-start gap-3">
                    <Link 
                      to={`/profile/${comment.user_id || comment.Email || comment.username}`}
                      onClick={onClose}
                    >
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
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <Link 
                          to={`/profile/${comment.user_id || comment.Email || comment.username}`}
                          onClick={onClose}
                          className="font-bold mr-2 hover:underline"
                        >
                          {comment.username || comment.Email}
                        </Link>
                        <span>{comment.content || comment.comment_content}</span>
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString('vi-VN') : ''}
                        </span>
                        {comment.likes_count > 0 && (
                          <span className="text-xs text-gray-500 font-semibold">
                            {comment.likes_count} lượt thích
                          </span>
                        )}
                        <button
                          onClick={() => handleLikeComment(comment.id || comment.comment_id)}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          Thích
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 text-sm">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            )}
          </div>

          {/* Actions and comment input */}
          <div className="border-t border-gray-200 p-4">
            {/* Action buttons */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button onClick={handleLike} className="focus:outline-none">
                  <svg
                    className={`w-7 h-7 ${isLiked ? 'text-red-500 fill-current' : 'text-black'}`}
                    fill={isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                <svg
                  className="w-7 h-7 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>

            {/* Likes count */}
            <p className="font-semibold text-sm mb-3">{likeCount.toLocaleString('en-US')} lượt thích</p>

            {/* Comment input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center border-t border-gray-200 pt-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bình luận..."
                className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="text-blue-500 font-semibold text-sm hover:text-blue-700 disabled:text-blue-300 disabled:cursor-not-allowed px-2"
              >
                {isSubmittingComment ? 'Đang đăng...' : 'Đăng'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;

