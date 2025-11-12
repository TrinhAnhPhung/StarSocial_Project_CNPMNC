import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/color';
import { useRouter, usePathname } from 'expo-router';

type BottomNavigationProps = {
  userAvatar?: string;
};

export default function BottomNavigation({ userAvatar }: BottomNavigationProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { path: '/Home', iconName: 'home', label: 'Trang chủ' },
    { path: '/Explore', iconName: 'explore', label: 'Khám phá' },
    { path: '/CreatePost', iconName: 'add-circle-outline', label: 'Tạo bài' },
    { path: '/Activity', iconName: 'notifications', label: 'Hoạt động' },
    { path: '/Profile', iconName: 'person', label: 'Cá nhân' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background_color, borderTopColor: '#E0E0E020' }]}>
      {navigationItems.map((item, index) => {
        const active = isActive(item.path);
        
        // Hiển thị avatar nếu có, nếu không thì hiển thị icon person
        if (item.path === '/Profile') {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.path as any)}
              style={styles.navItem}
              activeOpacity={0.7}
            >
              {userAvatar ? (
                <Image
                  source={{ uri: userAvatar }}
                  style={[styles.profileAvatar, active && styles.activeProfile]}
                  defaultSource={require('../assets/logo.png')}
                />
              ) : (
                <MaterialIcons
                  name="person"
                  size={24}
                  color={active ? '#007bff' : theme.Text_color + '80'}
                />
              )}
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.path as any)}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={item.iconName as any}
              size={24}
              color={active ? '#007bff' : theme.Text_color + '80'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    height: 60,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeProfile: {
    borderColor: '#007bff',
  },
});

