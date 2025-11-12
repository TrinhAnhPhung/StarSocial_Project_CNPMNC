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
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import authService from "../services/authService";
import apiService from "../services/api";
import AppLoader from "../component/AppLoader";

type Post = {
  id: string;
  username: string;
  avatar?: string;
  location?: string;
  image: string;
  caption?: string;
  likes: number;
  isSponsor?: boolean;
};

type SuggestedUser = {
  id: string;
  username: string;
  avatar?: string;
};

const FALLBACK_IMAGE = "https://via.placeholder.com/400x400?text=Star+Social";

const DEFAULT_SUGGESTED_USERS: SuggestedUser[] = [
  { id: "suggest-1", username: "Star Social" },
  { id: "suggest-2", username: "Creative Hub" },
  { id: "suggest-3", username: "Tech Trends" },
];

export default function Explore() {
  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? "dark"] ?? COLORS.dark;

  const loadUserData = useCallback(async () => {
    const data = await authService.getUserData();
    setUserData(data);
  }, []);

  const loadExploreData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const response = await apiService.getPosts();
      let fetchedPosts: Post[] = [];

      if (response.success && Array.isArray(response.data)) {
        fetchedPosts = transformPosts(response.data);
      }

      if (!fetchedPosts.length) {
        fetchedPosts = getMockPosts();
      }

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading explore content:", error);
      const fallbackPosts = getMockPosts();
      setPosts(fallbackPosts);
      setErrorMessage("Không thể tải dữ liệu mới, hiển thị nội dung mẫu.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    loadExploreData();
  }, [loadExploreData, loadUserData]);

  const filteredPosts = useMemo(
    () => filterPostsByQuery(posts, searchQuery),
    [posts, searchQuery]
  );

  const trendingTags = useMemo(() => {
    const tags = computeTrendingTags(posts);
    if (tags.length) {
      return tags;
    }
    return ["#StarSocial", "#KhámPhá", "#Trending"];
  }, [posts]);

  const suggestedUsers = useMemo(() => {
    const suggestions = computeSuggestedUsers(posts);
    return suggestions.length ? suggestions : DEFAULT_SUGGESTED_USERS;
  }, [posts]);

  const handleRefresh = () => {
    loadExploreData(true);
  };

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag);
  };

  const handleSuggestedUserPress = (username: string) => {
    setSearchQuery(username);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={[
        styles.postCard,
        {
          backgroundColor: theme.Text_color + "10",
          borderColor: theme.Text_color + "15",
        },
      ]}
      activeOpacity={0.85}
    >
      <Image
        source={item.image ? { uri: item.image } : require("../assets/logo.png")}
        style={styles.postImage}
        defaultSource={require("../assets/logo.png")}
      />
      <View
        style={[
          styles.postInfoContainer,
          { backgroundColor: theme.background_color + "AA" },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.postUsername, { color: theme.Text_color }]}
        >
          {item.username}
        </Text>
        {item.location ? (
          <Text
            numberOfLines={1}
            style={[styles.postLocation, { color: theme.Text_color + "99" }]}
          >
            {item.location}
          </Text>
        ) : null}
      </View>
      {item.isSponsor ? (
        <View style={[styles.sponsorBadge, { backgroundColor: "#ff9800" }]}>
          <Text style={styles.sponsorBadgeText}>Tài trợ</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[styles.title, { color: theme.Text_color }]}>Khám phá</Text>
      <Text style={[styles.subtitle, { color: theme.Text_color + "AA" }]}>
        Tìm kiếm xu hướng mới và kết nối với cộng đồng StarSocial
      </Text>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.Text_color + "10",
            borderColor: theme.Text_color + "20",
          },
        ]}
      >
        <MaterialIcons name="search" size={20} color={theme.Text_color + "80"} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm bài viết, hashtag hoặc người dùng..."
          placeholderTextColor={theme.Text_color + "60"}
          style={[styles.searchInput, { color: theme.Text_color }]}
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <MaterialIcons name="close" size={18} color={theme.Text_color + "80"} />
          </TouchableOpacity>
        ) : null}
      </View>

      {errorMessage ? (
        <Text style={[styles.errorText, { color: "#ff5252" }]}>{errorMessage}</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>Xu hướng</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingList}
        >
          {trendingTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.trendingTag,
                {
                  backgroundColor: theme.Text_color + "15",
                  borderColor: theme.Text_color + "25",
                },
              ]}
              onPress={() => handleTagPress(tag)}
              activeOpacity={0.7}
            >
              <Text style={[styles.trendingTagText, { color: theme.Text_color }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>Gợi ý theo dõi</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedList}
        >
          {suggestedUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.suggestedCard,
                {
                  backgroundColor: theme.Text_color + "10",
                  borderColor: theme.Text_color + "15",
                },
              ]}
              activeOpacity={0.75}
              onPress={() => handleSuggestedUserPress(user.username)}
            >
              <Image
                source={
                  user.avatar
                    ? { uri: user.avatar }
                    : require("../assets/logo.png")
                }
                style={styles.suggestedAvatar}
                defaultSource={require("../assets/logo.png")}
              />
              <Text
                numberOfLines={1}
                style={[styles.suggestedName, { color: theme.Text_color }]}
              >
                {user.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {searchQuery ? (
        <Text style={[styles.sectionSubtitle, { color: theme.Text_color + "AA" }]}>
          Kết quả cho "{searchQuery}"
        </Text>
      ) : (
        <Text style={[styles.sectionSubtitle, { color: theme.Text_color + "AA" }]}>
          Lựa chọn hàng đầu dành cho bạn
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background_color }]}
          edges={["top"]}
        >
          <ThemeBar />
          <Header />
          <AppLoader message="Đang tải nội dung khám phá..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background_color }]}
        edges={["top"]}
      >
        <ThemeBar />
        <Header />
        <View style={styles.content}>
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderPostItem}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { backgroundColor: theme.background_color },
            ]}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyTitle, { color: theme.Text_color }]}>
                  Không tìm thấy nội dung phù hợp
          </Text>
                <Text style={[styles.emptySubtitle, { color: theme.Text_color + "99" }]}>
                  Thử tìm kiếm từ khóa khác hoặc chọn một hashtag xu hướng.
          </Text>
              </View>
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </View>
        <SafeAreaView edges={["bottom"]}>
          <BottomNavigation userAvatar={userData?.avatar || userData?.profile_picture} />
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: COLORS.medium_font_size,
    lineHeight: 22,
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: COLORS.medium_font_size,
    marginHorizontal: 8,
  },
  clearButton: {
    padding: 4,
  },
  errorText: {
    marginBottom: 8,
    fontSize: COLORS.small_font_size,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: COLORS.large_font_size,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionSubtitle: {
    marginTop: 20,
    fontSize: COLORS.medium_font_size,
    fontWeight: "500",
  },
  trendingList: {
    gap: 10,
    paddingRight: 6,
  },
  trendingTag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  trendingTagText: {
    fontSize: COLORS.small_font_size,
    fontWeight: "600",
  },
  suggestedList: {
    gap: 12,
    paddingRight: 6,
  },
  suggestedCard: {
    width: 110,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    gap: 10,
  },
  suggestedAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0E0E0",
  },
  suggestedName: {
    fontSize: COLORS.small_font_size,
    textAlign: "center",
    fontWeight: "600",
  },
  postCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    aspectRatio: 1,
    marginHorizontal: 4,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postInfoContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  postUsername: {
    fontSize: COLORS.medium_font_size,
    fontWeight: "600",
  },
  postLocation: {
    fontSize: COLORS.small_font_size,
    marginTop: 2,
  },
  sponsorBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sponsorBadgeText: {
    color: "#ffffff",
    fontSize: COLORS.small_font_size,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: COLORS.large_font_size,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: COLORS.medium_font_size,
    textAlign: "center",
  },
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
    username:
      item.username ||
      item.user_name ||
      item.User_name ||
      "Người dùng",
    avatar: item.avatar || item.profile_picture || item.profile_picture_url,
    location: item.location || item.Location || "",
    image: mediaUrl || FALLBACK_IMAGE,
    caption: item.content || item.Content || item.caption || "",
    likes: item.likes_count || item.likes || item.Likes_count || 0,
    isSponsor: Boolean(item.is_sponsor),
  };
}

