import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useColorScheme,
  Pressable,
} from 'react-native';
import { COLORS, SIZES } from '../constants/color';
import { getAvatarUrl } from '../utils/imageUtils';
import { HeartIcon } from './icons/PostIcons';

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  replies_count?: number;
}

interface CommentItemProps {
  comment: Comment;
  onLike: () => void;
  formatTime: (dateString: string) => string;
  isLast?: boolean;
  onReply?: () => void;
}

export default function CommentItem({
  comment,
  onLike,
  formatTime,
  isLast = false,
  onReply,
}: CommentItemProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const accentColor = colorScheme === 'dark' ? '#7B6CFF' : '#5A7DFE';
  
  const [isLiked, setIsLiked] = useState(comment?.is_liked || false);
  const [likesCount, setLikesCount] = useState(comment?.likes_count || 0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeScaleAnim = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // Animation
    Animated.sequence([
      Animated.timing(likeScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Call parent handler
    onLike();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 14,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
    }).start();
  };

  const formatLikesCount = (count: number) => {
    if (count === 0) return '';
    if (count === 1) return '1 lượt thích';
    if (count < 1000) return `${count} lượt thích`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K lượt thích`;
    return `${(count / 1000000).toFixed(1)}M lượt thích`;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [{ scale: scaleAnim }],
          marginBottom: isLast ? 20 : 16,
        }
      ]}
    >
      <Pressable
        style={styles.commentContainer}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: theme.Text_color + '10',
          borderless: false,
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={
              comment?.user?.avatar
                ? { uri: getAvatarUrl(comment.user.avatar) }
                : require('../assets/logo.png')
            }
            style={styles.avatar}
            defaultSource={require('../assets/logo.png')}
          />
        </View>

        {/* Comment Content */}
        <View style={styles.contentContainer}>
          {/* Comment Bubble */}
          <View style={[
            styles.commentBubble,
            {
              backgroundColor: colorScheme === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.04)',
            }
          ]}>
            <Text style={[styles.username, { color: theme.Text_color }]}>
              {comment?.user?.username || 'Người dùng'}
            </Text>
            <Text style={[styles.commentText, { color: theme.Text_color }]}>
              {comment?.content || ''}
            </Text>
          </View>

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <Text style={[styles.timeText, { color: theme.Text_color + '80' }]}>
              {comment?.created_at ? formatTime(comment.created_at) : 'Vừa xong'}
            </Text>
            
            {likesCount > 0 && (
              <Text style={[styles.likesText, { color: theme.Text_color + '80' }]}>
                {formatLikesCount(likesCount)}
              </Text>
            )}

            {comment.replies_count && comment.replies_count > 0 && (
              <TouchableOpacity
                onPress={onReply}
                style={styles.replyButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.replyText, { color: theme.Text_color + '80' }]}>
                  Trả lời ({comment.replies_count})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Like Button */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [{ scale: likeScaleAnim }],
            }}
          >
            <HeartIcon
              isLiked={isLiked}
              size={18}
              color={isLiked ? '#FF3040' : theme.Text_color + '80'}
            />
          </Animated.View>
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  commentBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  username: {
    fontSize: SIZES.small,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    fontSize: SIZES.font,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    gap: 12,
  },
  timeText: {
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  likesText: {
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  replyButton: {
    paddingVertical: 2,
  },
  replyText: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  likeButton: {
    padding: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
  },
});