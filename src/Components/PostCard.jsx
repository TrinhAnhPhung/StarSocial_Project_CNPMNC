// src/Components/PostCard.jsx
import React from 'react';

const PostCard = ({ post }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold text-white">{post.user}</h2>
            <p className="text-gray-300 mt-2">{post.content}</p>
        </div>
    );
};

export default PostCard;
