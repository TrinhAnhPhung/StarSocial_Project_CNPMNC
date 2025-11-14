import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Animated,
  RefreshControl,
  Modal,
  Dimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import authService from "../services/authService";
import apiService from "../services/api";
import AppLoader from "../component/AppLoader";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

type Post = {
  id: string;
  username: string;
  avatar?: string;
  location?: string;
  image: string;
  caption?: string;
  likes: number;
  isSponsor?: boolean;
  user_id?: string;
  created_at?: string;
  comments_count?: number;
};

type SuggestedUser = {
  id: string;
  username: string;
  avatar?: string;
  backgroundImage: string;
  isFollowing?: boolean;
};

const FALLBACK_IMAGE = "https://via.placeholder.com/400x400?text=Star+Social";
const DEFAULT_BACKGROUND = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d";
const PRIMARY_COLOR_DARK = '#5A7DFE';
const PRIMARY_COLOR_LIGHT = '#6C63FF';

const { width: screenWidth } = Dimensions.get("window");

export default function Explore() {
  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const colorScheme = useColorScheme();
  const theme = useMemo(() => ({
    ...COLORS[colorScheme ?? "dark"],
    background_color: colorScheme === 'dark' ? '#000' : '#FFF',
    card_background: colorScheme === "dark" ? "#1a1a1a" : "#ffffff",
    border_color: colorScheme === "dark" ? "#333333" : "#e0e0e0",
    primary_color: colorScheme === 'dark' ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT,
    Text_color: colorScheme === 'dark' ? '#FFF' : '#000',
  }), [colorScheme]);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const loadUserData = useCallback(async () => {
    const data = await authService.getUserData();
    setUserData(data);
  }, []);

  const loadSuggestedUsers = useCallback(async () => {
    const response = await apiService.getSuggestedUsers();
    if (response.success && Array.isArray(response.data)) {
      const transformedUsers = response.data.map((user: any) => ({
        id: user.id,
        username: user.full_name || user.username,
        avatar: user.profile_picture_url,
        backgroundImage: user.profile_picture_url || DEFAULT_BACKGROUND,
        isFollowing: false,
      }));
      setSuggestedUsers(transformedUsers);
    } else {
      console.error('Failed to load suggested users, using fallback.');
    }
  }, []);

  const loadExploreData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);

      await Promise.all([loadSuggestedUsers()]);

      const response = await apiService.getPosts();
      let fetchedPosts: Post[] = [];
      if (response.success && Array.isArray(response.data)) {
        fetchedPosts = transformPosts(response.data);
      } else {
        fetchedPosts = getMockPosts();
      }

      // Lọc bài viết có ít nhất 3 lượt thích
      const filteredPosts = fetchedPosts.filter(post => (post.likes || 0) >= 3);
      
      // Sắp xếp theo lượt thích và bình luận (ưu tiên bài viết có nhiều tương tác)
      const sortedPosts = filteredPosts.sort((a, b) => {
        const scoreA = (a.likes || 0) + (a.comments_count || 0) * 2;
        const scoreB = (b.likes || 0) + (b.comments_count || 0) * 2;
        return scoreB - scoreA;
      });

      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error loading explore content:", error);
      const mockPosts = getMockPosts();
      const filteredPosts = mockPosts.filter(post => (post.likes || 0) >= 3);
      setPosts(filteredPosts);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [loadSuggestedUsers]);

  useEffect(() => {
    loadUserData();
    loadExploreData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loadExploreData, loadUserData]);

  const handleRefresh = () => loadExploreData(true);
  const handlePostPress = (post: Post) => setSelectedPost(post);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Có thể thêm logic tìm kiếm ở đây
      console.log("Searching for:", searchQuery);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const response = await apiService.followUser(userId);
      if (response.success) {
        setSuggestedUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, isFollowing: !user.isFollowing }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postGridItem} onPress={() => handlePostPress(item)}>
      <Image
        source={item.image ? { uri: item.image } : require("../assets/logo.png")}
        style={styles.postImage}
      />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.searchContainer, { backgroundColor: theme.Text_color + '10' }]}>
        <Feather name="search" size={20} color={theme.Text_color + '80'} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.Text_color + '60'}
          style={[styles.searchInput, { color: theme.Text_color }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <MaterialIcons name="search" size={20} color={theme.primary_color} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestedUsers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>People you may know</Text>
            <TouchableOpacity onPress={() => setShowSuggestions(false)}>
              <Feather name="x" size={20} color={theme.Text_color + '80'} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedList}
          >
            {suggestedUsers.map((user) => (
              <View key={user.id} style={[styles.suggestedCard, { backgroundColor: theme.card_background, borderColor: theme.border_color }]}>
                <ImageBackground source={{ uri: user.backgroundImage }} style={styles.suggestedImageBackground} imageStyle={{ borderRadius: 12 }}>
                </ImageBackground>
                <Text style={[styles.suggestedName, { color: theme.Text_color }]}>{user.username}</Text>
                <View style={styles.suggestedActions}>
                  <TouchableOpacity 
                    style={[
                      styles.followButton, 
                      { backgroundColor: user.isFollowing ? theme.Text_color + '20' : theme.primary_color }
                    ]}
                    onPress={() => handleFollow(user.id)}
                  >
                    <Text style={[
                      styles.followButtonText,
                      { color: user.isFollowing ? theme.Text_color : '#FFF' }
                    ]}>
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {!showSuggestions && (
        <TouchableOpacity 
          style={[styles.showSuggestionsButton, { backgroundColor: theme.Text_color + '10' }]}
          onPress={() => setShowSuggestions(true)}
        >
          <Text style={[styles.showSuggestionsText, { color: theme.Text_color }]}>
            Hiển thị gợi ý người dùng
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>Posts</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={["top"]}>
          <ThemeBar />
          <AppLoader message="Đang tải nội dung khám phá..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={["top"]}>
        <ThemeBar />
        <Animated.View style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh} 
                colors={[theme.primary_color]} 
                tintColor={theme.primary_color} 
              />
            }
          />
        </Animated.View>

        <Modal
          visible={selectedPost !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedPost(null)}
        >
          {selectedPost && (
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background_color }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.border_color + "30" }]}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <MaterialIcons name="close" size={24} color={theme.Text_color} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.Text_color }]}>Chi tiết bài viết</Text>
                <View style={{ width: 24 }} />
              </View>
              <ScrollView>
                <Image source={{ uri: selectedPost.image }} style={styles.modalImage} />
                <View style={styles.modalContent}>
                  <View style={styles.modalUserInfo}>
                    <Image source={selectedPost.avatar ? { uri: selectedPost.avatar } : require('../assets/logo.png')} style={styles.modalAvatar} />
                    <View>
                      <Text style={[styles.modalUsername, { color: theme.Text_color }]}>{selectedPost.username}</Text>
                      {selectedPost.location && <Text style={[styles.modalLocation, { color: theme.Text_color + '80' }]}>{selectedPost.location}</Text>}
                    </View>
                  </View>
                  <Text style={[styles.modalCaption, { color: theme.Text_color }]}>{selectedPost.caption}</Text>
                </View>
              </ScrollView>
            </SafeAreaView>
          )}
        </Modal>

        <SafeAreaView edges={["bottom"]}>
          <BottomNavigation userAvatar={userData?.avatar || userData?.profile_picture} />
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  listContent: { paddingBottom: 80 },
  headerContainer: { paddingTop: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 10 },
  searchButton: {
    padding: 5,
    marginLeft: 5,
  },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { fontSize: 16, fontWeight: '600' },
  suggestedList: { paddingHorizontal: 15, gap: 15 },
  suggestedCard: {
    width: 160,
    borderRadius: 15,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  suggestedImageBackground: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  removeUserButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
    padding: 4,
    margin: 5,
  },
  suggestedName: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  suggestedActions: { flexDirection: 'row', gap: 8 },
  followButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: { fontWeight: 'bold', fontSize: 14 },
  showSuggestionsButton: {
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  showSuggestionsText: { fontSize: 14, fontWeight: '600' },
  postGridItem: { flex: 1 / 3, aspectRatio: 1, padding: 1 },
  postImage: { width: '100%', height: '100%' },
  // Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalImage: { width: '100%', height: screenWidth },
  modalContent: { padding: 15 },
  modalUserInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modalAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  modalUsername: { fontSize: 16, fontWeight: 'bold' },
  modalLocation: { fontSize: 12, color: 'gray' },
  modalCaption: { fontSize: 16, marginTop: 10 },
});

