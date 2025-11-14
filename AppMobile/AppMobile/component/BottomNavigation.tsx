import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/color';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type BottomNavigationProps = {
  userAvatar?: string;
};

const navigationItems = [
  { path: '/Home', iconName: 'home', label: 'Trang chủ' },
  { path: '/Explore', iconName: 'explore', label: 'Khám phá' },
  { path: '/CreatePost', iconName: 'add-circle-outline', label: 'Tạo bài' },
  { path: '/Activity', iconName: 'notifications', label: 'Hoạt động' },
  { path: '/Profile', iconName: 'person', label: 'Cá nhân' },
];

export default function BottomNavigation({ userAvatar }: BottomNavigationProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();
  const pathname = usePathname();
  const scaleAnims = useRef(
    navigationItems.reduce((acc, item) => {
      acc[item.path] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;
  const navOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(navOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const isActive = (path: string) => pathname === path;

  const handlePress = (path: string, index: number) => {
    const anim = scaleAnims[path];
    if (anim) {
      Animated.sequence([
        Animated.spring(anim, {
          toValue: 0.75,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(anim, {
          toValue: 1,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
    router.push(path as any);
  };

  const gradientColors = colorScheme === 'dark' 
    ? ['rgba(38,38,38,0.98)', 'rgba(30,30,30,0.95)']
    : ['rgba(255,255,255,0.98)', 'rgba(250,250,252,0.95)'];

  return (
    <Animated.View style={{ opacity: navOpacity }}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {navigationItems.map((item, index) => {
          const active = isActive(item.path);
          const scaleAnim = scaleAnims[item.path] || new Animated.Value(1);
          const activeColor = active ? (colorScheme === 'dark' ? '#5A7DFE' : '#6C63FF') : theme.Text_color + '80';
          
          // Hiển thị avatar nếu có, nếu không thì hiển thị icon person
          if (item.path === '/Profile') {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(item.path, index)}
                style={styles.navItem}
                activeOpacity={0.7}
              >
                <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                  {userAvatar ? (
                    <View style={[styles.avatarWrapper, active && styles.activeAvatarWrapper]}>
                      <Image
                        source={{ uri: userAvatar }}
                        style={[styles.profileAvatar, active && styles.activeProfile]}
                        defaultSource={require('../assets/logo.png')}
                      />
                      {active && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
                    </View>
                  ) : (
                    <View style={[styles.iconContainer, active && { backgroundColor: activeColor + '15' }]}>
                      <MaterialIcons
                        name="person"
                        size={24}
                        color={activeColor}
                      />
                      {active && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(item.path, index)}
              style={styles.navItem}
              activeOpacity={0.7}
            >
              <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                <View style={[styles.iconContainer, active && { backgroundColor: activeColor + '15' }]}>
                  <MaterialIcons
                    name={item.iconName as any}
                    size={24}
                    color={activeColor}
                  />
                  {active && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224,224,224,0.08)',
    height: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeProfile: {
    borderColor: 'transparent',
  },
  activeAvatarWrapper: {
    shadowColor: '#5A7DFE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});

