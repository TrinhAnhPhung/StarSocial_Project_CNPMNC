import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from './PostCard';  // Đảm bảo rằng bạn đã import PostCard

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    
    // Hàm lấy dữ liệu từ API
   const fetchPosts = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/posts"); // Gọi API để lấy bài viết
        console.log('Posts fetched from API:', response.data);  // Debugging: Xem dữ liệu trả về từ API

        if (response.data.length > 0) {
            setPosts((prevPosts) => [...prevPosts, ...response.data]);  // Cập nhật danh sách bài viết
        } else {
            setHasMore(false);  // Nếu không còn bài viết, dừng việc tải thêm
        }
    } catch (err) {
        console.error("Error fetching posts:", err);
    }
};

    useEffect(() => {
        fetchPosts();  // Lấy bài viết khi trang được tải
    }, []);

    return (
        <div className="feed-container">
            <InfiniteScroll
                dataLength={posts.length}
                next={fetchPosts}  // Gọi lại fetchPosts khi cần tải thêm bài viết
                hasMore={hasMore}
                loader={<div className="text-center text-gray-500 py-4">Đang tải...</div>}
                endMessage={<div className="text-center text-gray-500 py-4">Bạn đã xem hết tất cả bài viết.</div>}
            >
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />  
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Feed;
