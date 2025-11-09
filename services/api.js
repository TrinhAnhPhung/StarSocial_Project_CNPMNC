import API_BASE_URL from '../constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Lấy token từ AsyncStorage
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Lưu token vào AsyncStorage
  async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Lấy token nếu có
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Thêm token vào header nếu có
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Chuyển body thành JSON string nếu là object
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      // Xử lý lỗi từ backend
      if (!response.ok) {
        // Nếu token hết hạn hoặc không hợp lệ
        if (response.status === 401 || response.status === 403) {
          // Xóa token và yêu cầu đăng nhập lại
          await this.setToken(null);
        }
        throw new Error(data.error || data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async register(email, password, first_name, last_name) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: { email, password, first_name, last_name },
      });
      return {
        success: true,
        message: response.message || 'Đăng ký thành công',
        data: response.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Đăng ký thất bại',
      };
    }
  }

  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      
      // Backend trả về { success, token, user, message }
      if (response.success && response.token) {
        // Lưu token vào AsyncStorage
        await this.setToken(response.token);
        return {
          success: true,
          message: response.message || 'Đăng nhập thành công',
          data: {
            ...response.user,
            token: response.token,
          },
        };
      } else {
        return {
          success: false,
          message: response.error || response.message || 'Đăng nhập thất bại',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      };
    }
  }

  async logout() {
    // Xóa token khi logout
    await this.setToken(null);
    return { success: true };
  }

  async healthCheck() {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // Admin APIs
  async getUsers() {
    try {
      const response = await this.request('/admin/users', {
        method: 'GET',
      });
      return {
        success: true,
        data: response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải danh sách người dùng',
        data: [],
      };
    }
  }

  async createUser(userData) {
    try {
      const response = await this.request('/admin/users', {
        method: 'POST',
        body: {
          email: userData.email,
          password: userData.password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
        },
      });
      return {
        success: true,
        message: response.message || 'Đã tạo người dùng thành công',
        data: response.user || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tạo người dùng',
      };
    }
  }

  async updateUser(userId, userData) {
    try {
      const updateData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
      };
      
      if (userData.password) {
        updateData.password = userData.password;
      }

      const response = await this.request(`/admin/users/${userId}`, {
        method: 'PUT',
        body: updateData,
      });
      return {
        success: true,
        message: response.message || 'Đã cập nhật người dùng thành công',
        data: response.user || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể cập nhật người dùng',
      };
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.request(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        message: response.message || 'Đã xóa người dùng thành công',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể xóa người dùng',
      };
    }
  }

  async toggleLockUser(userId, isLocked) {
    try {
      const response = await this.request(`/admin/users/${userId}/lock`, {
        method: 'PATCH',
        body: { isLocked: !isLocked },
      });
      return {
        success: true,
        message: response.message || `Đã ${isLocked ? 'mở khóa' : 'khóa'} người dùng thành công`,
        data: response.user || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || `Không thể ${isLocked ? 'mở khóa' : 'khóa'} người dùng`,
      };
    }
  }
}

export default new ApiService();

