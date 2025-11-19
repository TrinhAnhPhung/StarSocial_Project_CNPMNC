import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from './PostCard'; // Component này sẽ chứa giao diện của từng bài viết

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1); // Thêm state để quản lý trang cho infinite scroll
    const linkBackend = import.meta.env.VITE_Link_backend || 'http://localhost:5000';
    // Hàm lấy dữ liệu từ API
    const fetchPosts = async () => {
        try {
            // Thêm page vào query để backend biết cần tải trang nào
                        const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${linkBackend}/api/posts?page=${page}`, { headers });
            console.log('Posts fetched from API:', response.data);

            if (response.data.length > 0) {
                // Loại bỏ posts trùng lặp dựa trên ID
                setPosts((prevPosts) => {
                    const existingIds = new Set(prevPosts.map(p => p.id));
                    const newPosts = response.data.filter(p => !existingIds.has(p.id));
                    return [...prevPosts, ...newPosts];
                });
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
        
    }, []);

    useEffect(() => {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#post-')) {
    const elementId = hash.substring(1); // bỏ dấu #
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}, [posts]);



    const handlePostUpdate = (updatedPost) => {
        setPosts(prevPosts => 
            prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
        );
    };

    return (
        <div className="feed-container w-full max-w-2xl mx-auto px-2 sm:px-4 pb-16 md:pb-4">
            <InfiniteScroll
                dataLength={posts.length}
                next={fetchPosts}
                hasMore={hasMore}
                loader={<div className="text-center text-gray-500 py-4">Đang tải...</div>}
                endMessage={<div className="text-center text-gray-500 py-4">Bạn đã xem hết tất cả bài viết.</div>}
            >
                {posts.map((post, index) => (
                    <div
                        key={`post-${post.id}-${index}`}
                        id={`post-${post.id}`}
                    >
                        <PostCard
                            post={post}
                            onPostChange={handlePostUpdate} // Pass the new handler
                            onPostDeleted={(deletedPostId) => {
                                setPosts(posts.filter(p => p.id !== deletedPostId));
                            }}
                            onPostUpdated={(postId, updatedPost) => {
                                setPosts(posts.map(p =>
                                    p.id === postId ? { ...p, ...updatedPost } : p
                                ));
                            }}
                        />
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Feed;