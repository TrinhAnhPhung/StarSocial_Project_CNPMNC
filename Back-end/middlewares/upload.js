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

// 4. Hàm helper để upload file buffer lên Cloudinary
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

export { upload, uploadToCloudinary };
