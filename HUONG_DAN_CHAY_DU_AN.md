# 📚 HƯỚNG DẪN CHẠY DỰ ÁN STAR SOCIAL

Hướng dẫn chi tiết cách chạy Backend, Website và Mobile App.

---

## 📋 YÊU CẦU HỆ THỐNG

### Phần mềm cần cài đặt:
1. **Node.js** (phiên bản 18 trở lên) - [Download](https://nodejs.org/)
2. **npm** (đi kèm với Node.js)
3. **SQL Server** - Đã cấu hình và chạy
4. **Expo CLI** (cho Mobile App) - Cài đặt: `npm install -g expo-cli`
5. **Git** (nếu clone từ repository)

---

## 🚀 CÁCH CHẠY DỰ ÁN

### Bước 1: Cài đặt Dependencies

#### 1.1. Cài đặt Backend Dependencies
```bash
cd Back-end
npm install
```

#### 1.2. Cài đặt Website Dependencies
```bash
# Từ thư mục root
npm install
```

#### 1.3. Cài đặt Mobile App Dependencies
```bash
cd AppMobile/AppMobile
npm install
```

---

### Bước 2: Cấu hình Backend

#### 2.1. Tạo file `.env` trong thư mục `Back-end/`

Tạo file `.env` với nội dung:
```env
# Database Configuration
DB_SERVER=your_server_name
DB_DATABASE=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_OPTIONS_ENCRYPT=true
DB_OPTIONS_TRUST_SERVER_CERTIFICATE=true

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Port
PORT=5000

# Client URL (cho email reset password)
CLIENT_URL=http://localhost:5173

# Email Configuration (nếu có)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### 2.2. Kiểm tra kết nối Database

Đảm bảo SQL Server đang chạy và thông tin kết nối trong `.env` là chính xác.

---

### Bước 3: Khởi chạy Backend

```bash
# Từ thư mục Back-end
cd Back-end
node index.js
```

**Hoặc sử dụng nodemon (nếu đã cài):**
```bash
nodemon index.js
```

**Kết quả mong đợi:**
```
🚀 Server (với Socket.io) đang chạy tại http://localhost:5000
```

> ⚠️ **Lưu ý:** Backend phải chạy trước khi khởi chạy Website hoặc Mobile App!

---

### Bước 4: Khởi chạy Website (Frontend)

#### 4.1. Tạo file `.env` trong thư mục root (nếu chưa có)

Tạo file `.env` với nội dung:
```env
VITE_Link_backend=http://localhost:5000
```

#### 4.2. Khởi chạy Website

```bash
# Từ thư mục root
npm run dev
```

**Kết quả mong đợi:**
```
  VITE v7.0.0  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Truy cập Website:**
- Mở trình duyệt và vào: `http://localhost:5173`

---

### Bước 5: Khởi chạy Mobile App

#### 5.1. Cấu hình API URL (nếu cần)

Mở file `AppMobile/AppMobile/constants/apiConfig.js`:

- **Đối với Emulator/Simulator:** Giữ nguyên `http://localhost:5000/api`
- **Đối với thiết bị thật:** Thay đổi thành IP của máy tính chạy backend:
  ```javascript
  // Ví dụ: API_BASE_URL = 'http://192.168.1.100:5000/api';
  ```

#### 5.2. Khởi chạy Mobile App

```bash
# Từ thư mục AppMobile/AppMobile
cd AppMobile/AppMobile
npm start
```

**Hoặc chạy trực tiếp trên thiết bị:**

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web (để test):**
```bash
npm run web
```

**Kết quả mong đợi:**
- Expo Dev Tools sẽ mở trên trình duyệt
- Quét QR code bằng Expo Go app (trên điện thoại) hoặc
- Nhấn `a` để mở Android Emulator
- Nhấn `i` để mở iOS Simulator

---

## 📱 CẤU HÌNH CHO THIẾT BỊ THẬT

### Để chạy Mobile App trên thiết bị thật:

1. **Tìm IP của máy tính:**
   - **Windows:** Mở Command Prompt và gõ `ipconfig`
   - **Mac/Linux:** Mở Terminal và gõ `ifconfig` hoặc `ip addr`

2. **Cập nhật API URL:**
   - Mở file `AppMobile/AppMobile/constants/apiConfig.js`
   - Thay đổi:
     ```javascript
     API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
     // Ví dụ: API_BASE_URL = 'http://192.168.1.100:5000/api';
     ```

3. **Đảm bảo Backend chấp nhận kết nối từ mạng local:**
   - Backend đã được cấu hình CORS để chấp nhận kết nối từ IP local
   - Đảm bảo Firewall không chặn port 5000

4. **Đảm bảo điện thoại và máy tính cùng mạng Wi-Fi**

---

## 🔧 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "Cannot connect to backend"
- ✅ Kiểm tra Backend có đang chạy không (port 5000)
- ✅ Kiểm tra file `.env` có đúng cấu hình không
- ✅ Kiểm tra Firewall có chặn port 5000 không
- ✅ Đối với thiết bị thật: Kiểm tra IP address và đảm bảo cùng mạng Wi-Fi

### Lỗi: "Database connection failed"
- ✅ Kiểm tra SQL Server có đang chạy không
- ✅ Kiểm tra thông tin kết nối trong file `.env`
- ✅ Kiểm tra SQL Server có cho phép kết nối từ xa không

### Lỗi: "CORS error"
- ✅ Backend đã được cấu hình CORS, nhưng nếu vẫn lỗi:
  - Kiểm tra file `Back-end/index.js` - phần cấu hình CORS
  - Đảm bảo origin của client được thêm vào ALLOWED_ORIGINS

### Lỗi: "Module not found"
- ✅ Chạy lại `npm install` trong thư mục tương ứng
- ✅ Xóa `node_modules` và `package-lock.json`, sau đó chạy lại `npm install`

### Lỗi: "Expo not found"
- ✅ Cài đặt Expo CLI: `npm install -g expo-cli`
- ✅ Hoặc sử dụng npx: `npx expo start`

---

## 📊 TÓM TẮT QUY TRÌNH CHẠY

### Thứ tự khởi chạy:

1. **Backend** (Port 5000)
   ```bash
   cd Back-end
   node index.js
   ```

2. **Website** (Port 5173)
   ```bash
   npm run dev
   ```

3. **Mobile App** (Expo)
   ```bash
   cd AppMobile/AppMobile
   npm start
   ```

### Các cổng (Ports) sử dụng:
- **Backend:** `5000`
- **Website:** `5173`
- **Mobile App:** Expo sử dụng port động (thường là 19000, 19001, 19002)

---

## 🎯 KIỂM TRA KẾT NỐI

### 1. Kiểm tra Backend:
- Mở trình duyệt: `http://localhost:5000`
- Hoặc test API: `http://localhost:5000/api/auth/login` (POST request)

### 2. Kiểm tra Website:
- Mở trình duyệt: `http://localhost:5173`
- Thử đăng nhập với tài khoản đã có

### 3. Kiểm tra Mobile App:
- Mở Expo Go app trên điện thoại
- Quét QR code từ Expo Dev Tools
- Thử đăng nhập với cùng tài khoản như Website

---

## 🔐 TÀI KHOẢN MẪU

Sau khi chạy Backend và có dữ liệu trong database, bạn có thể:
- Đăng ký tài khoản mới từ Website hoặc Mobile App
- Đăng nhập với tài khoản đã có
- Tài khoản được chia sẻ giữa Website và Mobile App (cùng database)

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Backend phải chạy trước** Website và Mobile App
2. **Database phải được cấu hình đúng** trước khi chạy Backend
3. **File .env phải được tạo** và cấu hình đúng cho Backend và Website
4. **Đối với thiết bị thật:** Đảm bảo cùng mạng Wi-Fi và cập nhật IP address
5. **Token JWT** được lưu tự động và sử dụng cho các request tiếp theo

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs trong console của Backend
2. Logs trong console của Website (Browser DevTools)
3. Logs trong Expo Dev Tools
4. Kiểm tra Network tab trong Browser DevTools để xem các API requests

---

**Chúc bạn chạy dự án thành công! 🎉**

