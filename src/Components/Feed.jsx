// src/Components/Feed.jsx
import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [openCommentInputId, setOpenCommentInputId] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
    const [expandedPosts, setExpandedPosts] = useState({}); // Theo dõi trạng thái xem thêm của bài viết
    const [blazedPosts, setBlazedPosts] = useState({}); // Theo dõi bài viết đã thả lửa

    const fetchPosts = () => {
        const now = Date.now();
        const newPosts = [
            {
                id: now + 1,
                user: 'Trịnh Anh Phụng',
                username: 'Trịnh Anh Phụng',
                avatarUrl: './src/assets/phung.jpg',
                content: 'Ở bên cạnh người thương cũng khiến bạn kiệt sức?Luôn tồn tại một loại cảm giác mệt mỏi, không đến từ công việc hay học tập, mà len lỏi trong những mối quan hệ. Không cãi vã, không mâu thuẫn, nhưng vẫn thấy mệt. Không còn cảm hứng để kết nối, không còn năng lượng để vun đắp. Đó chính là một trạng thái burnout trong mối quan hệ. Vậy điều gì dẫn đến burnout trong mối quan hệ? Và chúng ta nên đối diện ra sao? 👇🏻\n\nMột vài dòng nữa để minh họa cho việc rút gọn văn bản.',
                hashtags: ['#Vietcetera'],
                imageUrl: 'https://byvn.net/3DUp',
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
                username: 'Đặng Thị Thu Hà',
                avatarUrl: 'https://byvn.net/MWcy',
                content: 'canh khổ qua mẹ nấu chê đắng bước ra đường ngậm đắng nuốt cay🥹',
                hashtags: ['#react', '#js', '#programming'],
                imageUrl: 'https://byvn.net/MJ4F',
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
                username: 'Mai Anh Tài',
                avatarUrl: 'https://byvn.net/2mmR',
                content: 'Pha "nâng niu" cổ đầy tình cảm của Indonesia dành cho Đình Bắc 😢',
                hashtags: ['#art', '#thelastofus', '#animation', '#911abc', '#artists on tumblr', '#artwork', '#questions', '#top10'],
                imageUrl: 'https://byvn.net/B6N1',
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

    const handleFollowToggle = (postId) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId ? { ...post, isFollowed: !post.isFollowed } : post
            )
        );
    };

    const toggleContent = (postId) => {
        setExpandedPosts({ ...expandedPosts, [postId]: !expandedPosts?.[postId] });
    };

    const handleActionClick = (postId, actionType) => {
        console.log(`Bài viết ${postId}: Hành động ${actionType}`);
        if (actionType === 'blaze') {
            if (!blazedPosts?.[postId]) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, notes: post.notes + 1 } : post
                    )
                );
                setBlazedPosts({ ...blazedPosts, [postId]: true });
            } else {
                console.log('Bạn đã thả lửa cho bài viết này rồi.');
            }
        } else if (actionType === 'comment') {
            setOpenCommentInputId(openCommentInputId === postId ? null : postId);
            setNewCommentText('');
        }
    };

    const handlePostMenuToggle = (postId) => {
        setOpenMenuId(openMenuId === postId ? null : postId);
    };

    const handlePostMenuItemClick = (postId, action) => {
        console.log(`Bài viết ${postId}: Chọn '${action}'`);
        setOpenMenuId(null);

        if (action === 'report') {
            alert(`Bạn đã báo cáo bài viết của ${posts.find(p => p.id === postId)?.user}`);
        } else if (action === 'hide') {
            setPosts(posts.filter(post => post.id !== postId));
            alert(`Bạn đã chọn không quan tâm bài viết này.`);
        }
    };

    const handleAddComment = (postId, currentUserAvatar, currentUsername) => {
        if (!newCommentText.trim()) return;

        const newComment = {
            id: Date.now(),
            user: currentUsername,
            avatarUrl: currentUserAvatar,
            time: 'Just now',
            text: newCommentText.trim(),
            originalPoster: false,
            replies: [],
        };

        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? { ...post, comments: [...post.comments, newComment] }
                    : post
            )
        );
        setNewCommentText('');
        setOpenCommentInputId(null);
    };

    const handleCommentMenuToggle = (commentId) => {
        setOpenCommentMenuId(openCommentMenuId === commentId ? null : commentId);
    };

    const handleCommentMenuItemClick = (commentId, action) => {
        console.log(`Bình luận ${commentId}: Chọn '${action}'`);
        setOpenCommentMenuId(null);

        if (action === 'reply') {
            alert(`Bạn đã chọn trả lời bình luận ${commentId}`);
        } else if (action === 'report-comment') {
            alert(`Bạn đã báo cáo bình luận ${commentId}`);
        }
    };

    const currentUser = {
        username: 'phung1123',
        avatarUrl: 'https://i.pravatar.cc/40?img=4'
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const MAX_CONTENT_LENGTH = 200; // Số ký tự tối đa trước khi rút gọn

    return (
        <div className="bg-white p-4 max-w-xl mx-auto rounded-lg shadow-md">
            <InfiniteScroll
                dataLength={posts.length}
                next={fetchPosts}
                hasMore={hasMore}
                loader={<div className="text-center text-gray-500 py-4">Đang tải...</div>}
                endMessage={<div className="text-center text-gray-500 py-4">Bạn đã xem hết tất cả bài viết.</div>}
            >
                {posts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 relative">
                        <div className="flex items-center justify-between p-4 pb-0">
                            <div className="flex items-center space-x-3">
                                <Link to={`/profile/${post.username}`} className="flex items-center space-x-3 cursor-pointer">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                                        <img src={post.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{post.username}</p>
                                        <p className="text-sm text-gray-500">{post.time}</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="flex items-center space-x-2">
                                {!post.isFollowed && (
                                    <button
                                        onClick={() => handleFollowToggle(post.id)}
                                        className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors cursor-pointer"
                                    >
                                        Follow
                                    </button>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={() => handlePostMenuToggle(post.id)}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
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

                        {/* Nội dung bài đăng */}
                        {post.content && (
                            <div className="px-4 mt-4">
                                {expandedPosts?.[post.id] || post.content.length <= MAX_CONTENT_LENGTH ? (
                                    <p className="text-lg text-gray-800 whitespace-pre-line">{post.content}</p>
                                ) : (
                                    <p className="text-lg text-gray-800 whitespace-pre-line">
                                        {post.content.slice(0, MAX_CONTENT_LENGTH)}...
                                        <button onClick={() => toggleContent(post.id)} className="text-black font-semibold ml-1 cursor-pointer">
                                            Xem thêm
                                        </button>
                                    </p>
                                )}
                                {post.content.length > MAX_CONTENT_LENGTH && expandedPosts?.[post.id] && (
                                    <button onClick={() => toggleContent(post.id)} className="text-black font-semibold mt-1 block cursor-pointer">
                                        Ẩn bớt
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mt-4">
                            <img
                                src={post.imageUrl}
                                alt="Post"
                                className="w-full object-cover"
                            />
                        </div>

                        {post.siteUrl && (
                            <a href={`https://${post.siteUrl}`} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-b-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">{post.siteUrl}</span>
                                    <span className="material-icons text-gray-500">chevron_right</span>
                                </div>
                            </a>
                        )}

                        <div className="text-sm text-gray-600 flex flex-wrap gap-2 px-4 mt-4">
                            {post.hashtags.map((tag, index) => (
                                <Link key={index} to={`/hashtags/${tag.substring(1)}`} className="hover:underline">
                                    {tag}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-gray-500 px-4 py-3 border-t border-gray-200 mt-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => handleActionClick(post.id, 'blaze')}
                                    className={`flex items-center space-x-1 cursor-pointer ${blazedPosts?.[post.id] ? 'text-red-500' : 'hover:text-red-500'}`}
                                    disabled={blazedPosts?.[post.id]}
                                >
                                    <span className="material-icons text-xl">local_fire_department</span>
                                    <span className="font-semibold">{post.notes}</span>
                                </button>
                            </div>
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={() => handleActionClick(post.id, 'comment')}
                                    className="hover:text-gray-800 cursor-pointer"
                                >
                                    <span className="material-icons text-xl">chat_bubble_outline</span>
                                </button>
                                <button
                                    onClick={() => handleActionClick(post.id, 'share')}
                                    className="hover:text-gray-700 cursor-pointer"
                                >
                                    <span className="material-icons text-xl">share</span>
                                </button>
                                <button className="hover:text-gray-800">
                                    <span className="material-icons text-xl cursor-pointer">bookmark_border</span>
                                </button>
                            </div>
                        </div>

                        {openCommentInputId === post.id && (
                            <div className="mt-6 border-t border-gray-200 pt-4 px-4 text-gray-800">
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
                                        >
                                            <span className="material-icons text-base">send</span>
                                        </button>
                                    </div>
                                </div>

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
                                            <div className="relative">
                                                <button
                                                    onClick={() => handleCommentMenuToggle(comment.id)}
                                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="material-icons text-base">more_horiz</span>
                                                </button>
                                                {openCommentMenuId === comment.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20 text-gray-800 cursor-pointer">
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