import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Animated,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/color';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';
import { useRouter, usePathname } from 'expo-router';

type HeaderProps = {
  onNotificationPress?: () => void;
  onChatPress?: () => void;
};

export default function Header({ onNotificationPress, onChatPress }: HeaderProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const logoScale = useRef(new Animated.Value(1)).current;
  const notificationScale = useRef(new Animated.Value(1)).current;
  const chatScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1.05,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });

    // Load unread count
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const response = await apiService.getUnreadCount();
    if (response.success) {
      setUnreadCount(response.count);
    }
  };

  const handleNotificationPress = () => {
    Animated.sequence([
      Animated.spring(notificationScale, {
        toValue: 0.85,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(notificationScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    if (pathname !== '/Activity') {
      router.push('/Activity');
    }
    onNotificationPress?.();
  };

  const handleChatPress = () => {
    Animated.sequence([
      Animated.spring(chatScale, {
        toValue: 0.85,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(chatScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    if (pathname !== '/Chat') {
      router.push('/Chat');
    }
    onChatPress?.();
  };

  const gradientColors = colorScheme === 'dark' 
    ? ['rgba(38,38,38,0.95)', 'rgba(30,30,30,0.98)']
    : ['rgba(255,255,255,0.98)', 'rgba(250,250,252,0.95)'];

  return (
    <Animated.View style={[styles.container, { opacity: headerOpacity }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={handleNotificationPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: notificationScale }] }}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.Text_color + '08' }]}>
                  <MaterialIcons name="notifications" size={22} color={theme.Text_color} />
                  {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: '#FF3040' }]}>
                      <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChatPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: chatScale }] }}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.Text_color + '08' }]}>
                  <MaterialIcons name="chat" size={22} color={theme.Text_color} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224,224,224,0.08)',
  },
  gradient: {
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 30,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

