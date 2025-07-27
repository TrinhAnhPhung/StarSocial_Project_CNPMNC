import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ userId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [postContent, setPostContent] = useState("");
    const [location, setLocation] = useState("");
    const [isReadyToShare, setIsReadyToShare] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                setIsReadyToShare(true);
            } else {
                alert("Please drop an image file.");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                setIsReadyToShare(true);
            } else {
                alert("Please select an image file.");
            }
        }
    };

    const handleButtonClick = () => {
        document.getElementById('file-upload-input').click();
    };

    const handleSharePost = async () => {
        if (!selectedFile) {
            alert("Please select an image.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("user_id", userId || 1); // Default user_id = 1 for now
            formData.append("caption", postContent);
            formData.append("location", location);
            formData.append("image", selectedFile);

            const res = await axios.post("http://localhost:5000/api/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Post shared successfully!");
            console.log("Post response:", res.data);

            // Reset state after successful post
            setSelectedFile(null);
            setPostContent("");
            setLocation("");
            setIsReadyToShare(false);
        } catch (err) {
            console.error("Error sharing post:", err);
            alert("An error occurred while sharing the post!");
        }
    };

    return (
        <div className="bg-gray-200 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">

                {isReadyToShare ? (
                    <>
                        {/* Header */}
                        <div className="bg-gray-300 text-gray-700 py-3 text-center text-lg font-semibold border-b border-gray-400 flex justify-between items-center px-4">
                            <button
  onClick={() => {
    setIsReadyToShare(false);
    setSelectedFile(null);
  }}
  className="text-blue-600 hover:underline font-normal text-base cursor-pointer"
>
  <span className="material-icons text-3xl hover:text-blue-700">arrow_back</span>
</button>

                            <p>Create new post</p>
                            <button
                                onClick={handleSharePost}
                                className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 cursor-pointer"
                            >
                                Share
                            </button>
                        </div>

                        {/* Post Content */}
                        <div className="p-4 flex flex-col gap-4">
                            {selectedFile && (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Selected preview"
                                    className="rounded-lg max-h-[200px] object-contain"
                                />
                            )}

                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="Write a caption..."
                                className="w-full border border-gray-300 rounded-lg p-2 resize-none"
                                rows={4}
                            ></textarea>

                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Add location..."
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white text-gray-700 py-3 text-center text-lg font-semibold border-b border-gray-400">
                            Create new post
                        </div>

                        {/* Drag and Drop or Select Image */}
                        <div
                            className={`
                                flex flex-col items-center justify-center p-8 text-center
                                ${isDragging ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-300'}
                                border-2 border-dashed rounded-b-lg min-h-[300px]
                                transition-colors duration-200 ease-in-out
                            `}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <svg className="w-24 h-24 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-4 4 4 4-4v4zm-4-6a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                                <path d="M10 11a1 1 0 100-2 1 1 0 000 2z"></path>
                            </svg>
                            <p className="text-xl font-semibold text-gray-700 mb-6">Drag photo here</p>
                            <button
                                onClick={handleButtonClick}
                                className="bg-blue-600 text-white px-6 py-3 cursor-pointer rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                            >
                                Select from computer
                            </button>
                            <input
                                type="file"
                                id="file-upload-input"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreatePost;