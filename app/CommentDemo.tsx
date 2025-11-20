import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/color';
import PostCard from '../component/PostCard';
import CommentModal from '../component/CommentModal';

// Demo data for testing
const demoPost = {
  id: 'demo-1',
  username: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
  location: 'Hà Nội, Việt Nam',
  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  caption: 'Một ngày đẹp trời ở Hà Nội! 🌤️ #hanoi #beautiful #sunset',
  likes: 1234,
  likedBy: 'jane_doe',
  isLiked: false,
  isSponsor: false,
};

export default function CommentDemo() {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  
  // Derived colors for consistent theming
  const surfaceColor = colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa';
  const borderColor = colorScheme === 'dark' ? '#333333' : '#e0e0e0';
  
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [post, setPost] = useState(demoPost);

  const handleLike = (postId: string) => {
    setPost(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const handleComment = (postId: string) => {
    setCommentModalVisible(true);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleBookmark = (postId: string) => {
    console.log('Bookmark post:', postId);
  };

  // Hàm này có thể giữ lại để dùng sau, nhưng không truyền vào PostCard lúc này
  const handleOptions = (postId: string) => {
    console.log('Options for post:', postId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
      <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.Text_color }]}>
          Demo Chức năng Bình luận
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        <PostCard
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
          // onOptions={handleOptions} <--- ĐÃ XÓA/COMMENT DÒNG NÀY ĐỂ SỬA LỖI
        />
        
        <View style={[styles.instructionsContainer, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.instructionsTitle, { color: theme.Text_color }]}>
            Hướng dẫn:
          </Text>
          <Text style={[styles.instructionsText, { color: theme.Text_color + 'CC' }]}>
            • Nhấp vào biểu tượng bình luận để mở modal bình luận{'\n'}
            • Viết bình luận và nhấn nút gửi{'\n'}
            • Nhấp vào tim để thích bình luận{'\n'}
            • Modal hỗ trợ cuộn và keyboard
          </Text>
        </View>
      </ScrollView>

      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        postId={post.id}
        postAuthor={post.username}
        postImage={post.image}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  instructionsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});