import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import { useState, useEffect } from "react";
import authService from "../services/authService";

export default function Activity() {
  const [userData, setUserData] = useState<any>(null);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await authService.getUserData();
    setUserData(data);
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={['top']}>
        <ThemeBar />
        <Header />
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.Text_color }]}>
            Hoạt động
          </Text>
          <Text style={[styles.subtitle, { color: theme.Text_color + 'AA' }]}>
            Tính năng đang phát triển
          </Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: COLORS.medium_font_size,
  },
});

