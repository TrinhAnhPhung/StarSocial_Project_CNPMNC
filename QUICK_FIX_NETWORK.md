# Hướng Dẫn Sửa Lỗi Network Request Failed

## ✅ Đã Cấu Hình

### 1. Backend: Port 5000
- File `.env`: `PORT=5000`
- Backend đang chạy tại: `http://localhost:5000`

### 2. Mobile App: Dùng localhost
- File `apiConfig.js`: `http://localhost:5000/api`
- Đã chạy: `adb reverse tcp:5000 tcp:5000` ✅

### 3. Website: Dùng localhost
- Kết nối: `http://localhost:5000/api`

## 🚀 Các Bước Chạy

### Bước 1: Chạy Backend (Nếu chưa chạy)
```bash
cd "D:\Dự Án\CNPMNC\CNPM NC\StarSocial_Project_CNPMNC\Back-end"
node index.js
```

Kết quả:
```
🚀 Server đang chạy tại http://localhost:5000
```

### Bước 2: Setup ADB Reverse
```bash
adb reverse tcp:5000 tcp:5000
```

Kết quả: `5000` ✅

### Bước 3: Restart Mobile App
```bash
cd "D:\Dự Án\CNPMNC\CNPM NC\MobileApp\StarSocial_Project_CNPMNC"
npx expo start --clear
```

Bấm `r` để reload app hoặc `a` để mở lại

## 🔍 Debug Steps

### Kiểm Tra 1: Backend có chạy không?
```bash
netstat -ano | findstr :5000
```

Phải thấy:
```
TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING
```

### Kiểm Tra 2: ADB reverse có hoạt động không?
```bash
adb reverse --list
```

Phải thấy:
```
(reverse) tcp:5000 tcp:5000
```

### Kiểm Tra 3: Test API từ app
Thêm vào `Login.tsx` để test:

```javascript
useEffect(() => {
  console.log('Testing API connection...');
  console.log('API URL:', API_BASE_URL);
  
  fetch(API_BASE_URL.replace('/api', '/'))
    .then(res => {
      console.log('✅ Backend connected! Status:', res.status);
    })
    .catch(err => {
      console.error('❌ Backend connection failed:', err.message);
    });
}, []);
```

## ⚠️ Lỗi Thường Gặp

### Lỗi: "Network request failed"
**Nguyên nhân:**
1. Backend chưa chạy
2. ADB reverse chưa chạy
3. App chưa reload sau khi đổi config

**Giải pháp:**
```bash
# 1. Kill backend cũ
$conn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }

# 2. Chạy backend mới
cd Back-end
node index.js

# 3. Chạy adb reverse (terminal mới)
adb reverse tcp:5000 tcp:5000

# 4. Restart app (terminal mới)
cd MobileApp/StarSocial_Project_CNPMNC
npx expo start --clear
```

### Lỗi: "adb: error: cannot bind to socket"
**Nguyên nhân:** ADB reverse đã chạy hoặc port bị chiếm

**Giải pháp:**
```bash
# Remove reverse cũ
adb reverse --remove tcp:5000

# Chạy lại
adb reverse tcp:5000 tcp:5000
```

### Lỗi: "Connection refused"
**Nguyên nhân:** Backend không chạy hoặc chạy sai port

**Giải pháp:**
```bash
# Kiểm tra backend
netstat -ano | findstr :5000

# Nếu không có, chạy backend
cd Back-end
node index.js
```

## 📱 Test Checklist

Kiểm tra các bước sau:

```
☐ Backend đang chạy (node index.js)
☐ Port 5000 đang LISTENING (netstat -ano | findstr :5000)
☐ ADB reverse đã chạy (adb reverse tcp:5000 tcp:5000)
☐ API_BASE_URL = 'http://localhost:5000/api'
☐ Đã restart app (bấm 'r' hoặc npx expo start --clear)
☐ Điện thoại kết nối qua USB
☐ USB debugging đã bật
☐ Website cũng đăng nhập được
```

## 🎯 Kết Quả Mong Đợi

✅ **Website:** Đăng nhập được tại `http://localhost:5000`  
✅ **Mobile App:** Đăng nhập được qua USB với `localhost:5000`  
✅ **Cả 2 dùng chung backend port 5000**

## 💡 Tips

1. **Luôn chạy adb reverse sau khi cắm USB lại**
2. **Restart app sau khi đổi API config**
3. **Check backend logs để thấy request từ app**
4. **Dùng `--clear` flag khi start Expo để clear cache**

## 🆘 Nếu Vẫn Lỗi

Gửi cho tôi:
1. Output của `node index.js` (backend logs)
2. Output của `adb reverse tcp:5000 tcp:5000`
3. Error message đầy đủ từ mobile app
4. Screenshot console logs trong Expo
