import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme, Dimensions } from 'react-native';
import { COLORS } from '../constants/color';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ width, height, borderRadius, style }: any) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius || 4,
          backgroundColor: isDark ? '#333' : '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
};

export default function SkeletonPost() {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.card_background }]}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonItem width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <SkeletonItem width={120} height={14} style={{ marginBottom: 6 }} />
          <SkeletonItem width={80} height={12} />
        </View>
        <View style={{ flex: 1 }} />
        <SkeletonItem width={20} height={20} borderRadius={10} />
      </View>

      {/* Image */}
      <SkeletonItem width={width} height={width} borderRadius={0} />

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <SkeletonItem width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
          <SkeletonItem width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
          <SkeletonItem width={24} height={24} borderRadius={12} />
        </View>
        <SkeletonItem width={24} height={24} borderRadius={12} />
      </View>

      {/* Likes & Caption */}
      <View style={styles.footer}>
        <SkeletonItem width={100} height={14} style={{ marginBottom: 8 }} />
        <SkeletonItem width={width - 32} height={14} style={{ marginBottom: 4 }} />
        <SkeletonItem width={width - 100} height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  headerText: {
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  leftActions: {
    flexDirection: 'row',
  },
  footer: {
    paddingHorizontal: 12,
  },
});