function extractMediaUrl(item: any): string | null {
  if (item.image) {
    return item.image;
  }
  if (item.image_url) {
    return item.image_url;
  }
  if (item.video_url) {
    return item.video_url;
  }
  if (Array.isArray(item.contents) && item.contents.length > 0) {
    const first = item.contents[0];
    return first?.image_url || first?.video_url || null;
  }
  return null;
}

function getMockPosts(): Post[] {
  return [
    {
      id: "mock-1",
      username: "Hà My",
      location: "Đà Nẵng, Việt Nam",
      image: "https://images.unsplash.com/photo-1522771930-78848d9293e8",
      caption: "Khám phá góc phố bình yên vào buổi chiều muộn.",
      likes: 1250,
      isSponsor: false,
    },
    {
      id: "mock-2",
      username: "Trung Kiên",
      location: "Hà Nội",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      caption: "Thêm một dự án thú vị cùng team công nghệ! #TechLife",
      likes: 980,
      isSponsor: true,
    },
    {
      id: "mock-3",
      username: "Lan Anh",
      location: "TP. Hồ Chí Minh",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      caption: "Cuối tuần thư giãn với những người bạn thân thiết. #Friends",
      likes: 2045,
      isSponsor: false,
    },
    {
      id: "mock-4",
      username: "Creative Hub",
      location: "Hội An",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      caption: "Nguồn cảm hứng nghệ thuật từ những sắc màu cổ kính.",
      likes: 512,
      isSponsor: false,
    },
    {
      id: "mock-5",
      username: "Minh Quân",
      location: "Đà Lạt",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      caption: "Trốn thành phố lên Đà Lạt hít thở không khí trong lành.",
      likes: 1333,
      isSponsor: false,
    },
    {
      id: "mock-6",
      username: "X Studio",
      location: "Nha Trang",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      caption: "#SummerVibes cùng với những dự án sáng tạo!",
      likes: 1880,
      isSponsor: true,
    },
  ];
}

