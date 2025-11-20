import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/color';
import apiService from '../services/api';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
  onNotificationPress?: () => void;
  onChatPress?: () => void;
};

export default function Header({ onNotificationPress, onChatPress }: HeaderProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const insets = useSafeAreaInsets();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadUnreadCount();
    loadUnreadChatCount();
    const interval = setInterval(() => {
      loadUnreadCount();
      loadUnreadChatCount();
    }, 5000); // Poll every 5 seconds for better responsiveness
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadCount();
      if (response.success) setUnreadCount(response.count);
    } catch (error) {
      console.log('Header load error', error);
    }
  };

  const loadUnreadChatCount = async () => {
    try {
      const response = await apiService.getUnreadChatCount();
      if (response.success) setUnreadChatCount(response.count);
    } catch (error) {
      console.log('Header chat load error', error);
    }
  };

  const handlePress = (route: string) => {
    if (pathname !== route) {
      router.push(route as any);
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.background_color,
        paddingTop: insets.top,
        height: 60 + insets.top
      }
    ]}>
      <View style={styles.content}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={() => handlePress('/Activity')}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={28} color={theme.text_primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlePress('/Chat')}
            style={styles.iconButton}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={theme.text_primary} />
            {unreadChatCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadChatCount > 99 ? '99+' : unreadChatCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingBottom: 5,
    paddingHorizontal: SIZES.padding,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  logo: {
    width: 160,
    height: 50,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});