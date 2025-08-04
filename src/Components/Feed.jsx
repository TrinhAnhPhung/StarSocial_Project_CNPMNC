import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from './PostCard'; // Component này sẽ chứa giao diện của từng bài viết

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1); // Thêm state để quản lý trang cho infinite scroll

    // Hàm lấy dữ liệu từ API
    const fetchPosts = async () => {
        try {
            // Thêm page vào query để backend biết cần tải trang nào
            const response = await axios.get(`http://localhost:5000/api/posts?page=${page}`);
            console.log('Posts fetched from API:', response.data);

            if (response.data.length > 0) {
                setPosts((prevPosts) => [...prevPosts, ...response.data]);
                setPage((prevPage) => prevPage + 1); // Tăng số trang cho lần gọi tiếp theo
            } else {
                setHasMore(false); // Nếu không còn bài viết, dừng việc tải thêm
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
            // Có thể thêm xử lý để không gọi lại API liên tục nếu có lỗi
            setHasMore(false);
        }
    };

    useEffect(() => {
        fetchPosts(); // Lấy bài viết lần đầu khi trang được tải
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- HÀM XỬ LÝ THẢ TIM ---
    const handleToggleLike = async (postId) => {
        try {
            // Lấy token từ localStorage hoặc context
            const token = localStorage.getItem('token'); 
            
            // Gọi API toggle like ở backend
            await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Cập nhật lại trạng thái trong danh sách posts
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    // Nếu người dùng đã thích, thì giảm like đi 1 và đổi trạng thái
                    if (post.is_liked_by_user) {
                        return {
                            ...post,
                            likes_count: parseInt(post.likes_count) - 1,
                            is_liked_by_user: false
                        };
                    } else {
                        // Ngược lại, tăng like lên 1 và đổi trạng thái
                        return {
                            ...post,
                            likes_count: parseInt(post.likes_count) + 1,
                            is_liked_by_user: true
                        };
                    }
                }
                return post;
            }));

        } catch (error) {
            console.error("Error toggling like:", error.response?.data?.error || error.message);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    // --- HÀM XỬ LÝ THÊM BÌNH LUẬN ---
    const handleAddComment = async (postId, content) => {
        if (!content.trim()) return; // Không gửi nếu bình luận trống

        try {
            const token = localStorage.getItem('token');
            
            // Gọi API thêm bình luận
            const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, { content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const newComment = response.data.comment; // Lấy bình luận mới từ response của API

            // Cập nhật lại trạng thái
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    // Thêm bình luận mới vào đầu danh sách bình luận của bài viết
                    return {
                        ...post,
                        comments: [newComment, ...(post.comments || [])]
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error("Error adding comment:", error.response?.data?.error || error.message);
            alert("Không thể thêm bình luận. Vui lòng thử lại.");
        }
    };

    return (
        <div className="feed-container">
            <InfiniteScroll
                dataLength={posts.length}
                next={fetchPosts}
                hasMore={hasMore}
                loader={<div className="text-center text-gray-500 py-4">Đang tải...</div>}
                endMessage={<div className="text-center text-gray-500 py-4">Bạn đã xem hết tất cả bài viết.</div>}
            >
                {posts.map(post => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        // Truyền các hàm xử lý xuống cho PostCard
                        onToggleLike={handleToggleLike} 
                        onAddComment={handleAddComment}
                    />  
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Feed;