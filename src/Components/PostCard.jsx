import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios'; // BƯỚC 1: Không cần axios nữa
import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- CÁC COMPONENT ICON (Giữ nguyên) ---
const HeartIcon = ({ isLiked }) => (
    <svg aria-label={isLiked ? "Bỏ thích" : "Thích"} className={`w-7 h-7 transition-transform duration-200 ease-in-out transform hover:scale-110 ${isLiked ? 'text-red-500' : 'text-black'}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);
const CommentIcon = () => (
    <svg aria-label="Bình luận" className="w-7 h-7 text-black transform hover:scale-110 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const ShareIcon = () => (
     <svg aria-label="Chia sẻ" className="w-7 h-7 text-black transform hover:scale-110 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);
const BookmarkIcon = () => (
    <svg aria-label="Lưu" className="w-7 h-7 text-black transform hover:scale-110 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);


// --- COMPONENT POSTCARD ---

const PostCard = ({ post }) => {
    // ---- STATE MANAGEMENT ----
    const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState(false); // State để ẩn/hiện bình luận

    // const token = localStorage.getItem("token"); // BƯỚC 1: Không cần token nữa

    // ---- EVENT HANDLERS (Sử dụng dữ liệu ảo) ----

    // 1. Xử lý Thích / Bỏ thích (chỉ thay đổi state)
    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        // Không còn gọi API
    };

    // 2. Xử lý gửi bình luận (tạo bình luận ảo)
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim() === "") return;

        // Tạo một object bình luận ảo
        const dummyComment = {
            id: Date.now(), // Dùng timestamp để có id duy nhất
            content: newComment,
            username: 'nguoi_dung_ao', // Tên người dùng ảo
            profile_picture_url: '/default-profile.jpg' // Ảnh đại diện ảo
        };

        // Thêm bình luận ảo vào danh sách và reset ô nhập liệu
        setComments([...comments, dummyComment]);
        setNewComment("");
    };

    // 3. Xử lý chia sẻ (giữ nguyên, vì nó không gọi API)
    const handleShare = () => {
        const postUrl = `${window.location.origin}/posts/${post.id}`;
        navigator.clipboard.writeText(postUrl)
            .then(() => alert("Đã sao chép liên kết bài viết!"))
            .catch(err => console.error('Lỗi khi sao chép:', err));
    };

    const postTime = formatDistanceToNowStrict(new Date(post.created_at), { locale: vi, addSuffix: true });

    // ---- JSX (USER INTERFACE) ----
    return (
        <div className="bg-white max-w-lg mx-auto border-b border-gray-200 pb-4 mb-6">
            {/* Header */}
            <div className="px-4 py-3 flex justify-between items-center">
                <Link to={`/profile/${post.username}`} className="flex items-center gap-3">
                    <img src={`http://localhost:5000${post.profile_picture_url || '/default-profile.jpg'}`} alt={post.username} className="w-9 h-9 rounded-full object-cover"/>
                    <div>
    <p className="text-sm">
        <span className="font-bold">{post.username}</span>
        <span className="text-gray-500 font-normal"> &middot; {postTime.replace('trước', '')}</span>
    </p>
</div>
                </Link>
                <button className="text-gray-500 hover:text-gray-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                </button>
            </div>

            {/* Ảnh */}
            {post.image_url && <img src={`http://localhost:5000${post.image_url}`} alt="Nội dung bài viết" className="w-full h-auto object-cover" />}

            {/* Thanh chức năng */}
            <div className="px-4 pt-4 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handleLike}><HeartIcon isLiked={isLiked} /></button>
                    <button onClick={() => setShowComments(!showComments)}><CommentIcon /></button>
                    <button onClick={handleShare}><ShareIcon /></button>
                </div>
                <button><BookmarkIcon /></button>
            </div>

            {/* Lượt thích */}
            <div className="px-4 pb-2">
                <p className="font-semibold text-sm">{likeCount.toLocaleString('en-US')} lượt thích</p>
            </div>

            {/* Caption và Hashtags */}
            <div className="px-4 text-sm">
                <p>
                    <Link to={`/profile/${post.username}`} className="font-bold mr-2">{post.username}</Link>
                    {post.caption}
                </p>
                
                {post.hashtags && (
                    <div className="flex flex-wrap gap-x-2 mt-1">
                        {post.hashtags.split(' ').map((tag, index) => (
                            <Link key={index} to={`/hashtags/${tag.replace('#','')}`} className="text-gray-500 hover:underline">
                                #{tag.replace('#','')}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Xem bình luận và thời gian */}
            <div className="px-4 pt-2 text-sm">
                {comments.length > 0 && (
                     <button onClick={() => setShowComments(!showComments)} className="text-gray-500">
                        Xem tất cả {comments.length} bình luận
                    </button>
                )}
                
            </div>

            {/* ----- KHU VỰC BÌNH LUẬN (HIỂN THỊ KHI `showComments` LÀ TRUE) ----- */}
            {showComments && (
                 <div className="px-4 pt-4 mt-2 border-t border-gray-100">
                    {/* Danh sách bình luận đã có */}
                    <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                        {comments.length > 0 ? comments.map(comment => (
                            <div key={comment.id} className="text-sm flex items-start gap-2">
                                <img src={comment.profile_picture_url || '/default-profile.jpg'} alt={comment.username} className="w-7 h-7 rounded-full object-cover" />
                                <div className="bg-gray-100 rounded-xl px-3 py-2">
                                    <Link to={`/profile/${comment.username}`} className="font-bold mr-2">{comment.username}</Link>
                                    <span>{comment.content}</span>
                                </div>
                           </div>
                        )) : <p className="text-xs text-gray-500 text-center">Chưa có bình luận nào.</p>}
                    </div>
                     {/* Form nhập bình luận mới */}
                    <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
                        <img src="/default-profile.jpg" alt="your-avatar" className="w-7 h-7 rounded-full"/>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Thêm bình luận..."
                            className="flex-grow bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button type="submit" className="text-blue-500 font-semibold text-sm hover:text-blue-700 disabled:text-blue-300" disabled={!newComment.trim()}>
                            Đăng
                        </button>
                    </form>
                 </div>
            )}
        </div>
    );
};

export default PostCard;