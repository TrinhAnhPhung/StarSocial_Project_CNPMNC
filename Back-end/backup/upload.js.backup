import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// 1. Cấu hình Cloudinary (lấy từ file .env)
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Luôn dùng https
});

// 2. Cấu hình Multer để dùng bộ nhớ tạm (MemoryStorage)
// Chúng ta không lưu file vào server, mà gửi thẳng lên Cloudinary
const storage = multer.memoryStorage();

// 3. Khởi tạo middleware multer
// 'profileImage' là tên của trường (field name) mà frontend sẽ gửi
const upload = multer({ storage: storage }).single('profileImage');

// 4. Hàm helper để upload file buffer lên Cloudinary (cho profile picture)
const uploadToCloudinary = (fileBuffer, userId) => {
    return new Promise((resolve, reject) => {
        
        // Tạo một thư mục trên Cloudinary dựa trên UserID
        const public_id = `profiles/${userId}/avatar`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: public_id,
                overwrite: true, // Ghi đè ảnh cũ
                format: "jpg", // Tự động chuyển đổi sang jpg
                transformation: [ // Tự động resize ảnh
                    { width: 400, height: 400, crop: "fill", gravity: "face" }
                ]
            }, 
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result); // Trả về kết quả (chứa secure_url)
            }
        );

        // Gửi file buffer vào stream
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// 5. Hàm helper để upload file buffer lên Cloudinary (cho posts - ảnh/video)
const uploadPostToCloudinary = (fileBuffer, postId, isImage = true) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const folder = isImage ? 'posts/images' : 'posts/videos';
        // public_id chỉ chứa tên file, không bao gồm folder
        // Loại bỏ ký tự đặc biệt để tránh lỗi
        const public_id = `post_${postId}_${timestamp}`;

        // Cấu hình upload đơn giản - Cloudinary tự động phát hiện format và tối ưu
        const uploadOptions = {
            folder: folder,
            public_id: public_id,
            overwrite: false,
            resource_type: isImage ? 'image' : 'video',
            // Không dùng transformation khi upload, chỉ upload file gốc
        };

        console.log(`📤 Cloudinary upload options:`, {
            folder: uploadOptions.folder,
            public_id: uploadOptions.public_id,
            resource_type: uploadOptions.resource_type
        });

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions, 
            (error, result) => {
                if (error) {
                    console.error('❌ Lỗi khi upload lên Cloudinary:', {
                        message: error.message,
                        http_code: error.http_code,
                        name: error.name
                    });
                    return reject(error);
                }
                console.log(`✅ Upload thành công lên Cloudinary: ${result.secure_url}`);
                resolve(result); // Trả về kết quả (chứa secure_url)
            }
        );

        // Gửi file buffer vào stream
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

export { upload, uploadToCloudinary, uploadPostToCloudinary };
