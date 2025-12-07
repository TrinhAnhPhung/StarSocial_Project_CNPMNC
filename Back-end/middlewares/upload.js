import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Cấu hình Multer với memory storage
const storage = multer.memoryStorage();

// Middleware upload single file
export const upload = multer({ storage }).single('profileImage');

// Middleware upload multiple files
export const uploadMultiple = multer({ storage }).array('media', 10);

// Upload profile picture lên Cloudinary
export const uploadToCloudinary = (fileBuffer, userId) => {
  return new Promise((resolve, reject) => {
    const public_id = `profiles/${userId}/avatar`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id,
        overwrite: true,
        format: 'jpg',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Upload post media lên Cloudinary
export const uploadPostToCloudinary = (fileBuffer, postId, isImage = true) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const folder = isImage ? 'posts/images' : 'posts/videos';
    const public_id = `post_${postId}_${timestamp}`;

    const uploadOptions = {
      folder,
      public_id,
      overwrite: false,
      resource_type: isImage ? 'image' : 'video'
    };

    console.log(`📤 Uploading to Cloudinary:`, { folder, public_id });

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error.message);
          return reject(error);
        }
        console.log(`✅ Upload success: ${result.secure_url}`);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
