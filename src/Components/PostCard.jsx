import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
    // Định dạng thời gian cho bài viết
    const postTime = new Date(post.created_at).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Xử lý hashtags
    const hashtagsArray = post.hashtags ? post.hashtags.split(' ').map(tag => tag.startsWith('#') ? tag : `#${tag}`) : [];

    return (
        <div className="bg-white border rounded-lg shadow-sm mb-6">
            {/* Header của bài viết */}
            <div className="p-4 flex items-center">
                <Link to={`/profile/${post.username}`} className="flex items-center">
                    <img 
                        src={`http://localhost:5000${post.profile_picture_url || '/default-profile.jpg'}`}  // Cập nhật đường dẫn profile picture
                        alt={post.username}
                        className="w-10 h-10 rounded-full object-cover mr-3" 
                    />
                    <div>
                        <p className="font-bold">{post.username}</p>
                        <p className="text-xs text-gray-500">{postTime}</p>
                    </div>
                </Link>
            </div>

            {/* Nội dung bài viết */}
            <div className="p-4">
                <p className="mb-2">{post.caption}</p>

                {/* Hashtags */}
                {hashtagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {hashtagsArray.map((tag, index) => (
                            <Link key={index} to={`/hashtags/${tag.substring(1)}`} className="text-blue-500 font-semibold">
                                {tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Địa điểm */}
                {post.location && <p className="text-sm text-gray-500 mb-2">Tại: {post.location}</p>}
            </div>

            {/* Hình ảnh bài viết */}
            {post.image_url && <img src={`http://localhost:5000${post.image_url}`} alt="Nội dung bài viết" className="w-full" />}

            {/* Các nút chức năng (có thể thêm sau) */}
            <div className="p-4 border-t flex space-x-4">
                <button>❤️ Thích</button>
                <button>💬 Bình luận</button>
                <button>🔗 Chia sẻ</button>
            </div>
        </div>
    );
};

export default PostCard;
