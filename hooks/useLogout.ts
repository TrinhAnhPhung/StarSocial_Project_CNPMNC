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

  const logout = () => {
    if (isLoggingOut) {
      console.log('⚠️ useLogout: Đang trong quá trình logout, bỏ qua...');
      return;
    }

    console.log('🔘 useLogout: Hàm logout được gọi, showConfirmation:', showConfirmation);

    if (showConfirmation) {
      try {
        Alert.alert(
          confirmationTitle,
          confirmationMessage,
          [
            {
              text: 'Hủy',
              style: 'cancel',
              onPress: () => {
                console.log('🚫 useLogout: Người dùng hủy đăng xuất');
              },
            },
            {
              text: 'Đăng xuất',
              style: 'destructive',
              onPress: () => {
                console.log('✅ useLogout: Người dùng xác nhận đăng xuất từ Alert');
                performLogout();
              },
            },
          ],
          { cancelable: true }
        );
      } catch (alertError) {
        console.error('❌ useLogout: Lỗi khi hiển thị Alert, thực hiện logout trực tiếp:', alertError);
        // Nếu Alert không hoạt động (ví dụ trên web), thực hiện logout trực tiếp
        performLogout();
      }
    } else {
      console.log('✅ useLogout: Bỏ qua xác nhận, thực hiện logout ngay');
      performLogout();
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
      
      // Gọi callback onSuccess nếu có
      if (onSuccess) {
        onSuccess();
      }
      
      // Đảm bảo AsyncStorage đã được clear hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Chuyển hướng về root route
      console.log('🔄 useLogout: Đang chuyển hướng về root route (/)...');
      
      try {
        // Thử dùng replace trước
        router.replace('/');
        console.log('✅ useLogout: Đã gọi router.replace("/")');
      } catch (navError) {
        console.error('❌ useLogout: Lỗi khi replace, thử push:', navError);
        try {
          // Fallback: dùng push
          router.push('/');
          console.log('✅ useLogout: Đã gọi router.push("/")');
        } catch (pushError) {
          console.error('❌ useLogout: Lỗi khi push:', pushError);
          // Fallback cuối cùng: reload window nếu trên web
          if (typeof window !== 'undefined') {
            console.log('🔄 useLogout: Thử reload window...');
            window.location.href = '/';
          }
        }
      }
      
      // Reset state sau khi navigate
      setIsLoggingOut(false);
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

