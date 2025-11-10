import { useState, useEffect } from "react";
import { StyleSheet, View, Text, useColorScheme, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import authService from "../services/authService";
import Header from "../component/Header";
import Feed from "../component/Feed";
import BottomNavigation from "../component/BottomNavigation";

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await authService.getUserData();
    setUserData(data);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              console.log('🔄 Bắt đầu quá trình đăng xuất...');
              
              // Thực hiện logout
              const logoutResult = await authService.logout();
              
              if (logoutResult && !logoutResult.success) {
                setIsLoggingOut(false);
                console.error('❌ Lỗi logout:', logoutResult.message);
                Alert.alert('Lỗi', `Không thể đăng xuất: ${logoutResult.message || 'Lỗi không xác định'}`);
                return;
              }
              
              console.log('✅ Logout thành công, đang kiểm tra lại...');
              
              // Đợi một chút để đảm bảo AsyncStorage đã được xóa hoàn toàn
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Kiểm tra lại xem đã logout chưa
              const finalCheck = await authService.isAuthenticated();
              console.log('🔍 Kiểm tra lại authentication sau logout:', finalCheck);
              
              if (finalCheck) {
                console.warn('⚠️ Vẫn còn authenticated, force clear AsyncStorage...');
                // Force xóa lại
                try {
                  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                  await AsyncStorage.multiRemove(['auth_token', 'user_data']);
                  await new Promise(resolve => setTimeout(resolve, 200));
                  console.log('✅ Đã force xóa token và user data');
                } catch (clearError) {
                  console.error('❌ Lỗi khi force xóa:', clearError);
                }
              }
              
              // Kiểm tra lại lần cuối
              const finalAuthCheck = await authService.isAuthenticated();
              if (finalAuthCheck) {
                console.error('❌ VẪN CÒN AUTHENTICATED! Force clear toàn bộ...');
                try {
                  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                  await AsyncStorage.clear();
                  console.log('✅ Đã clear toàn bộ AsyncStorage');
                } catch (clearError) {
                  console.error('❌ Lỗi khi clear:', clearError);
                }
              }
              
              setIsLoggingOut(false);
              
              // Hiển thị thông báo thành công
              Alert.alert(
                'Đăng xuất thành công',
                'Bạn đã đăng xuất thành công. Đang chuyển về trang mặc định...',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Điều hướng về root route (/)
                      // index.tsx sẽ kiểm tra authentication và tự động redirect đến /Login nếu chưa đăng nhập
                      console.log('🔄 Đang chuyển hướng về root route (/)...');
                      router.replace('/');
                    }
                  }
                ]
              );
              
            } catch (error: any) {
              setIsLoggingOut(false);
              console.error('❌ Lỗi trong quá trình logout:', error);
              Alert.alert(
                'Lỗi đăng xuất',
                `Đã xảy ra lỗi: ${error?.message || 'Lỗi không xác định'}\n\nVui lòng thử lại hoặc khởi động lại app.`,
                [
                  {
                    text: 'Thử lại',
                    onPress: handleLogout
                  },
                  {
                    text: 'OK',
                    style: 'default'
                  }
                ]
              );
            }
          }
        }
      ]
    );
  };

  if (isLoggingOut) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={{ marginTop: 10, color: theme.Text_color }}>
              Đang đăng xuất...
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={['top']}>
        <ThemeBar />
        <Header
          onNotificationPress={() => Alert.alert('Thông báo', 'Tính năng thông báo đang phát triển')}
          onChatPress={() => Alert.alert('Tin nhắn', 'Tính năng tin nhắn đang phát triển')}
        />
        <View style={styles.feedContainer}>
          <Feed />
        </View>
        <SafeAreaView edges={['bottom']}>
          <BottomNavigation userAvatar={userData?.avatar || userData?.profile_picture} />
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedContainer: {
    flex: 1,
  },
});

