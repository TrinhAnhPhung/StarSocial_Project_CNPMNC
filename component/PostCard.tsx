import React, { ReactNode, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useColorScheme,
  Animated,
  Pressable,
} from 'react-native';
import { COLORS } from '../constants/color';
import { getAvatarUrl, getPostImageUrl } from '../utils/imageUtils';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, MoreIcon } from './icons/PostIcons';

type PostCardProps = {
  post: {
    id: string;
    username: string;
    avatar?: string;
    location?: string;
    image: string;
    caption?: string;
    likes: number;
    likedBy?: string;
    isLiked?: boolean;
    isSponsor?: boolean;
    sponsorName?: string;
    sponsorLogo?: string;
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onOptions?: (postId: string) => void;
};

type IconButtonProps = {
  children: ReactNode;
  onPress?: (postId: string) => void;
  postId: string;
  accessibilityLabel: string;
  isActive?: boolean;
  accentColor: string;
  colorScheme: string | null | undefined;
};

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onOptions,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const accentColor = colorScheme === 'dark' ? '#7B6CFF' : '#5A7DFE';
  const subtleSurface = colorScheme === 'dark' ? 'rgba(34,34,42,0.9)' : 'rgba(255,255,255,0.96)';
  const profileScale = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const AnimatedImage = useMemo(() => Animated.createAnimatedComponent(Image), []);

  const formatLikes = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleProfilePressIn = () => {
    Animated.spring(profileScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 14,
    }).start();
  };

  const handleProfilePressOut = () => {
    Animated.spring(profileScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
    }).start();
  };

  const handleImageLoad = () => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: subtleSurface,
          shadowColor: colorScheme === 'dark' ? '#00000090' : '#5A7DFE40',
        },
      ]}
    >
      {/* Header - User Info */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.userInfo,
            pressed && { opacity: 0.9 },
          ]}
          onPressIn={handleProfilePressIn}
          onPressOut={handleProfilePressOut}
          accessibilityRole="button"
          accessibilityLabel="Xem thông tin người dùng"
        >
          <Animated.View
            style={[
              styles.avatarWrapper,
              {
                transform: [{ scale: profileScale }],
                shadowColor: accentColor + '50',
              },
            ]}
          >
            <Image
              source={
                post.avatar
                  ? { uri: getAvatarUrl(post.avatar) }
                  : require('../assets/logo.png')
              }
              style={styles.avatar}
              defaultSource={require('../assets/logo.png')}
            />
          </Animated.View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: theme.Text_color }]}>
              {post.username}
            </Text>
            {post.location && (
              <Text style={[styles.location, { color: theme.Text_color + 'AA' }]}>
                {post.location}
              </Text>
            )}
          </View>
        </Pressable>
        <Pressable
          onPress={() => onOptions && onOptions(post.id)}
          style={styles.optionsButton}
          accessibilityRole="button"
          accessibilityLabel="Tùy chọn bài viết"
        >
          <MoreIcon size={20} color={theme.Text_color} />
        </Pressable>
      </View>

      {/* Sponsor Banner */}
      {post.isSponsor && (
        <View style={[styles.sponsorBanner, { backgroundColor: accentColor + '12' }]}>
          <View style={styles.sponsorContent}>
            {post.sponsorLogo && (
              <Image
                source={{ uri: post.sponsorLogo }}
                style={styles.sponsorLogo}
                defaultSource={require('../assets/logo.png')}
              />
            )}
            <Text style={[styles.sponsorText, { color: theme.Text_color + 'AA' }]}>
              Sponsors
            </Text>
          </View>
        </View>
      )}

      {/* Post Image */}
      <View style={styles.imageContainer}>
        <AnimatedImage
          source={{ uri: getPostImageUrl(post.image) }}
          style={[styles.postImage, { opacity: imageOpacity }]}
          resizeMode="cover"
          defaultSource={require('../assets/logo.png')}
          onLoad={handleImageLoad}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <IconButton
            onPress={onLike}
            postId={post.id}
            accessibilityLabel="Thả tim bài viết"
            isActive={post.isLiked}
            accentColor={accentColor}
            colorScheme={colorScheme}
          >
            <HeartIcon
              isLiked={post.isLiked || false}
              size={28}
              color={post.isLiked ? '#FF3040' : theme.Text_color}
            />
          </IconButton>
          <IconButton
            onPress={onComment}
            postId={post.id}
            accessibilityLabel="Bình luận bài viết"
            accentColor={accentColor}
            colorScheme={colorScheme}
          >
            <CommentIcon size={28} color={theme.Text_color} />
          </IconButton>
          <IconButton
            onPress={onShare}
            postId={post.id}
            accessibilityLabel="Chia sẻ bài viết"
            accentColor={accentColor}
            colorScheme={colorScheme}
          >
            <ShareIcon size={28} color={theme.Text_color} />
          </IconButton>
        </View>
        <View style={styles.rightActions}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: theme.Text_color + '33' }]} />
            <View style={[styles.dot, { backgroundColor: theme.Text_color + '33' }]} />
            <View style={[styles.dot, { backgroundColor: theme.Text_color + '33' }]} />
          </View>
          <IconButton
            onPress={onBookmark}
            postId={post.id}
            accessibilityLabel="Lưu bài viết"
            accentColor={accentColor}
            colorScheme={colorScheme}
          >
            <BookmarkIcon size={28} color={theme.Text_color} />
          </IconButton>
        </View>
      </View>

      {/* Likes Count */}
      <View style={styles.likesSection}>
        <Text style={[styles.likesText, { color: theme.Text_color }]}>
          Thích bởi <Text style={styles.boldText}>{post.likedBy || 'Người dùng'}</Text> và{' '}
          <Text style={styles.boldText}>{formatLikes(post.likes)}</Text> lượt thích khác
        </Text>
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionSection}>
          <Text style={[styles.caption, { color: theme.Text_color }]}>
            <Text style={styles.boldText}>{post.username}</Text> {post.caption}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 28,
    paddingBottom: 20,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: COLORS.medium_font_size,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  location: {
    fontSize: COLORS.small_font_size,
    letterSpacing: 0.15,
  },
  optionsButton: {
    padding: 10,
    borderRadius: 18,
  },
  sponsorBanner: {
    marginHorizontal: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
    marginBottom: 12,
  },
  sponsorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sponsorLogo: {
    width: 60,
    height: 20,
    resizeMode: 'contain',
  },
  sponsorText: {
    fontSize: COLORS.small_font_size,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#00000018',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    minWidth: 48,
    minHeight: 48,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  likesSection: {
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  likesText: {
    fontSize: COLORS.medium_font_size,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  boldText: {
    fontWeight: '600',
  },
  captionSection: {
    paddingHorizontal: 18,
  },
  caption: {
    fontSize: COLORS.medium_font_size,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});

function IconButton({
  children,
  onPress,
  postId,
  accessibilityLabel,
  isActive,
  accentColor,
  colorScheme,
}: IconButtonProps) {
  const scaleRef = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleRef, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 16,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleRef, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
    }).start();
  };

  const backgroundColor = isActive
    ? accentColor + '22'
    : colorScheme === 'dark'
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(90,125,254,0.08)';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          transform: [{ scale: pressed ? 0.94 : 1 }],
          shadowColor: accentColor + '40',
        },
      ]}
      onPress={() => onPress && onPress(postId)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleRef }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

