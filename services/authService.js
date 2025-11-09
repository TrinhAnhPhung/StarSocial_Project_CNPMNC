import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

class AuthService {
  async register(email, password, first_name, last_name) {
    try {
      const response = await apiService.register(email, password, first_name, last_name);
      if (response.success) {
        // Lưu thông tin user vào AsyncStorage
        if (response.data) {
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
        }
        return { success: true, data: response.data, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Đăng ký thất bại. Vui lòng thử lại.' 
      };
    }
  }

  async login(email, password) {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data) {
        // Lưu thông tin user vào AsyncStorage
        // Token đã được lưu trong apiService.login()
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
        return { success: true, data: response.data, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' 
      };
    }
  }

  async logout() {
    try {
      console.log('🔐 AuthService: Bắt đầu logout...');
      
      // Sử dụng multiRemove để xóa tất cả cùng lúc (atomic operation)
      try {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
        console.log('🔐 AuthService: Đã xóa token và user data bằng multiRemove');
      } catch (multiError) {
        console.warn('⚠️ AuthService: multiRemove failed, thử xóa từng item...', multiError);
        // Fallback: xóa từng item
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_DATA_KEY);
        console.log('🔐 AuthService: Đã xóa token và user data bằng removeItem');
      }
      
      // Gọi apiService.logout() để xóa token (nếu có logic server-side)
      try {
        await apiService.logout();
      } catch (apiError) {
        console.warn('⚠️ AuthService: API logout failed (có thể không quan trọng):', apiError);
      }
      
      // Đợi một chút để đảm bảo AsyncStorage đã được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Kiểm tra lại để đảm bảo đã xóa hoàn toàn
      const remainingToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const remainingUserData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      console.log('🔐 AuthService: Kiểm tra sau khi xóa:');
      console.log('  - Token còn lại:', remainingToken ? 'CÓ' : 'KHÔNG');
      console.log('  - User data còn lại:', remainingUserData ? 'CÓ' : 'KHÔNG');
      
      if (remainingToken || remainingUserData) {
        console.warn('⚠️ AuthService: Vẫn còn dữ liệu, thử xóa lại...');
        // Thử xóa lại với force
        try {
          await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
          // Đợi thêm một chút
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (retryError) {
          console.error('❌ AuthService: Lỗi khi retry xóa:', retryError);
          // Thử clear tất cả (nguy hiểm nhưng đảm bảo logout)
          try {
            await AsyncStorage.clear();
            console.log('🔐 AuthService: Đã clear toàn bộ AsyncStorage');
          } catch (clearError) {
            console.error('❌ AuthService: Lỗi khi clear AsyncStorage:', clearError);
          }
        }
      }
      
      // Kiểm tra lại lần cuối
      const finalToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const finalUserData = await AsyncStorage.getItem(USER_DATA_KEY);
      const finalAuth = await this.isAuthenticated();
      
      console.log('🔐 AuthService: Kiểm tra cuối cùng:');
      console.log('  - Token:', finalToken ? 'CÓ' : 'KHÔNG');
      console.log('  - User data:', finalUserData ? 'CÓ' : 'KHÔNG');
      console.log('  - isAuthenticated:', finalAuth);
      
      if (finalAuth) {
        console.error('❌ AuthService: VẪN CÒN AUTHENTICATED SAU KHI LOGOUT!');
        return { success: false, message: 'Không thể xóa thông tin đăng nhập' };
      }
      
      console.log('✅ AuthService: Logout thành công - đã xóa hoàn toàn');
      return { success: true };
    } catch (error) {
      console.error('❌ AuthService: Lỗi logout:', error);
      // Ngay cả khi có lỗi, vẫn cố gắng xóa
      try {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      } catch (cleanupError) {
        console.error('❌ AuthService: Lỗi cleanup:', cleanupError);
      }
      return { success: false, message: error.message || 'Lỗi không xác định khi đăng xuất' };
    }
  }

  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async getToken() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async isAuthenticated() {
    try {
      // Kiểm tra cả token và user data
      const token = await this.getToken();
      const userData = await this.getUserData();
      return token !== null && userData !== null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}

export default new AuthService();

