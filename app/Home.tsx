import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, useColorScheme, Alert, TouchableOpacity, Animated } from "react-native";
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

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const { logout, isLoggingOut } = useLogout();
  const router = useRouter();
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserData();
    
    // FAB pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);

  const loadUserData = async () => {
    const data = await authService.getUserData();
    setUserData(data);
  };

  const handleFabPress = () => {
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.85,
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
    ]).start();
    router.push('/CreatePost');
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
            activeOpacity={0.85}
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
                  backgroundColor: colorScheme === 'dark' ? '#5A7DFE' : '#6C63FF',
                  shadowColor: colorScheme === 'dark' ? '#000000' : '#6C63FF',
                },
              ]}
            >
              <LinearGradient
                colors={colorScheme === 'dark' 
                  ? ['#5A7DFE', '#4A6DFE'] 
                  : ['#6C63FF', '#5B52FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <MaterialIcons name="add" size={28} color="#ffffff" />
              </LinearGradient>
            </Animated.View>
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
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 90,
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

