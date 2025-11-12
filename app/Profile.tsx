import { StyleSheet, Text, View, useColorScheme, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import { useState, useEffect } from "react";
import authService from "../services/authService";
import { getAvatarUrl } from "../utils/imageUtils";
import { Image } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useLogout } from "../hooks/useLogout";
import AppLoader from "../component/AppLoader";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const { logout, isLoggingOut } = useLogout({
    onError: (error) => {
      Alert.alert(
        'Lỗi đăng xuất',
        `Không thể đăng xuất: ${error}\n\nVui lòng thử lại hoặc khởi động lại app.`,
        [
          {
            text: 'Thử lại',
            onPress: () => {
              // Gọi lại logout với showConfirmation = false để không hiện dialog xác nhận lại
              logout();
            },
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    },
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await authService.getUserData();
      setUserData(data);
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
                <View style={styles.profileHeader}>
                  <View style={[styles.avatarContainer, { backgroundColor: theme.Text_color + '10' }]}>
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
                  </View>
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
                </View>

                <View style={styles.section}>
                  <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.Text_color + '10', borderLeftWidth: 4, borderLeftColor: '#ff9800' }]}
                    onPress={() => Alert.alert('Thông báo', 'Tính năng chỉnh sửa hồ sơ đang phát triển')}
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
                    style={[styles.menuItem, styles.logoutButton, { backgroundColor: '#dc3545' }]}
                    onPress={logout}
                    activeOpacity={0.8}
                    disabled={isLoggingOut}
                  >
                    <View style={styles.menuItemContent}>
                      <MaterialIcons name="logout" size={24} color="white" />
                      <Text style={[styles.menuText, styles.logoutText, { color: 'white' }]}>
                        Đăng xuất
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007bff',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0E0E0',
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

