import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { StyleSheet, View, useColorScheme, TouchableOpacity, Animated } from "react-native";
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
import { LinearGradient } from "expo-linear-gradient";

const PRIMARY_COLOR_DARK = '#5A7DFE';
const PRIMARY_COLOR_LIGHT = '#6C63FF';

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = useMemo(() => COLORS[colorScheme ?? 'dark'] ?? COLORS.dark, [colorScheme]);
  const primaryColor = useMemo(() => colorScheme === 'dark' ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT, [colorScheme]);
  const { logout, isLoggingOut } = useLogout();
  const router = useRouter();
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadUserData = useCallback(async () => {
    try {
      const data = await authService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // FAB pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, [loadUserData]);

  const handleFabPress = useCallback(() => {
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.88,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/CreatePost');
    });
  }, [router]);

  if (isLoggingOut || isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
          <AppLoader message={isLoggingOut ? "Đang đăng xuất..." : "Đang tải..."} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={['top']}>
        <ThemeBar />
        <Header
          onNotificationPress={() => router.push('/Activity')}
          onChatPress={() => router.push('/Chat')}
        />
        <Animated.View style={[styles.feedContainer, { opacity: fadeAnim }]}>
          <Feed />
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleFabPress}
            style={styles.fabContainer}
          >
            <Animated.View
              style={[
                styles.fab,
                {
                  transform: [
                    { scale: Animated.multiply(fabScale, fabPulse) },
                  ],
                  shadowColor: primaryColor,
                },
              ]}
            >
              <LinearGradient
                colors={colorScheme === 'dark' 
                  ? [PRIMARY_COLOR_DARK, '#4A6DFE'] 
                  : [PRIMARY_COLOR_LIGHT, '#5B52FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <MaterialIcons name="add" size={28} color="#ffffff" />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
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
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    zIndex: 10,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
