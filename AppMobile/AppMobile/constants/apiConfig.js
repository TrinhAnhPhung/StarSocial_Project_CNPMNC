// Cấu hình API URL
// Kết nối với backend chung của Website (port 5000)

// Tự động phát hiện môi trường
let API_BASE_URL = 'http://localhost:5000/api';

// Kiểm tra nếu đang chạy trên web browser
if (typeof window !== 'undefined' && window.location) {
  // Trên web, sử dụng localhost:5000 (backend chung)
  API_BASE_URL = 'http://localhost:5000/api';
} else {
  // Trên mobile, mặc định sử dụng localhost:5000
  // Bạn có thể thay đổi theo môi trường:
  
  // Đối với Android Emulator - sử dụng 10.0.2.2 để truy cập localhost của máy host
  // API_BASE_URL = 'http://10.0.2.2:5000/api';
  
  // Đối với iOS Simulator - có thể dùng localhost
  // API_BASE_URL = 'http://localhost:5000/api';
  
  // Đối với thiết bị thật (thay YOUR_IP bằng IP của máy tính chạy backend)
  // Ví dụ: API_BASE_URL = 'http://192.168.1.100:5000/api';
}

export default API_BASE_URL;

