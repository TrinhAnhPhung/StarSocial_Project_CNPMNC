import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useColorScheme,
  Text,
  RefreshControl,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/color';
import PostCard from './PostCard';
import apiService from '../services/api';
import authService from '../services/authService';
import AppLoader from './AppLoader';

type Post = {
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

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;

  useEffect(() => {
    loadUserData();
    loadPosts();
  }, []);

  const loadUserData = async () => {
    const user = await authService.getUserData();
    setCurrentUser(user);
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts();
      
      if (response.success && response.data) {
        // Transform backend data to match PostCard props
        const transformedPosts = response.data.map((post: any) => {
          // Get first image or video from content
          let mediaUrl = '';
          if (post.image_url) {
            mediaUrl = post.image_url;
          } else if (post.video_url) {
            mediaUrl = post.video_url;
          } else if (post.contents && post.contents.length > 0) {
            const firstContent = post.contents[0];
            mediaUrl = firstContent.image_url || firstContent.video_url || '';
          }

          return {
            id: post.post_id || post.id || post.Post_id,
            username: post.username || post.user_name || post.User_name || 'Người dùng',
            avatar: post.avatar || post.profile_picture || post.profile_picture_url,
            location: post.location || post.Location,
            image: mediaUrl,
            caption: post.content || post.Content || post.caption,
            likes: post.likes_count || post.likes || post.Likes_count || 0,
            likedBy: post.liked_by_username || post.liked_by_user || 'Người dùng',
            isLiked: post.is_liked_by_user || post.is_liked || false,
            isSponsor: post.is_sponsor || false,
            sponsorName: post.sponsor_name,
            sponsorLogo: post.sponsor_logo,
          };
        });
        
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback với dữ liệu mẫu nếu API lỗi
      setPosts(getMockPosts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockPosts = (): Post[] => {
    return [
      {
        id: '1',
        username: 'Bé Mỹ Diệu',
        location: 'Đồng Nai, Việt Nam',
        image: 'https://via.placeholder.com/400x400?text=Build+With+AI',
        caption: 'Ảnh vẽ đẹp quá ò',
        likes: 123456,
        likedBy: 'Tổng Tài',
        isLiked: false,
        isSponsor: true,
        sponsorName: 'FPT',
        sponsorLogo: 'https://via.placeholder.com/60x20?text=FPT',
      },
    ];
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await apiService.unlikePost(postId);
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: false, likes: Math.max(0, p.likes - 1) }
              : p
          )
        );
      } else {
        await apiService.likePost(postId);
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: true, likes: p.likes + 1 }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
    // TODO: Navigate to comments screen
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
    // TODO: Implement share functionality
  };

  const handleBookmark = (postId: string) => {
    console.log('Bookmark post:', postId);
    // TODO: Implement bookmark functionality
  };

  const handleOptions = (postId: string) => {
    console.log('Options for post:', postId);
    // TODO: Show options modal
  };

  if (loading) {
    return (
      <AppLoader
        message="Đang tải bài đăng..."
        containerStyle={[
          styles.loadingContainer,
          { backgroundColor: theme.background_color },
        ]}
        logoSize={64}
      />
    );
  }

  const AnimatedPostCard = React.memo(({ item, index }: { item: Post; index: number }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
        }}
      >
        <PostCard
          post={item}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
          onOptions={handleOptions}
        />
      </Animated.View>
    );
  });

  return (
    <FlatList
      data={posts}
      renderItem={({ item, index }) => <AnimatedPostCard item={item} index={index} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        { backgroundColor: theme.background_color },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colorScheme === 'dark' ? '#5A7DFE' : '#6C63FF'}
          colors={[colorScheme === 'dark' ? '#5A7DFE' : '#6C63FF']}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.Text_color + 'AA' }]}>
            Chưa có bài đăng nào
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: COLORS.medium_font_size,
  },
});