function transformPosts(data: any[]): Post[] {
  return data
    .map((item, index) => mapToPost(item, index))
    .filter((post) => Boolean(post.id));
}

function mapToPost(item: any, index: number): Post {
  const rawId = item.post_id ?? item.id ?? item.Post_id ?? `post-${index}`;
  const mediaUrl = extractMediaUrl(item);
  return {
    id: String(rawId),
    username: item.username || item.user_name || "Người dùng",
    avatar: item.avatar || item.profile_picture || item.profile_picture_url,
    location: item.location || "",
    image: mediaUrl || FALLBACK_IMAGE,
    caption: item.content || item.caption || "",
    likes: item.likes_count || item.likes || 0,
    comments_count: item.comments_count || item.comments || 0,
  };
}

function extractMediaUrl(item: any): string | null {
  if (item.image) return item.image;
  if (item.image_url) return item.image_url;
  if (item.video_url) return item.video_url;
  if (Array.isArray(item.contents) && item.contents.length > 0) {
    const first = item.contents[0];
    return first?.image_url || first?.video_url || null;
  }
  return null;
}

function getMockPosts(): Post[] {
  return [
    { id: 'mock-1', username: 'Hà My', location: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8', caption: 'Góc phố bình yên.', likes: 1250, comments_count: 45 },
    { id: 'mock-2', username: 'Trung Kiên', location: 'Hà Nội', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', caption: 'Work from home.', likes: 980, comments_count: 32 },
    { id: 'mock-3', username: 'Lan Anh', location: 'TP.HCM', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', caption: 'My new puppy!', likes: 2045, comments_count: 89 },
    { id: 'mock-4', username: 'Creative Hub', location: 'Hội An', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', caption: 'Art inspiration.', likes: 512, comments_count: 23 },
    { id: 'mock-5', username: 'Minh Quân', location: 'Đà Lạt', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', caption: 'Fresh air.', likes: 1333, comments_count: 56 },
    { id: 'mock-6', username: 'X Studio', location: 'Nha Trang', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', caption: '#SummerVibes', likes: 1880, comments_count: 67 },
    { id: 'mock-7', username: 'User 7', image: 'https://i.imgur.com/L5O3V5A.jpeg', likes: 100, caption: '', comments_count: 12 },
    { id: 'mock-8', username: 'User 8', image: 'https://i.imgur.com/L5O3V5A.jpeg', likes: 100, caption: '', comments_count: 18 },
    { id: 'mock-9', username: 'User 9', image: 'https://i.imgur.com/L5O3V5A.jpeg', likes: 100, caption: '', comments_count: 25 },
  ];
}
