import { useState, useEffect } from "react";
import { StyleSheet, View, useColorScheme, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import authService from "../services/authService";
import Header from "../component/Header";
import Feed from "../component/Feed";
import BottomNavigation from "../component/BottomNavigation";
import { useLogout } from "../hooks/useLogout";
import AppLoader from "../component/AppLoader";

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const { logout, isLoggingOut } = useLogout();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await authService.getUserData();
    setUserData(data);
  };


  if (isLoggingOut) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
          <AppLoader message="Đang đăng xuất..." />
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

