import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
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

  const formatLikes = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background_color }]}>
      {/* Header - User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={
              post.avatar
                ? { uri: getAvatarUrl(post.avatar) }
                : require('../assets/logo.png')
            }
            style={styles.avatar}
            defaultSource={require('../assets/logo.png')}
          />
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
        </View>
        <TouchableOpacity
          onPress={() => onOptions && onOptions(post.id)}
          style={styles.optionsButton}
        >
          <MoreIcon size={20} color={theme.Text_color} />
        </TouchableOpacity>
      </View>

      {/* Sponsor Banner */}
      {post.isSponsor && (
        <View style={[styles.sponsorBanner, { backgroundColor: theme.Text_color + '05' }]}>
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
        <Image
          source={{ uri: getPostImageUrl(post.image) }}
          style={styles.postImage}
          resizeMode="cover"
          defaultSource={require('../assets/logo.png')}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={() => onLike && onLike(post.id)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <HeartIcon 
              isLiked={post.isLiked || false} 
              size={28} 
              color={post.isLiked ? '#FF3040' : theme.Text_color} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onComment && onComment(post.id)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <CommentIcon size={28} color={theme.Text_color} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onShare && onShare(post.id)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <ShareIcon size={28} color={theme.Text_color} />
          </TouchableOpacity>
        </View>
        <View style={styles.rightActions}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: theme.Text_color + '40' }]} />
            <View style={[styles.dot, { backgroundColor: theme.Text_color + '40' }]} />
            <View style={[styles.dot, { backgroundColor: theme.Text_color + '40' }]} />
          </View>
          <TouchableOpacity
            onPress={() => onBookmark && onBookmark(post.id)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <BookmarkIcon size={28} color={theme.Text_color} />
          </TouchableOpacity>
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
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E020',
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E0E0E0',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: COLORS.medium_font_size,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    fontSize: COLORS.small_font_size,
  },
  optionsButton: {
    padding: 5,
  },
  optionsIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sponsorBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    fontSize: COLORS.small_font_size,
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E0E0E0',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionButton: {
    padding: 5,
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
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  likesText: {
    fontSize: COLORS.medium_font_size,
  },
  boldText: {
    fontWeight: '600',
  },
  captionSection: {
    paddingHorizontal: 12,
  },
  caption: {
    fontSize: COLORS.medium_font_size,
    lineHeight: 20,
  },
});

