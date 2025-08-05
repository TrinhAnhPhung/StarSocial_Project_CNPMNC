import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditPostPage = () => {
  const { postId } = useParams(); // Lấy postId từ URL
  const navigate = useNavigate();
  
  // Giả lập dữ liệu bài viết
  const [post, setPost] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu bài viết dựa trên postId
    // Dữ liệu giả lập
    const fetchPostData = async () => {
      // Giả lập một bài viết với postId
      const mockPost = {
        id: postId,
        author: 'Trinh Anh Phung',
        content: 'This is cool dog :)',
        image: 'https://...',
      };
      setPost(mockPost);
      setEditedContent(mockPost.content);
    };

    fetchPostData();
  }, [postId]);

  const handleSave = () => {
    // Logic lưu bài viết đã chỉnh sửa
    console.log(`Đã lưu bài viết ${postId} với nội dung mới: ${editedContent}`);
    // Sau khi lưu, điều hướng về trang chủ hoặc trang chi tiết bài viết
    navigate('/'); 
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sửa bài viết của {post.author}</h1>
      <textarea
        className="w-full p-4 border rounded-lg h-40 resize-none"
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
      />
      <div className="flex justify-end gap-4 mt-4">
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2 rounded-lg text-gray-700 border hover:bg-gray-100"
        >
          Hủy
        </button>
        <button 
          onClick={handleSave} 
          className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          Lưu
        </button>
      </div>
    </div>
  );
};

export default EditPostPage;