// Cấu hình API URL
// Backend chạy ở port 5000 (chung với Website)

// ✅ Dùng localhost cho cả Web và Mobile (với adb reverse)
let API_BASE_URL = 'http://localhost:5000/api';

// Các option khác nếu không dùng USB:
// - Android Emulator: 'http://10.0.2.2:5000/api'
// - Thiết bị thật qua WiFi: 'http://192.168.1.230:5000/api'
// - iOS Simulator: 'http://localhost:5000/api'

// Kiểm tra nếu đang chạy trên web browser
if (typeof window !== 'undefined' && window.location) {
  // Trên web browser
  API_BASE_URL = 'http://localhost:5000/api';
}

export default API_BASE_URL;

