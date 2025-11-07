import React, { useState, useEffect, useRef } from 'react';
// Thêm các icon cho phần tải ảnh
import { FaTimes, FaSpinner, FaCamera } from 'react-icons/fa';

const EditProfileModal = ({ isOpen, onClose, userProfile, onProfileUpdate, linkBackend }) => {
    if (!isOpen) return null;

    // State cho dữ liệu TEXT
    const [formData, setFormData] = useState({
        First_Name: '',
        Last_name: '',
        Description: '',
        Date_Of_Birth: ''
    });
    
    // State cho ẢNH
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // Dùng khi tải ảnh
    const [isLoading, setIsLoading] = useState(false); // Dùng khi lưu text
    
    const [error, setError] = useState('');
    
    // Ref cho input file ẩn
    const fileInputRef = useRef(null);

    // 1. Điền dữ liệu vào form (text VÀ ảnh)
    useEffect(() => {
        if (userProfile) {
            setFormData({
                First_Name: userProfile.First_Name || '',
                Last_name: userProfile.Last_name || '',
                Description: userProfile.bio || '',
                Date_Of_Birth: userProfile.Date_Of_Birth || '' 
            });
            // Set ảnh preview ban đầu là ảnh hiện tại
            setPreviewUrl(userProfile.Profile_Picture || null);
        }
    }, [userProfile, isOpen]);

    // 2. Cập nhật state (cho text)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Xử lý khi chọn file ảnh MỚI
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 3.1. Tạo preview ở local
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
        
        // 3.2. Tải ảnh lên ngay lập tức (API /picture)
        setIsUploading(true);
        setError('');

        const data = new FormData();
        data.append('profileImage', file); // Tên field phải khớp với multer

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${linkBackend}/api/profile/picture`, { // <-- API TẢI ẢNH
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Tải ảnh thất bại");
            }

            const updatedProfile = await response.json();
            
            // 3.3. Báo cho Profile.jsx cập nhật
            onProfileUpdate(updatedProfile); 
            // Cập nhật previewUrl bằng URL thật từ Cloudinary
            setPreviewUrl(updatedProfile.Profile_Picture); 

        } catch (err) {
            setError(err.message);
            setPreviewUrl(userProfile.Profile_Picture || null); // Quay lại ảnh cũ nếu lỗi
        } finally {
            setIsUploading(false);
        }
    };

    // 4. Gửi dữ liệu (CHỈ TEXT) (API /me)
    const handleSubmitText = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${linkBackend}/api/profile/me`, { // <-- API CẬP NHẬT TEXT
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData) 
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Cập nhật thất bại");
            }

            const updatedProfile = await response.json();
            
            // 5. Báo cho Profile.jsx cập nhật
            onProfileUpdate(updatedProfile); 
            onClose(); // Đóng modal

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0  bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-50 max-h-[90vh] overflow-y-auto border-2 border-gray-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Chỉnh sửa hồ sơ</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                {/* 6. Form cho Ảnh Đại Diện */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <img 
                            src={previewUrl || 'https://via.placeholder.com/150'}
                            alt="Xem trước"
                            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                        />
                        
                        {/* Lớp phủ loading */}
                        {isUploading && (
                            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                                <FaSpinner className="text-white animate-spin" size={30} />
                            </div>
                        )}
                        
                        {/* Nút bấm để mở input file */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                            className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 border-2 border-white"
                            title="Thay đổi ảnh đại diện"
                        >
                            <FaCamera />
                        </button>
                    </div>
                </div>
                
                {/* Input file ẩn */}
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />

                {/* 7. Form cho Text (Dùng handleSubmitText) */}
                <form onSubmit={handleSubmitText}>
                    <div className="mb-4">
                        <label className="block text-lg text-gray-600 mb-2">Họ</label>
                        <input 
                            type="text"
                            name="Last_name"
                            value={formData.Last_name}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-lg text-gray-600 mb-2">Tên</label>
                        <input 
                            type="text"
                            name="First_Name"
                            value={formData.First_Name}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg text-gray-600 mb-2">Ngày sinh</label>
                        <input 
                            type="date"
                            name="Date_Of_Birth"
                            value={formData.Date_Of_Birth}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg text-gray-600 mb-2">Tiểu sử (Bio)</label>
                        <textarea
                            name="Description"
                            value={formData.Description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full p-3 border rounded-lg"
                            placeholder="Viết gì đó về bạn..."
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-center mb-4">{error}</p>
                    )}

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isUploading} // Vô hiệu hóa nếu đang tải ảnh
                            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;

