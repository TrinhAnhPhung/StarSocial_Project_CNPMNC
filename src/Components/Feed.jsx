// src/Components/Feed.jsx
import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null); // Menu cho bài viết (3 chấm)
    const [openCommentInputId, setOpenCommentInputId] = useState(null); // ID bài viết đang mở khung bình luận
    const [newCommentText, setNewCommentText] = useState(''); // Text của bình luận mới
    const [openCommentMenuId, setOpenCommentMenuId] = useState(null); // Menu cho bình luận (3 chấm)

    // Hàm tạo dữ liệu giả (mock data)
    const fetchPosts = () => {
  const now = Date.now();
  const newPosts = [
    {
      id: now + 1,
      user: 'Trịnh Anh Phụng',
      username: 'trinhanhphung',
      avatarUrl: './src/assets/phung.jpg',
      content: 'This is cool dog =)',
      hashtags: ['#DogVietNam', '#cuteanimals'],
      imageUrl: 'https://nqs.1cdn.vn/2024/12/03/static-images.vnncdn.net-vps_images_publish-000001-000003-2024-12-3-_thucung-99151.jpg',
      time: '29 minutes ago',
      location: 'VietNam',
      isFollowed: false,
      notes: 25,
      siteUrl: 'https://sites.google.com/view/cool-dogs-vietnam',
      comments: [
        {
          id: now + 101,
          user: 'headlessgrasshopper',
          avatarUrl: 'https://i.pravatar.cc/40?img=1',
          time: 'Jun 10',
          text: 'Us?',
          originalPoster: false,
          replies: [],
        },
        {
          id: now + 102,
          user: 'lithiumlocket',
          avatarUrl: 'https://i.pravatar.cc/40?img=2',
          time: 'Jun 10',
          text: 'Us and our future pigeon',
          originalPoster: true,
          replies: [],
        },
        {
          id: now + 103,
          user: 'headlessgrasshopper',
          avatarUrl: 'https://i.pravatar.cc/40?img=1',
          time: 'Jun 10',
          text: '@lithiumlocket Feather son',
          originalPoster: false,
          replies: [],
        },
      ],
    },
    {
      id: now + 2,
      user: 'Lâm Hào',
      username: 'anapablova',
      avatarUrl: './src/assets/hao.jpg',
      content: 'Exploring React!',
      hashtags: ['#react', '#js', '#programming'],
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2Iz9mckJDTXHMXi40FtIvXYve21eg0rUBEg&s',
      time: '1 hour ago',
      location: 'USA',
      isFollowed: true,
      notes: 120,
      siteUrl: 'https://react.dev',
      comments: [],
    },
    {
      id: now + 3,
      user: 'Nguyễn Nguyên',
      username: 'alomgir244',
      avatarUrl: 'http://googleusercontent.com/file_content/0',
      content: '',
      hashtags: ['#art', '#thelastofus', '#animation', '#911abc', '#artists on tumblr', '#artwork', '#questions', '#top10'],
      imageUrl: 'http://googleusercontent.com/file_content/0',
      time: '2d',
      location: 'Somewhere',
      isFollowed: false,
      notes: 0,
      siteUrl: 'sites.google.com',
      comments: [
        {
          id: now + 104,
          user: 'ichigomilktea',
          avatarUrl: 'https://i.pravatar.cc/40?img=3',
          time: 'Jun 29',
          text: 'SPY x FAMILY?',
          originalPoster: false,
          replies: [],
        },
      ],
    },
  ];

  setTimeout(() => {
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    if (posts.length + newPosts.length >= 10) {
      setHasMore(false);
    }
  }, 500);
};

    // Hàm xử lý khi nhấn nút Follow
    const handleFollowToggle = (postId) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId ? { ...post, isFollowed: !post.isFollowed } : post
            )
        );
    };

    // Hàm xử lý khi nhấn các nút tương tác (Blaze, comment, share, repost)
    const handleActionClick = (postId, actionType) => {
        console.log(`Bài viết ${postId}: Hành động ${actionType}`);
        if (actionType === 'blaze') {
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId ? { ...post, notes: post.notes + 1 } : post
                )
            );
        } else if (actionType === 'comment') {
            setOpenCommentInputId(openCommentInputId === postId ? null : postId); // Bật/tắt khung bình luận
            setNewCommentText(''); // Reset text input khi mở
        }
    };

    // Hàm xử lý khi click vào icon 3 chấm của bài viết
    const handlePostMenuToggle = (postId) => {
        setOpenMenuId(openMenuId === postId ? null : postId);
    };

    // Hàm xử lý khi chọn một tùy chọn trong menu bài viết
    const handlePostMenuItemClick = (postId, action) => {
        console.log(`Bài viết ${postId}: Chọn '${action}'`);
        setOpenMenuId(null); // Đóng menu sau khi chọn

        if (action === 'report') {
            alert(`Bạn đã báo cáo bài viết của ${posts.find(p => p.id === postId)?.user}`);
            // Gửi yêu cầu báo cáo lên server
        } else if (action === 'hide') {
            setPosts(posts.filter(post => post.id !== postId));
            alert(`Bạn đã chọn không quan tâm bài viết này.`);
        }
    };

    // Hàm gửi bình luận mới
    const handleAddComment = (postId, currentUserAvatar, currentUsername) => { // Thêm avatar và username của người dùng hiện tại
        if (!newCommentText.trim()) return; // Không gửi bình luận rỗng

        const newComment = {
            id: Date.now(), // ID duy nhất
            user: currentUsername, // Tên người dùng hiện tại
            avatarUrl: currentUserAvatar, // Avatar người dùng hiện tại
            time: 'Just now', // Thời gian bình luận
            text: newCommentText.trim(),
            originalPoster: false, // Giả định người bình luận không phải OP
            replies: [],
        };

        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? { ...post, comments: [...post.comments, newComment] }
                    : post
            )
        );
        setNewCommentText(''); // Xóa nội dung input
        setOpenCommentInputId(null); // Đóng khung bình luận sau khi gửi
    };

    // Hàm xử lý khi click vào icon 3 chấm của bình luận
    const handleCommentMenuToggle = (commentId) => {
        setOpenCommentMenuId(openCommentMenuId === commentId ? null : commentId);
    };

    // Hàm xử lý khi chọn một tùy chọn trong menu bình luận
    const handleCommentMenuItemClick = (commentId, action) => {
        console.log(`Bình luận ${commentId}: Chọn '${action}'`);
        setOpenCommentMenuId(null); // Đóng menu sau khi chọn

        if (action === 'reply') {
            alert(`Bạn đã chọn trả lời bình luận ${commentId}`);
            // TODO: Triển khai logic trả lời bình luận (ví dụ: mở khung nhập với @username)
        } else if (action === 'report-comment') {
            alert(`Bạn đã báo cáo bình luận ${commentId}`);
            // TODO: Gửi yêu cầu báo cáo bình luận lên server
        }
    };

    // Dữ liệu người dùng hiện tại (giả định) để hiển thị trong khung bình luận
    const currentUser = {
        username: 'phung1123',
        avatarUrl: 'https://i.pravatar.cc/40?img=4' // Avatar của người dùng đang đăng nhập
    };


    // Lấy dữ liệu ban đầu
    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="bg-white p-4 max-w-xl mx-auto rounded-lg shadow-md"> {/* Điều chỉnh nền và shadow tổng thể */}
            <InfiniteScroll
                dataLength={posts.length}
                next={fetchPosts}
                hasMore={hasMore}
                loader={<div className="text-center text-gray-500 py-4">Đang tải...</div>}
                endMessage={<div className="text-center text-gray-500 py-4">Bạn đã xem hết tất cả bài viết.</div>}
            >
                {posts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 relative"> {/* Điều chỉnh nền, border, và shadow cho từng bài viết */}
                        {/* Header bài đăng: Avatar, User Info, Follow/Options */}
                        <div className="flex items-center justify-between p-4 pb-0"> {/* padding cho header */}
                            <div className="flex items-center space-x-3">
                                <Link to={`/profile/${post.username}`} className="flex items-center space-x-3 cursor-pointer">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                                        <img src={post.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{post.username}</p> {/* Hiển thị username thay vì user */}
                                        <p className="text-sm text-gray-500">{post.time}</p>
                                    </div>
                                </Link>
                            </div>
                            {/* Nút Follow và icon 3 chấm */}
                            <div className="flex items-center space-x-2">
                                {!post.isFollowed && (
                                    <button
                                        onClick={() => handleFollowToggle(post.id)}
                                        className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors"
                                    >
                                        Follow
                                    </button>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={() => handlePostMenuToggle(post.id)}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="material-icons text-xl">more_horiz</span>
                                    </button>
                                    {openMenuId === post.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 text-gray-800">
                                            <button
                                                onClick={() => handlePostMenuItemClick(post.id, 'report')}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            >
                                                Báo cáo bài viết
                                            </button>
                                            <button
                                                onClick={() => handlePostMenuItemClick(post.id, 'hide')}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            >
                                                Không quan tâm
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nội dung bài đăng (nếu có) - ảnh mẫu không có text content */}
                        {post.content && <p className="text-lg text-gray-800 px-4 mt-4">{post.content}</p>}

                        {/* Hình ảnh */}
                        <div className="mt-4">
                            <img
                                src={post.imageUrl}
                                alt="Post"
                                className="w-full object-cover" // Bỏ rounded-lg nếu ảnh đã có góc vuông như trong hình
                            />
                            {/* Overlay 'ALT' tag */}
                            <div className="absolute bottom-[80px] left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-sm">
                                ALT
                            </div>
                        </div>

                        {/* URL Website */}
                        {post.siteUrl && (
                            <a href={`https://${post.siteUrl}`} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-b-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">{post.siteUrl}</span>
                                    <span className="material-icons text-gray-500">chevron_right</span>
                                </div>
                            </a>
                        )}

                        {/* Hashtags */}
                        <div className="text-sm text-gray-600 flex flex-wrap gap-2 px-4 mt-4">
                            {post.hashtags.map((tag, index) => (
                                <Link key={index} to={`/hashtags/${tag.substring(1)}`} className="hover:underline">
                                    {tag}
                                </Link>
                            ))}
                        </div>

                        {/* Thanh tương tác dưới cùng */}
                        <div className="flex items-center justify-between text-gray-500 px-4 py-3 border-t border-gray-200 mt-4">
                            <div className="flex items-center space-x-4">
                                {/* Blaze (Like) */}
                                <button
                                    onClick={() => handleActionClick(post.id, 'blaze')}
                                    className="flex items-center space-x-1 hover:text-red-500"
                                >
                                    <span className="material-icons text-xl">local_fire_department</span>
                                    <span className="font-semibold">{post.notes} notes</span> {/* Tăng độ đậm của số notes */}
                                </button>
                            </div>
                            <div className="flex items-center space-x-6">
                                {/* Comment */}
                                <button
                                    onClick={() => handleActionClick(post.id, 'comment')}
                                    className="hover:text-blue-500"
                                >
                                    <span className="material-icons text-xl">chat_bubble_outline</span>
                                </button>
                                {/* Repost */}
                                <button
                                    onClick={() => handleActionClick(post.id, 'repost')}
                                    className="hover:text-green-500"
                                >
                                    <span className="material-icons text-xl">repeat</span>
                                </button>
                                {/* Share */}
                                <button
                                    onClick={() => handleActionClick(post.id, 'share')}
                                    className="hover:text-purple-500"
                                >
                                    <span className="material-icons text-xl">share</span>
                                </button>
                                {/* Save (biểu tượng trái tim) */}
                                <button className="hover:text-red-500"> {/* Thêm nút trái tim */}
                                    <span className="material-icons text-xl">favorite_border</span>
                                </button>
                            </div>
                        </div>

                        {/* Khung bình luận - giữ nguyên logic */}
                        {openCommentInputId === post.id && (
                            <div className="mt-6 border-t border-gray-200 pt-4 px-4 text-gray-800">
                                {/* Input bình luận mới */}
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        <img src={currentUser.avatarUrl} alt="Your Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            placeholder={`Reply as @${currentUser.username}`}
                                            className="w-full p-2 pl-10 pr-10 rounded-full bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                                            alternate_email
                                        </span>
                                        <button
                                            onClick={() => handleAddComment(post.id, currentUser.avatarUrl, currentUser.username)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <span className="material-icons text-base">send</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Danh sách bình luận hiện có */}
                                <div className="space-y-4">
                                    {post.comments.map((comment) => (
                                        <div key={comment.id} className="flex space-x-3 relative">
                                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                                <img src={comment.avatarUrl} alt="Commenter Avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-semibold text-sm">{comment.user}</p>
                                                    {comment.originalPoster && (
                                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                                            Original Poster
                                                        </span>
                                                    )}
                                                    <p className="text-sm text-gray-500">{comment.time}</p>
                                                </div>
                                                <p className="text-sm mt-1">{comment.text}</p>
                                            </div>
                                            {/* Icon 3 chấm cho bình luận */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => handleCommentMenuToggle(comment.id)}
                                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="material-icons text-base">more_horiz</span>
                                                </button>

                                                {/* Dropdown Menu của bình luận */}
                                                {openCommentMenuId === comment.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20 text-gray-800">
                                                        <button
                                                            onClick={() => handleCommentMenuItemClick(comment.id, 'reply')}
                                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        >
                                                            Trả lời
                                                        </button>
                                                        <button
                                                            onClick={() => handleCommentMenuItemClick(comment.id, 'report-comment')}
                                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                        >
                                                            Báo cáo bình luận
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default Feed;