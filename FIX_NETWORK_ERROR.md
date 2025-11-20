# Sửa Lỗi "Network request failed"

## Nguyên Nhân
Lỗi này xảy ra khi mobile app không thể kết nối đến backend server.

## Kiểm Tra Nhanh

### 1️⃣ Backend Có Đang Chạy?
```bash
cd Back-end
node index.js
```

Kết quả đúng:
```
🚀 Server (với Socket.io) đang chạy tại http://localhost:3000
📱 Mobile app có thể kết nối tại: http://YOUR_IP:3000
```

### 2️⃣ Bạn Đang Dùng Thiết Bị Gì?

#### ✅ Android Emulator
File: `MobileApp/StarSocial_Project_CNPMNC/constants/apiConfig.js`
```javascript
let API_BASE_URL = 'http://10.0.2.2:3000/api';
```

**Giải thích:** `10.0.2.2` là địa chỉ đặc biệt trong Android Emulator trỏ đến `localhost` của máy host.

#### ✅ Thiết Bị Thật (Android/iOS)
**Bước 1:** Tìm IP máy tính chạy backend

PowerShell:
```powershell
ipconfig
# Tìm IPv4 Address của WiFi adapter
# Ví dụ: 192.168.1.10
```

**Bước 2:** Cập nhật API URL
```javascript
let API_BASE_URL = 'http://192.168.1.10:3000/api';
```

**Bước 3:** Đảm bảo cả máy tính và điện thoại cùng mạng WiFi

#### ✅ iOS Simulator
```javascript
let API_BASE_URL = 'http://localhost:3000/api';
```

### 3️⃣ Kiểm Tra Firewall

#### Windows Firewall
```powershell
# Cho phép port 3000
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Hoặc tắt Firewall tạm thời để test:
- Settings → Windows Security → Firewall & network protection → Turn off

### 4️⃣ Test Kết Nối

#### Từ Terminal (PowerShell)
```powershell
# Test từ localhost
curl http://localhost:3000

# Test từ IP
curl http://192.168.1.10:3000
```

#### Từ Mobile App
Uncomment dòng test trong `App.js` hoặc chạy:
```javascript
// Trong console của Expo
fetch('http://10.0.2.2:3000')
  .then(res => res.text())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

## Giải Pháp Theo Tình Huống

### Tình Huống 1: Dùng Android Emulator
```javascript
// constants/apiConfig.js
let API_BASE_URL = 'http://10.0.2.2:3000/api';
```

**Không cần adb reverse** vì `10.0.2.2` tự động map.

### Tình Huống 2: Dùng Thiết Bị Thật
```javascript
// constants/apiConfig.js
let API_BASE_URL = 'http://192.168.1.10:3000/api';
```

**Checklist:**
- ✅ Máy tính và điện thoại cùng WiFi
- ✅ Firewall cho phép port 3000
- ✅ Backend đang chạy
- ✅ IP đúng (check bằng `ipconfig`)

### Tình Huống 3: Dùng Expo Go với Tunnel
Nếu không cùng WiFi, dùng tunnel:
```bash
# Terminal
cd MobileApp/StarSocial_Project_CNPMNC
npx expo start --tunnel
```

**Lưu ý:** Tunnel chậm hơn và có thể bị giới hạn.

### Tình Huống 4: Dùng USB Debugging (Android)
```bash
# Terminal
adb reverse tcp:3000 tcp:3000
```

Sau đó dùng:
```javascript
let API_BASE_URL = 'http://localhost:3000/api';
```

## Debug Steps

### Bước 1: Check Backend
```bash
cd Back-end
node index.js
```

Xem output có:
```
✅ Database connected
🚀 Server đang chạy tại http://localhost:3000
```

### Bước 2: Check API Config
```bash
# Trong MobileApp
cat constants/apiConfig.js
```

Đảm bảo URL đúng với thiết bị bạn dùng.

### Bước 3: Restart App
```bash
# Kill app
# Restart Expo
npx expo start -c
```

### Bước 4: Check Logs
Trong Expo:
- Mở Developer Menu (shake device hoặc Cmd+D/Ctrl+D)
- Xem Network logs
- Xem Console logs

### Bước 5: Test Simple Request
```javascript
// Thêm vào Login.tsx để test
useEffect(() => {
  console.log('Testing API connection...');
  fetch(API_BASE_URL.replace('/api', '/'))
    .then(res => {
      console.log('✅ Connected! Status:', res.status);
    })
    .catch(err => {
      console.error('❌ Connection failed:', err.message);
    });
}, []);
```

## Lỗi Thường Gặp

### Lỗi: "Network request failed"
**Nguyên nhân:** App không kết nối được đến server

**Giải pháp:**
1. Check backend đang chạy
2. Check IP/port đúng
3. Check firewall
4. Check cùng WiFi (nếu dùng thiết bị thật)

### Lỗi: "Failed to fetch"
**Nguyên nhân:** CORS hoặc server không response

**Giải pháp:**
1. Check CORS trong `index.js`
2. Test bằng Postman/curl
3. Check server logs

### Lỗi: "Connection refused"
**Nguyên nhân:** Port không đúng hoặc server không chạy

**Giải pháp:**
1. Check backend port: `netstat -ano | findstr :3000`
2. Restart backend
3. Check .env file có `PORT=3000`

### Lỗi: "Timeout"
**Nguyên nhân:** Mạng chậm hoặc firewall

**Giải pháp:**
1. Check WiFi connection
2. Disable VPN
3. Tắt firewall tạm thời để test
4. Tăng timeout trong fetch config

## Quick Fix Checklist

```
☐ Backend đang chạy tại port 3000
☐ API_BASE_URL đúng với thiết bị (10.0.2.2 cho Emulator, IP thật cho device)
☐ Máy tính và điện thoại cùng WiFi (nếu dùng thiết bị thật)
☐ Firewall cho phép port 3000
☐ Đã restart app sau khi đổi config
☐ Backend không có lỗi trong console
☐ CORS đã được cấu hình đúng
```

## Cấu Hình Đã Sửa

### File: `Back-end/.env`
```env
PORT=3000
```

### File: `Back-end/index.js`
```javascript
const port = process.env.PORT || 3000;
```

### File: `MobileApp/.../constants/apiConfig.js`
```javascript
// Android Emulator
let API_BASE_URL = 'http://10.0.2.2:3000/api';

// Real Device
// let API_BASE_URL = 'http://192.168.1.10:3000/api';
```

## Test Commands

```bash
# 1. Test backend đang chạy
curl http://localhost:3000

# 2. Test từ IP
curl http://192.168.1.10:3000

# 3. Check port đang dùng
netstat -ano | findstr :3000

# 4. Check IP máy tính
ipconfig

# 5. Test CORS
curl -H "Origin: http://localhost" http://localhost:3000

# 6. Restart backend
cd Back-end
node index.js
```

## Liên Hệ Debug

Nếu vẫn lỗi, cung cấp thông tin:
1. Thiết bị đang dùng (Emulator/Real device)
2. Output của `node index.js`
3. Output của `ipconfig`
4. Giá trị `API_BASE_URL` hiện tại
5. Error message đầy đủ trong console