function filterPostsByQuery(posts: Post[], query: string): Post[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return posts;
  }

  return posts.filter((post) => {
    const captionMatch = post.caption?.toLowerCase().includes(normalized);
    const usernameMatch = post.username.toLowerCase().includes(normalized);
    const locationMatch = post.location?.toLowerCase().includes(normalized);
    const hashtagMatch = computeHashtagsFromCaption(post.caption).some((tag) =>
      tag.toLowerCase().includes(normalized)
    );
    return captionMatch || usernameMatch || locationMatch || hashtagMatch;
  });
}

function computeTrendingTags(posts: Post[]): string[] {
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    const hashtags = computeHashtagsFromCaption(post.caption);
    hashtags.forEach((tag) => {
      const normalized = tag.trim();
      if (!normalized) {
        return;
      }
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);
}

function computeSuggestedUsers(posts: Post[]): SuggestedUser[] {
  const seen = new Set<string>();
  const suggestions: SuggestedUser[] = [];

  posts.forEach((post) => {
    const key = post.username.trim();
    if (key && !seen.has(key)) {
      suggestions.push({
        id: `suggest-${key}`,
        username: post.username,
        avatar: post.avatar,
      });
      seen.add(key);
    }
  });

  return suggestions.slice(0, 10);
}

function computeHashtagsFromCaption(caption?: string): string[] {
  if (!caption) {
    return [];
  }
  const matches = caption.match(/#[a-zA-Z0-9_]+/g);
  return matches ?? [];
}

