import { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, useColorScheme, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import authService from "../services/authService";

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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
        <ThemeBar />
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.Text_color }]}>
              Chào mừng đến StarSocial
            </Text>
            
            {userData && (
              <View style={[styles.userInfo, { backgroundColor: theme.Text_color + '10', borderColor: theme.Text_color + '30' }]}>
                <Text style={[styles.userInfoTitle, { color: theme.Text_color }]}>
                  Thông tin tài khoản
                </Text>
                <Text style={[styles.userInfoText, { color: theme.Text_color }]}>
                  Email: {userData.email}
                </Text>
                <Text style={[styles.userInfoText, { color: theme.Text_color }]}>
                  Họ tên: {userData.full_name || 'Chưa cập nhật'}
                </Text>
                <Text style={[styles.userInfoText, { color: theme.Text_color }]}>
                  Vai trò: {userData.role === 'admin' ? 'Quản trị viên' : userData.role === 'handlereport' ? 'Xử lý báo cáo' : 'Người dùng'}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>
                Tính năng
              </Text>
              
              <TouchableOpacity 
                style={[styles.featureButton, { backgroundColor: '#007bff' }]}
                onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
              >
                <Text style={styles.featureButtonText}>📱 Trang chủ</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureButton, { backgroundColor: '#28a745' }]}
                onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
              >
                <Text style={styles.featureButtonText}>👥 Bạn bè</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureButton, { backgroundColor: '#ffc107' }]}
                onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
              >
                <Text style={styles.featureButtonText}>📰 Tin tức</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureButton, { backgroundColor: '#17a2b8' }]}
                onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
              >
                <Text style={styles.featureButtonText}>⚙️ Cài đặt</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: '#dc3545' }]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  userInfoTitle: {
    fontSize: COLORS.large_font_size,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfoText: {
    fontSize: COLORS.medium_font_size,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: COLORS.large_font_size,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featureButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  featureButtonText: {
    color: 'white',
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
  },
});

