# Hướng dẫn cập nhật mật khẩu cho tài khoản Admin và HandleReport

## 📋 Tình trạng hiện tại

Từ database, bạn đã có:
- **Tài khoản Admin**: `admin@gmail.com` (hoặc email khác có role = 'admin')
- **Tài khoản HandleReport**: Có role = 'handle report' hoặc 'handlereport'

## 🚀 Cách 1: Sử dụng Node.js Script (KHUYẾN NGHỊ)

### Bước 1: Mở terminal/PowerShell
```bash
cd StarSocial-Community\Back-end
```

### Bước 2: Chạy script
```bash
node scripts\updateAllAdminPasswords.js
```

Script sẽ:
- ✅ Tìm tất cả tài khoản có role = 'admin'
- ✅ Tìm tất cả tài khoản có role = 'handlereport' hoặc 'handle report'
- ✅ Cập nhật mật khẩu cho tất cả các tài khoản này
- ✅ Hiển thị danh sách tài khoản và mật khẩu

### Thông tin đăng nhập sau khi chạy script:
- **Admin**: Email từ database / Password: `admin123`
- **HandleReport**: Email từ database / Password: `handlereport123`

---

## 🔧 Cách 2: Sử dụng API

### Cập nhật mật khẩu cho một tài khoản cụ thể:
```bash
POST http://localhost:5000/api/auth/update-admin-password
Headers:
  Content-Type: application/json
  X-Admin-Secret: admin_secret_key_2024
Body:
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

### Cập nhật mật khẩu cho TẤT CẢ tài khoản Admin:
```bash
POST http://localhost:5000/api/auth/update-all-admin-passwords
Headers:
  Content-Type: application/json
  X-Admin-Secret: admin_secret_key_2024
Body:
{
  "role": "admin",
  "password": "admin123"
}
```

### Cập nhật mật khẩu cho TẤT CẢ tài khoản HandleReport:
```bash
POST http://localhost:5000/api/auth/update-all-admin-passwords
Headers:
  Content-Type: application/json
  X-Admin-Secret: admin_secret_key_2024
Body:
{
  "role": "handlereport",
  "password": "handlereport123"
}
```

---

## 📝 Cách 3: Sử dụng Postman

1. **Method**: POST
2. **URL**: `http://localhost:5000/api/auth/update-all-admin-passwords`
3. **Headers**:
   - `Content-Type: application/json`
   - `X-Admin-Secret: admin_secret_key_2024`
4. **Body** (raw JSON):
```json
{
  "role": "admin",
  "password": "admin123"
}
```

---

## ✅ Sau khi cập nhật

### Đăng nhập Admin:
1. Mở trình duyệt: `http://localhost:5173/login`
2. Nhập email của tài khoản admin (ví dụ: `admin@gmail.com`)
3. Nhập mật khẩu: `admin123`
4. Sau khi đăng nhập, sẽ tự động chuyển đến: `http://localhost:5173/admin`

### Đăng nhập HandleReport:
1. Mở trình duyệt: `http://localhost:5173/login`
2. Nhập email của tài khoản handlereport
3. Nhập mật khẩu: `handlereport123`
4. Sau khi đăng nhập, sẽ tự động chuyển đến: `http://localhost:5173/processor`

---

## 🔒 Bảo mật

1. **Đổi mật khẩu**: Sau khi đăng nhập, vui lòng đổi mật khẩu ngay!
2. **Secret Key**: Đổi `ADMIN_SECRET_KEY` trong file `.env`:
   ```
   ADMIN_SECRET_KEY=your_super_secret_key_here
   ```
3. **Production**: Trong môi trường production, nên xóa hoặc bảo vệ các endpoint này bằng IP whitelist.

---

## 🆘 Khắc phục sự cố

### Lỗi: "Cannot find module"
- Đảm bảo đang ở thư mục `StarSocial-Community\Back-end`
- Chạy: `npm install` để cài đặt dependencies

### Lỗi: "Connection refused"
- Đảm bảo database đang chạy
- Kiểm tra file `src/Config/SqlConnection.js`

### Lỗi: "Email không tồn tại"
- Kiểm tra lại email trong database
- Chạy query: `SELECT Email, Role FROM Users WHERE Role = 'admin' OR Role = 'handlereport'`

---

## 📞 Liên hệ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Database connection
2. File `.env` có đúng không
3. Script có được chạy từ đúng thư mục không

