import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, SIZES } from '../constants/color';
import { getAvatarUrl, getPostImageUrl } from '../utils/imageUtils';
import apiService from '../services/api';
import CommentItem from '../component/CommentItem';

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

interface Post {
  id: string;
  username: string;
  avatar?: string;
  image: string;
  caption?: string;
  likes: number;
  comments_count: number;
  created_at: string;
}

interface CommentsScreenProps {
  route: {
    params: {
      postId: string;
      post?: Post;
    };
  };
  navigation: any;
}

export default function CommentsScreen({ route, navigation }: CommentsScreenProps) {
  const { postId, post } = route.params;
  
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const accentColor = colorScheme === 'dark' ? '#7B6CFF' : '#5A7DFE';
  
  // Derived colors for consistent theming
  const surfaceColor = colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa';
  const borderColor = colorScheme === 'dark' ? '#333333' : '#e0e0e0';
  const inputBackgroundColor = colorScheme === 'dark' ? '#2a2a2a' : '#ffffff';
  const backgroundColor = theme.background_color;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [postData, setPostData] = useState<Post | null>(post || null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
    if (!post) {
      loadPostData();
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success) {
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadPostData = async () => {
    try {
      const response = await apiService.getPost(postId);
      if (response.success) {
        setPostData(response.data);
      }
    } catch (error) {
      console.error('Error loading post data:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getComments(postId);
      if (response.success) {
        setComments(response.data);
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Lỗi', 'Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setPosting(true);
      const response = await apiService.addComment(postId, commentText.trim());
      
      if (response.success) {
        setCommentText('');
        textInputRef.current?.blur();
        
        // Refresh comments to get updated list
        await loadComments();
        
        // Scroll to bottom to show new comment
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Lỗi', 'Không thể thêm bình luận');
    } finally {
      setPosting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await apiService.likeComment(postId, commentId);
      if (response.success) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId
              ? {
                  ...comment,
                  is_liked: !comment.is_liked,
                  likes_count: comment.is_liked 
                    ? comment.likes_count - 1 
                    : comment.likes_count + 1
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: backgroundColor, borderBottomColor: borderColor }]}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Text style={[styles.backButtonText, { color: theme.Text_color }]}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.Text_color }]}>Bình luận</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderPostPreview = () => {
    if (!postData) return null;
    
    return (
      <View style={[styles.postPreview, { 
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(255,255,255,0.04)' 
          : 'rgba(0,0,0,0.02)',
        borderBottomColor: borderColor 
      }]}>
        <View style={styles.postHeader}>
          <Image
            source={
              postData?.avatar
                ? { uri: getAvatarUrl(postData.avatar) }
                : require('../assets/logo.png')
            }
            style={styles.postAvatar}
          />
          <Text style={[styles.postUsername, { color: theme.Text_color }]}>
            {postData?.username || 'Người dùng'}
          </Text>
          <Text style={[styles.postTime, { color: theme.Text_color + '80' }]}>
            {postData?.created_at ? formatTime(postData.created_at) : ''}
          </Text>
        </View>
        
        {postData?.image && (
          <Image
            source={{ uri: getPostImageUrl(postData.image) }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        
        {postData?.caption && (
          <Text style={[styles.postCaption, { color: theme.Text_color }]}>
            {postData.caption}
          </Text>
        )}
      </View>
    );
  };

  const renderCommentInput = () => (
    <View style={[styles.commentInputContainer, { 
      backgroundColor: backgroundColor,
      borderTopColor: borderColor 
    }]}>
      <Image
        source={
          currentUser?.avatar
            ? { uri: getAvatarUrl(currentUser.avatar) }
            : require('../assets/logo.png')
        }
        style={styles.userAvatar}
        defaultSource={require('../assets/logo.png')}
      />
      <View style={styles.inputWrapper}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            {
              backgroundColor: inputBackgroundColor,
              color: theme.Text_color,
              borderColor: borderColor,
            },
          ]}
          placeholder="Viết bình luận..."
          placeholderTextColor={theme.Text_color + '80'}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: commentText.trim() ? accentColor : borderColor,
            },
          ]}
          onPress={handleAddComment}
          disabled={!commentText.trim() || posting}
          activeOpacity={0.8}
        >
          {posting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.sendButtonText}>
              →
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {renderHeader()}
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderPostPreview()}
          
          <View style={styles.commentsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={accentColor} />
                <Text style={[styles.loadingText, { color: theme.Text_color }]}>
                  Đang tải bình luận...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.Text_color + '80' }]}>
                  Chưa có bình luận nào
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.Text_color + '60' }]}>
                  Hãy là người đầu tiên bình luận về bài viết này!
                </Text>
              </View>
            ) : (
              (comments || []).map((comment, index) => (
                comment && comment.id ? (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onLike={() => handleLikeComment(comment.id)}
                    formatTime={formatTime}
                    isLast={index === comments.length - 1}
                  />
                ) : null
              ))
            )}
          </View>
        </ScrollView>

        {renderCommentInput()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  postPreview: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  postAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  postUsername: {
    fontSize: SIZES.font,
    fontWeight: '600',
    flex: 1,
  },
  postTime: {
    fontSize: SIZES.small,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  postCaption: {
    fontSize: SIZES.font,
    lineHeight: 20,
  },
  commentsContainer: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    gap: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});