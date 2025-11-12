import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseLogoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

export const useLogout = (options: UseLogoutOptions = {}) => {
  const {
    onSuccess,
    onError,
    showConfirmation = true,
    confirmationTitle = 'Đăng xuất',
    confirmationMessage = 'Bạn có chắc chắn muốn đăng xuất?',
  } = options;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const logout = async () => {
    if (showConfirmation) {
      Alert.alert(
        confirmationTitle,
        confirmationMessage,
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    } else {
      await performLogout();
    }
  };

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🔄 useLogout: Bắt đầu quá trình đăng xuất...');
      console.log('📝 useLogout: Bước 1 - Gọi authService.logout()...');

      // Thực hiện logout
      const logoutResult = await authService.logout();
      console.log('📝 useLogout: Kết quả từ authService.logout():', logoutResult);

      if (logoutResult && !logoutResult.success) {
        setIsLoggingOut(false);
        console.error('❌ useLogout: Lỗi logout:', logoutResult.message);
        const errorMessage = logoutResult.message || 'Lỗi không xác định';
        
        if (onError) {
          onError(errorMessage);
        } else {
          Alert.alert('Lỗi', `Không thể đăng xuất: ${errorMessage}`);
        }
        return;
      }

      console.log('✅ useLogout: Logout thành công, đang kiểm tra lại...');
      console.log('📝 useLogout: Bước 2 - Đợi 300ms để AsyncStorage cập nhật...');

      // Đợi một chút để đảm bảo AsyncStorage đã được xóa hoàn toàn
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Kiểm tra lại xem đã logout chưa
      console.log('📝 useLogout: Bước 3 - Kiểm tra authentication...');
      const finalCheck = await authService.isAuthenticated();
      console.log('🔍 useLogout: Kết quả kiểm tra authentication:', finalCheck);

      if (finalCheck) {
        console.warn('⚠️ useLogout: Vẫn còn authenticated, force clear AsyncStorage...');
        // Force xóa lại
        try {
          await AsyncStorage.multiRemove(['auth_token', 'user_data']);
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log('✅ useLogout: Đã force xóa token và user data');
        } catch (clearError) {
          console.error('❌ useLogout: Lỗi khi force xóa:', clearError);
        }
      }

      // Kiểm tra lại lần cuối
      const finalAuthCheck = await authService.isAuthenticated();
      if (finalAuthCheck) {
        console.error('❌ useLogout: VẪN CÒN AUTHENTICATED! Force clear toàn bộ...');
        try {
          await AsyncStorage.clear();
          console.log('✅ useLogout: Đã clear toàn bộ AsyncStorage');
        } catch (clearError) {
          console.error('❌ useLogout: Lỗi khi clear:', clearError);
        }
      }

      // Kiểm tra lại lần cuối để đảm bảo đã logout hoàn toàn
      const finalAuthCheck2 = await authService.isAuthenticated();
      if (finalAuthCheck2) {
        console.error('❌ useLogout: VẪN CÒN AUTHENTICATED SAU KHI CLEAR!');
        setIsLoggingOut(false);
        const errorMsg = 'Không thể xóa hoàn toàn thông tin đăng nhập. Vui lòng khởi động lại app.';
        if (onError) {
          onError(errorMsg);
        } else {
          Alert.alert('Lỗi', errorMsg, [{ text: 'OK' }]);
        }
        return;
      }

      console.log('✅ useLogout: Đã logout hoàn toàn thành công!');
      setIsLoggingOut(false);

      // Hiển thị thông báo thành công và chuyển hướng
      Alert.alert(
        'Đăng xuất thành công',
        'Bạn đã đăng xuất thành công. Đang chuyển về trang đăng nhập...',
        [
          {
            text: 'OK',
            onPress: () => {
              // Gọi callback onSuccess nếu có
              if (onSuccess) {
                onSuccess();
              }
              // Luôn chuyển hướng về root route
              console.log('🔄 useLogout: Đang chuyển hướng về root route (/)...');
              router.replace('/');
            },
          },
        ]
      );
    } catch (error: any) {
      setIsLoggingOut(false);
      console.error('❌ useLogout: Lỗi trong quá trình logout:', error);
      const errorMessage = error?.message || 'Lỗi không xác định';

      if (onError) {
        onError(errorMessage);
      } else {
        Alert.alert(
          'Lỗi đăng xuất',
          `Đã xảy ra lỗi: ${errorMessage}\n\nVui lòng thử lại hoặc khởi động lại app.`,
          [
            {
              text: 'Thử lại',
              onPress: performLogout,
            },
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      }
    }
  };

  return {
    logout,
    isLoggingOut,
  };
};

