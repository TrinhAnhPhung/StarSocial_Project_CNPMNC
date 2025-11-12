import { useState, useEffect } from "react";
import { StyleSheet, View, useColorScheme, Alert, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import authService from "../services/authService";
import Header from "../component/Header";
import Feed from "../component/Feed";
import BottomNavigation from "../component/BottomNavigation";
import { useLogout } from "../hooks/useLogout";
import AppLoader from "../component/AppLoader";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const { logout, isLoggingOut } = useLogout();
  const router = useRouter();

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
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: colorScheme === 'dark' ? '#5A7DFE' : '#6C63FF',
                shadowColor: colorScheme === 'dark' ? '#000000' : '#6C63FF',
              },
            ]}
            activeOpacity={0.85}
            onPress={() => router.push('/CreatePost')}
          >
            <MaterialIcons name="add" size={28} color="#ffffff" />
          </TouchableOpacity>
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
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});

