import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import { MaterialIcons } from "@expo/vector-icons";
import apiService from "../services/api";
import { useRouter } from "expo-router";
import { getAvatarUrl } from "../utils/imageUtils";
import { Image } from "react-native";
import AppLoader from "../component/AppLoader";
import { LinearGradient } from "expo-linear-gradient";

interface Conversation {
  id: string;
  participant?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
  unreadCount?: number;
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const theme = {
    ...COLORS[colorScheme ?? "dark"] ?? COLORS.dark,
    card_background: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
    border_color: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    primary_color: '#5A7DFE'
  };
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadConversations();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const result = await apiService.getConversations();
      if (result.success) {
        // Map backend data to frontend interface
        const mappedConversations = (result.data || []).map((item: any) => ({
          id: item.Conversation_id.toString(),
          participant: {
            id: item.OtherUserId || 'group',
            first_name: item.DisplayName || 'Unknown',
            last_name: '',
            avatar: item.Profile_Picture_Url
          },
          lastMessage: {
            content: item.LastMessageContent || '',
            created_at: item.LastMessageTime
          },
          unreadCount: item.UnreadCount
        }));
        setConversations(mappedConversations);
      } else {
        console.error("Error loading conversations:", result.message);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const ConversationItem = React.memo(({ item, index }: { item: Conversation; index: number }) => {
    const itemOpacity = useRef(new Animated.Value(0)).current;
    const itemTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(itemOpacity, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(itemTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index, itemOpacity, itemTranslateY]);

    // Null check for participant
    if (!item.participant) {
      return null;
    }

    const fullName = `${item.participant.first_name || ''} ${item.participant.last_name || ''}`.trim() || 'Người dùng';
    const avatarUrl = getAvatarUrl(item.participant.avatar);

    return (
      <Animated.View
        style={{
          opacity: itemOpacity,
          transform: [{ translateY: itemTranslateY }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.conversationItem,
            {
              backgroundColor: theme.card_background,
              borderBottomColor: theme.border_color + "30",
            },
          ]}
          onPress={() => router.push({
            pathname: "/ChatDetail",
            params: {
              id: item.id,
              userId: item.participant?.id || '',
              name: `${item.participant?.first_name || ''} ${item.participant?.last_name || ''}`.trim(),
              avatar: item.participant?.avatar || ''
            }
          })}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["#5A7DFE", "#4A6DFE"]
                  : ["#6C63FF", "#5B52FF"]
              }
              style={styles.avatarGradient}
            >
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                defaultSource={require("../assets/logo.png")}
              />
            </LinearGradient>
            {item.unreadCount && item.unreadCount > 0 && (
              <View
                style={[
                  styles.unreadBadge,
                  {
                    backgroundColor: "#FF3B30",
                  },
                ]}
              >
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <Text
                style={[styles.conversationName, { color: theme.Text_color }]}
                numberOfLines={1}
              >
                {fullName}
              </Text>
              {item.lastMessage && (
                <Text
                  style={[styles.conversationTime, { color: theme.Text_color + "80" }]}
                >
                  {formatTime(item.lastMessage.created_at)}
                </Text>
              )}
            </View>
            {item.lastMessage && (
              <Text
                style={[styles.lastMessage, { color: theme.Text_color + "CC" }]}
                numberOfLines={1}
              >
                {item.lastMessage.content}
              </Text>
            )}
          </View>

          <MaterialIcons
            name="chevron-right"
            size={24}
            color={theme.Text_color + "60"}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  });

  const renderConversationItem = ({ item, index }: { item: Conversation; index: number }) => {
    return <ConversationItem item={item} index={index} />;
  };

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background_color }]}
          edges={["top"]}
        >
          <ThemeBar />
          <Header />
          <AppLoader message="Đang tải tin nhắn..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <View
        style={[styles.container, { backgroundColor: theme.background_color }]}
      >
        <ThemeBar />
        <Header />
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: theme.background_color,
              opacity: fadeAnim,
            },
          ]}
        >
          {conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={64}
                color={theme.Text_color + "60"}
              />
              <Text style={[styles.emptyText, { color: theme.Text_color + "CC" }]}>
                Chưa có cuộc trò chuyện nào
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.Text_color + "80" }]}>
                Bắt đầu trò chuyện với bạn bè của bạn
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item, index) => item?.id || `conversation-${index}`}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colorScheme === "dark" ? "#5A7DFE" : "#6C63FF"]}
                  tintColor={colorScheme === "dark" ? "#5A7DFE" : "#6C63FF"}
                />
              }
            />
          )}
        </Animated.View>
        <BottomNavigation />
      </View>
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
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: "cover",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

