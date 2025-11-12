import { StyleSheet, Text, View, useColorScheme, ScrollView, TouchableOpacity, Alert, Animated, ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import { useState, useEffect, useRef } from "react";
import authService from "../services/authService";
import { getAvatarUrl } from "../utils/imageUtils";
import { Image } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useLogout } from "../hooks/useLogout";
import AppLoader from "../component/AppLoader";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const menuItemsOpacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { logout, isLoggingOut } = useLogout({
    onError: (error) => {
      Alert.alert(
        'Lỗi đăng xuất',
        `Không thể đăng xuất: ${error}\n\nVui lòng thử lại hoặc khởi động lại app.`,
        [
          {
            text: 'Thử lại',
            onPress: () => {
              // Force logout không cần xác nhận
              performForceLogout();
            },
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    },
    onSuccess: () => {
      console.log('✅ Profile: Logout thành công, callback được gọi');
    },
  });

  // Force logout không cần xác nhận (fallback)
  const performForceLogout = async () => {
    try {
      console.log('🔄 Profile: Thực hiện force logout...');
      
      // Xóa AsyncStorage trực tiếp
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      console.log('✅ Profile: Đã xóa token và user data');
      
      // Đợi một chút để đảm bảo AsyncStorage đã được cập nhật
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate về root
      console.log('🔄 Profile: Đang navigate về root...');
      router.replace('/');
      
      // Fallback: nếu router không hoạt động, thử reload (web)
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🔄 Profile: Fallback - reload window');
          window.location.href = '/';
        }
      }, 500);
    } catch (error) {
      console.error('❌ Profile: Lỗi force logout:', error);
      // Fallback cuối cùng: reload nếu trên web
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await authService.getUserData();
      setUserData(data);
      
      // Start animations
      Animated.parallel([
        Animated.spring(avatarScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(menuItemsOpacity, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoggingOut) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
          <ThemeBar />
          <Header />
          <AppLoader message="Đang đăng xuất..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
          <ThemeBar />
          <Header />
          <AppLoader message="Đang tải thông tin..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={['top']}>
        <ThemeBar />
        <Header />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {userData && (
              <>
                <Animated.View style={[styles.profileHeader, { opacity: headerOpacity }]}>
                  <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}>
                    <LinearGradient
                      colors={colorScheme === 'dark' 
                        ? ['rgba(90,125,254,0.3)', 'rgba(74,109,254,0.2)'] 
                        : ['rgba(108,99,255,0.2)', 'rgba(91,82,255,0.15)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatarGradient}
                    >
                      <Image
                        source={
                          userData.avatar || userData.profile_picture
                            ? { uri: getAvatarUrl(userData.avatar || userData.profile_picture) }
                            : require('../assets/logo.png')
                        }
                        style={styles.avatar}
                        defaultSource={require('../assets/logo.png')}
                        onError={() => {
                          console.log('Lỗi khi tải avatar, sử dụng ảnh mặc định');
                        }}
                      />
                    </LinearGradient>
                  </Animated.View>
                  <Text style={[styles.username, { color: theme.Text_color }]}>
                    {userData.full_name 
                      ? userData.full_name
                      : (userData.first_name && userData.last_name 
                        ? `${userData.first_name} ${userData.last_name}`.trim()
                        : userData.email?.split('@')[0] || 'Người dùng')}
                  </Text>
                  <Text style={[styles.email, { color: theme.Text_color + 'AA' }]}>
                    {userData.email || 'Chưa cập nhật email'}
                  </Text>
                </Animated.View>

                <Animated.View style={[styles.section, { opacity: menuItemsOpacity }]}>
                  <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.Text_color + '10', borderLeftWidth: 4, borderLeftColor: '#ff9800' }]}
                    onPress={() => router.push('/EditProfile')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <MaterialIcons name="edit" size={24} color="#ff9800" />
                      <Text style={[styles.menuText, { color: theme.Text_color }]}>
                        Chỉnh sửa hồ sơ
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.Text_color + '10', borderLeftWidth: 4, borderLeftColor: '#9c27b0' }]}
                    onPress={() => Alert.alert('Thông báo', 'Tính năng cài đặt đang phát triển')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <MaterialIcons name="settings" size={24} color="#9c27b0" />
                      <Text style={[styles.menuText, { color: theme.Text_color }]}>
                        Cài đặt
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      styles.logoutButton,
                      {
                        backgroundColor: isLoggingOut ? '#dc354580' : '#dc3545',
                        opacity: isLoggingOut ? 0.6 : 1,
                      },
                    ]}
                    onPress={async () => {
                      console.log('🔘 Profile: Nút đăng xuất được nhấn, isLoggingOut:', isLoggingOut);
                      if (isLoggingOut) {
                        console.log('⚠️ Profile: Đang trong quá trình logout, bỏ qua...');
                        return;
                      }

                      try {
                        console.log('🔘 Profile: Gọi hàm logout()...');
                        logout();
                        
                        // Fallback: Nếu sau 2 giây vẫn chưa có phản hồi từ Alert, thực hiện logout trực tiếp
                        setTimeout(async () => {
                          const stillAuthenticated = await authService.isAuthenticated();
                          if (stillAuthenticated) {
                            console.log('⚠️ Profile: Alert có thể không hoạt động, thực hiện force logout...');
                            await performForceLogout();
                          }
                        }, 2000);
                      } catch (error) {
                        console.error('❌ Profile: Lỗi khi gọi logout:', error);
                        // Nếu có lỗi, thử force logout
                        await performForceLogout();
                      }
                    }}
                    activeOpacity={0.8}
                    disabled={isLoggingOut}
                  >
                    <View style={styles.menuItemContent}>
                      {isLoggingOut ? (
                        <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                      ) : (
                        <MaterialIcons name="logout" size={24} color="white" />
                      )}
                      <Text style={[styles.menuText, styles.logoutText, { color: 'white' }]}>
                        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5A7DFE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatar: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: '#E0E0E0',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  username: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: COLORS.medium_font_size,
    textAlign: 'center',
  },
  section: {
    gap: 12,
    marginTop: 20,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    marginTop: 10,
    shadowColor: '#dc3545',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuText: {
    fontSize: COLORS.medium_font_size,
    fontWeight: '600',
    flex: 1,
  },
  logoutText: {
    fontWeight: 'bold',
  },
});

