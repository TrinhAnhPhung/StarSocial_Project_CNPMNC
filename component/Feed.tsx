import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/color';
import PostCard from './PostCard';
import apiService from '../services/api';
import authService from '../services/authService';

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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background_color }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={[styles.loadingText, { color: theme.Text_color }]}>
          Đang tải bài đăng...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
          onOptions={handleOptions}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        { backgroundColor: theme.background_color },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#007bff"
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: COLORS.medium_font_size,
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

