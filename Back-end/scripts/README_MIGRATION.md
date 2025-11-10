# Hướng dẫn Migration Ảnh lên Cloudinary

## Mô tả
Script này sẽ upload tất cả ảnh từ thư mục `uploads/` lên Cloudinary và cập nhật database để thay thế đường dẫn local bằng URL Cloudinary.

## Yêu cầu
1. File `.env` trong thư mục `Back-end` phải có các biến môi trường:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. Đảm bảo đã cài đặt các package cần thiết:
   ```bash
   npm install
   ```

## Cách chạy

### Windows (PowerShell)
```powershell
cd Back-end
node scripts/migrateImagesToCloudinary.js
```

### Linux/Mac
```bash
cd Back-end
node scripts/migrateImagesToCloudinary.js
```

## Quá trình Migration

Script sẽ:
1. ✅ Lấy danh sách tất cả ảnh/video từ database (ImageContent, VideoContent, Users)
2. ✅ Đọc tất cả file trong thư mục `uploads/`
3. ✅ Upload từng file lên Cloudinary với cấu trúc:
   - Profile pictures: `profiles/{user_id}/avatar`
   - Post images: `posts/images/{content_id}_{filename}`
   - Post videos: `posts/videos/{content_id}_{filename}`
4. ✅ Cập nhật URL trong database với URL Cloudinary mới

## Lưu ý
- Script sẽ **KHÔNG** xóa file trong thư mục `uploads/` sau khi migration
- Nếu file không tồn tại trong thư mục `uploads/`, script sẽ bỏ qua và báo lỗi
- Script sẽ hiển thị tiến trình và tóm tắt kết quả sau khi hoàn tất

## Xử lý lỗi
Nếu gặp lỗi:
1. Kiểm tra file `.env` có đúng thông tin Cloudinary không
2. Kiểm tra kết nối database
3. Kiểm tra thư mục `uploads/` có tồn tại và có quyền đọc không

