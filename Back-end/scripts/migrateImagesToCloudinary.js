import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cloudinary = require('cloudinary').v2;
const { sql, connection } = require('../src/Config/SqlConnection.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env từ thư mục Back-end
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload một file lên Cloudinary
 */
const uploadFileToCloudinary = (filePath, publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            {
                public_id: publicId,
                overwrite: false,
                resource_type: 'auto' // Tự động phát hiện ảnh hoặc video
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
    });
};

/**
 * Lấy tất cả ảnh từ database cần migrate
 */
const getImagesFromDatabase = async () => {
    const pool = await connection();
    const images = [];
    
    // Lấy ảnh từ ImageContent
    const imageResult = await pool.request().query(`
        SELECT Content_id, ImageURL 
        FROM [ImageContent]
        WHERE ImageURL LIKE '/uploads/%' OR ImageURL LIKE 'uploads/%'
    `);
    
    for (const row of imageResult.recordset) {
        images.push({
            type: 'image',
            content_id: row.Content_id,
            url: row.ImageURL
        });
    }
    
    // Lấy video từ VideoContent
    const videoResult = await pool.request().query(`
        SELECT Content_id, VideoURL 
        FROM [VideoContent]
        WHERE VideoURL LIKE '/uploads/%' OR VideoURL LIKE 'uploads/%'
    `);
    
    for (const row of videoResult.recordset) {
        images.push({
            type: 'video',
            content_id: row.Content_id,
            url: row.VideoURL
        });
    }
    
    // Lấy ảnh profile từ Users (bao gồm cả URL localhost)
    const profileResult = await pool.request().query(`
        SELECT User_id, Profile_Picture 
        FROM [Users]
        WHERE (
            Profile_Picture LIKE '/uploads/%' 
            OR Profile_Picture LIKE 'uploads/%' 
            OR Profile_Picture LIKE 'http://localhost:%'
            OR Profile_Picture LIKE 'http://127.0.0.1:%'
        )
        AND Profile_Picture IS NOT NULL
        AND Profile_Picture NOT LIKE 'https://%'
    `);
    
    for (const row of profileResult.recordset) {
        images.push({
            type: 'profile',
            user_id: row.User_id,
            url: row.Profile_Picture
        });
    }
    
    return images;
};

/**
 * Cập nhật URL trong database
 */
const updateImageUrl = async (type, id, newUrl) => {
    const pool = await connection();
    
    if (type === 'image') {
        await pool.request()
            .input('content_id', sql.Int, id)
            .input('image_url', sql.VarChar(500), newUrl)
            .query('UPDATE [ImageContent] SET ImageURL = @image_url WHERE Content_id = @content_id');
    } else if (type === 'video') {
        await pool.request()
            .input('content_id', sql.Int, id)
            .input('video_url', sql.VarChar(500), newUrl)
            .query('UPDATE [VideoContent] SET VideoURL = @video_url WHERE Content_id = @content_id');
    } else if (type === 'profile') {
        await pool.request()
            .input('user_id', sql.VarChar(26), id)
            .input('profile_picture', sql.VarChar(500), newUrl)
            .query('UPDATE [Users] SET Profile_Picture = @profile_picture WHERE User_id = @user_id');
    }
};

/**
 * Main migration function
 */
const migrateImages = async () => {
    try {
        console.log('🚀 Bắt đầu migration ảnh lên Cloudinary...\n');
        
        // 1. Lấy danh sách ảnh từ database
        console.log('📋 Đang lấy danh sách ảnh từ database...');
        const images = await getImagesFromDatabase();
        console.log(`✅ Tìm thấy ${images.length} ảnh cần migrate\n`);
        
        if (images.length === 0) {
            console.log('✅ Không có ảnh nào cần migrate!');
            return;
        }
        
        // 2. Lấy danh sách file trong thư mục uploads
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const files = fs.readdirSync(uploadsDir);
        console.log(`📁 Tìm thấy ${files.length} file trong thư mục uploads\n`);
        
        // 3. Tạo mapping từ filename -> full path
        const fileMap = new Map();
        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            if (fs.statSync(filePath).isFile()) {
                fileMap.set(file, filePath);
            }
        }
        
        // 4. Upload từng ảnh
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            // Xử lý URL: loại bỏ /uploads/, uploads/, http://localhost:port/uploads/, etc.
            let filename = image.url
                .replace(/^https?:\/\/[^\/]+\/uploads\//, '') // http://localhost:5000/uploads/file.jpg
                .replace(/^https?:\/\/[^\/]+\/uploads/, '') // http://localhost:5000/uploads
                .replace(/^\/uploads\//, '') // /uploads/file.jpg
                .replace(/^uploads\//, '') // uploads/file.jpg
                .replace(/^\/uploads/, '') // /uploads
                .split('/').pop(); // Lấy tên file cuối cùng nếu còn path
            
            const filePath = fileMap.get(filename);
            
            if (!filePath) {
                console.log(`⚠️  [${i + 1}/${images.length}] Không tìm thấy file: ${filename} (từ URL: ${image.url})`);
                errorCount++;
                errors.push({ image, error: 'File not found' });
                continue;
            }
            
            try {
                // Tạo public_id dựa trên loại ảnh
                let publicId;
                if (image.type === 'profile') {
                    publicId = `profiles/${image.user_id}/avatar`;
                } else if (image.type === 'image') {
                    publicId = `posts/images/${image.content_id}_${filename.replace(/\.[^/.]+$/, '')}`;
                } else {
                    publicId = `posts/videos/${image.content_id}_${filename.replace(/\.[^/.]+$/, '')}`;
                }
                
                console.log(`📤 [${i + 1}/${images.length}] Đang upload: ${filename}...`);
                
                // Upload lên Cloudinary
                const result = await uploadFileToCloudinary(filePath, publicId);
                const cloudinaryUrl = result.secure_url;
                
                // Cập nhật database
                if (image.type === 'profile') {
                    await updateImageUrl('profile', image.user_id, cloudinaryUrl);
                } else {
                    await updateImageUrl(image.type, image.content_id, cloudinaryUrl);
                }
                
                console.log(`✅ [${i + 1}/${images.length}] Upload thành công: ${cloudinaryUrl}`);
                successCount++;
                
            } catch (error) {
                console.error(`❌ [${i + 1}/${images.length}] Lỗi khi upload ${filename}:`, error.message);
                errorCount++;
                errors.push({ image, error: error.message });
            }
        }
        
        // 5. Tóm tắt kết quả
        console.log('\n' + '='.repeat(50));
        console.log('📊 TÓM TẮT MIGRATION:');
        console.log(`✅ Thành công: ${successCount}`);
        console.log(`❌ Thất bại: ${errorCount}`);
        console.log('='.repeat(50));
        
        if (errors.length > 0) {
            console.log('\n⚠️  Các lỗi:');
            errors.forEach((err, idx) => {
                console.log(`${idx + 1}. ${err.image.url}: ${err.error}`);
            });
        }
        
        console.log('\n✅ Migration hoàn tất!');
        
    } catch (error) {
        console.error('❌ Lỗi nghiêm trọng trong quá trình migration:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
};

// Chạy migration
migrateImages();

