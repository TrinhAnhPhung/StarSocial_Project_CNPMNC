import React, { ReactNode, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useColorScheme,
  Animated,
  Pressable,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/color';
import { getAvatarUrl, getPostImageUrl } from '../utils/imageUtils';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, MoreIcon } from './icons/PostIcons';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';

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
    user_id?: string;
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
};

type IconButtonProps = {
  children: ReactNode;
  onPress?: (postId: string) => void;
  postId: string;
  accessibilityLabel: string;
  isActive?: boolean;
};

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onEdit,
  onDelete,
  onReport,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const accentColor = colorScheme === 'dark' ? '#7B6CFF' : '#5A7DFE';
  const subtleSurface = colorScheme === 'dark' ? 'rgba(34,34,42,0.9)' : 'rgba(255,255,255,0.96)';
  const profileScale = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const AnimatedImage = useMemo(() => Animated.createAnimatedComponent(Image), []);
  
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const MAX_CAPTION_LENGTH = 100;

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await authService.getUserData();
      setCurrentUserId(userData?.id?.toString());
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const isOwner = currentUserId && post.user_id && currentUserId === post.user_id.toString();

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
            <Text style={[styles.username, { color: theme.text_primary }]}>
              {post.username}
            </Text>
            {post.location && (
              <Text style={[styles.location, { color: theme.text_secondary }]}>
                {post.location}
              </Text>
            )}
          </View>
        </Pressable>
        <TouchableOpacity
          onPress={() => setShowOptionsModal(true)}
          style={styles.optionsButton}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={theme.text_primary} />
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card_background }]}>
            {isOwner ? (
              <>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setShowOptionsModal(false);
                    onEdit && onEdit(post.id);
                  }}
                >
                  <Ionicons name="create-outline" size={24} color={COLORS.primary} />
                  <Text style={[styles.modalOptionText, { color: theme.text_primary }]}>
                    Chỉnh sửa bài viết
                  </Text>
                </TouchableOpacity>
                <View style={[styles.modalDivider, { backgroundColor: theme.border_color }]} />
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setShowOptionsModal(false);
                    Alert.alert(
                      'Xóa bài viết',
                      'Bạn có chắc chắn muốn xóa bài viết này?',
                      [
                        { text: 'Hủy', style: 'cancel' },
                        { 
                          text: 'Xóa', 
                          style: 'destructive',
                          onPress: () => onDelete && onDelete(post.id)
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
                  <Text style={[styles.modalOptionText, { color: COLORS.danger }]}>
                    Xóa bài viết
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowOptionsModal(false);
                  onReport && onReport(post.id);
                }}
              >
                <Ionicons name="flag-outline" size={24} color={COLORS.warning} />
                <Text style={[styles.modalOptionText, { color: theme.text_primary }]}>
                  Báo cáo bài viết
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Caption - Moved to top */}
      {post.caption && (
        <View style={styles.captionSection}>
          <Text style={[styles.caption, { color: theme.text_primary }]}>
            {showFullCaption || post.caption.length <= MAX_CAPTION_LENGTH
              ? post.caption
              : `${post.caption.substring(0, MAX_CAPTION_LENGTH)}...`}
          </Text>
          {post.caption.length > MAX_CAPTION_LENGTH && (
            <TouchableOpacity onPress={() => setShowFullCaption(!showFullCaption)}>
              <Text style={[styles.showMoreText, { color: COLORS.primary }]}>
                {showFullCaption ? 'Thu gọn' : 'Hiển thị thêm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
            <Text style={[styles.sponsorText, { color: theme.text_secondary }]}>
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
          >
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={post.isLiked ? '#FF3040' : theme.text_primary}
            />
          </IconButton>
          <IconButton
            onPress={onComment}
            postId={post.id}
            accessibilityLabel="Bình luận bài viết"
          >
            <Ionicons name="chatbubble-outline" size={26} color={theme.text_primary} />
          </IconButton>
          <IconButton
            onPress={onShare}
            postId={post.id}
            accessibilityLabel="Chia sẻ bài viết"
          >
            <Ionicons name="paper-plane-outline" size={26} color={theme.text_primary} />
          </IconButton>
        </View>
        <View style={styles.rightActions}>
          <IconButton
            onPress={onBookmark}
            postId={post.id}
            accessibilityLabel="Lưu bài viết"
          >
            <Ionicons name="bookmark-outline" size={26} color={theme.text_primary} />
          </IconButton>
        </View>
      </View>

      {/* Likes Count */}
      <View style={styles.likesSection}>
        <Text style={[styles.likesText, { color: theme.text_primary }]}>
          <Text style={styles.boldText}>{formatLikes(post.likes)}</Text> lượt thích
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 16,
    paddingBottom: 16,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
    ...FONTS.h3,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    ...FONTS.small,
  },
  optionsButton: {
    padding: 10,
    borderRadius: 18,
  },
  captionSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  caption: {
    ...FONTS.h2,
    lineHeight: 28,
    fontWeight: '400',
  },
  showMoreText: {
    ...FONTS.body3,
    fontWeight: '600',
    marginTop: 8,
  },
  sponsorBanner: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
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
    ...FONTS.small,
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '80%',
    borderRadius: SIZES.radius,
    padding: 8,
    ...SHADOWS.dark,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  modalOptionText: {
    ...FONTS.body3,
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  likesSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  likesText: {
    ...FONTS.body3,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
  },
});

function IconButton({
  children,
  onPress,
  postId,
  accessibilityLabel,
  isActive,
}: IconButtonProps) {
  const scaleRef = useRef(new Animated.Value(1)).current;
  const opacityRef = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleRef, {
        toValue: 0.75,
        useNativeDriver: true,
        speed: 20,
        bounciness: 10,
      }),
      Animated.timing(opacityRef, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleRef, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 12,
      }),
      Animated.timing(opacityRef, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => onPress && onPress(postId)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View 
        style={[
          styles.iconWrapper, 
          { 
            transform: [{ scale: scaleRef }],
            opacity: opacityRef 
          }
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

