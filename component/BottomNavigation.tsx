import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/color';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomNavigationProps = {
  userAvatar?: string;
};

const { width } = Dimensions.get('window');

export default function BottomNavigation({ userAvatar }: BottomNavigationProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const scaleAnims = useRef({
    '/Home': new Animated.Value(1),
    '/Explore': new Animated.Value(1),
    '/CreatePost': new Animated.Value(1),
    '/Activity': new Animated.Value(1),
    '/Profile': new Animated.Value(1),
  }).current;

  const isActive = (path: string) => pathname === path;

  const handlePress = (path: string) => {
    const anim = scaleAnims[path as keyof typeof scaleAnims];
    if (anim) {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(anim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
    router.push(path as any);
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.background_color,
        paddingBottom: Math.max(insets.bottom, 10),
        height: 60 + Math.max(insets.bottom, 10),
        borderTopColor: theme.border_color,
      }
    ]}>
      {/* Home Tab */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handlePress('/Home')}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnims['/Home'] }] }}>
          <Ionicons 
            name={isActive('/Home') ? "home" : "home-outline"} 
            size={28} 
            color={isActive('/Home') ? '#3B82F6' : theme.text_secondary} 
          />
        </Animated.View>
        {isActive('/Home') && <Text style={[styles.label, { color: '#3B82F6' }]}>Home</Text>}
      </TouchableOpacity>

      {/* Search/Explore Tab */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handlePress('/Explore')}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnims['/Explore'] }] }}>
          <Ionicons 
            name={isActive('/Explore') ? "search" : "search-outline"} 
            size={28} 
            color={isActive('/Explore') ? '#3B82F6' : theme.text_secondary} 
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Create Post Button (Center) */}
      <View style={styles.centerTabContainer}>
        <TouchableOpacity
          style={[
            styles.centerButton, 
            { 
              backgroundColor: '#3B82F6',
              borderColor: theme.background_color 
            }
          ]}
          onPress={() => handlePress('/CreatePost')}
          activeOpacity={0.9}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnims['/CreatePost'] }] }}>
            <Ionicons name="add" size={32} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Activity/Heart Tab */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handlePress('/Activity')}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnims['/Activity'] }] }}>
          <Ionicons 
            name={isActive('/Activity') ? "heart" : "heart-outline"} 
            size={28} 
            color={isActive('/Activity') ? '#3B82F6' : theme.text_secondary} 
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handlePress('/Profile')}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnims['/Profile'] }] }}>
          {userAvatar ? (
            <View style={[
              styles.avatarContainer, 
              isActive('/Profile') && { borderColor: '#3B82F6', borderWidth: 2 }
            ]}>
              <Image 
                source={{ uri: userAvatar }} 
                style={styles.avatar} 
              />
            </View>
          ) : (
            <Ionicons 
              name={isActive('/Profile') ? "person" : "person-outline"} 
              size={28} 
              color={isActive('/Profile') ? '#3B82F6' : theme.text_secondary} 
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  centerTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // Lift it up higher
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 4,
    borderColor: 'transparent', // Will be set to background color in component
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
