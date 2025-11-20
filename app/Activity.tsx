import { StyleSheet, Text, View, useColorScheme, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS, SIZES } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import { useState, useEffect, useRef } from "react";
import authService from "../services/authService";
import apiService from "../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import { getAvatarUrl } from "../utils/imageUtils";
import { Animated } from "react-native";
import AppLoader from "../component/AppLoader";

type Notification = {
  id: number;
  actor_id: string;
  actor_username: string;
  actor_avatar: string;
  notification_type: string;
  message: string;
  post_id?: number;
  is_read: boolean;
  created_at: string;
};

export default function Activity() {
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? "dark"] ?? COLORS.dark;

  useEffect(() => {
    loadUserData();
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadUserData = async () => {
    const data = await authService.getUserData();
    setUserData(data);
  };

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    const response = await apiService.getUnreadCount();
    if (response.success) {
      setUnreadCount(response.count);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    loadUnreadCount();
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.is_read) {
      await apiService.markNotificationRead(notification.id);
      setNotifications(
        notifications.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "favorite";
      case "comment":
        return "comment";
      case "follow":
        return "person-add";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "like":
        return "#FF3040";
      case "comment":
        return "#5A7DFE";
      case "follow":
        return "#4CAF50";
      default:
        return theme.Text_color;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={["top"]}>
          <ThemeBar />
          <Header />
          <AppLoader message="Đang tải thông báo..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={[styles.container, { backgroundColor: theme.background_color }]}>
        <ThemeBar />
        <Header />
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.Text_color }]}>Hoạt động</Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: "#FF3040" }]}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colorScheme === "dark" ? "#5A7DFE" : "#6C63FF"}
            />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={64} color={theme.Text_color + "40"} />
              <Text style={[styles.emptyText, { color: theme.Text_color + "80" }]}>
                Chưa có thông báo nào
              </Text>
            </View>
          ) : (
            notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                theme={theme}
                colorScheme={colorScheme}
                onPress={handleNotificationPress}
                getIcon={getNotificationIcon}
                getColor={getNotificationColor}
                formatTime={formatTime}
                index={index}
              />
            ))
          )}
        </ScrollView>
        <View>
          <BottomNavigation userAvatar={userData?.avatar || userData?.profile_picture} />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

function NotificationItem({
  notification,
  theme,
  colorScheme,
  onPress,
  getIcon,
  getColor,
  formatTime,
  index,
}: {
  notification: Notification;
  theme: any;
  colorScheme: string | null | undefined;
  onPress: (notification: Notification) => void;
  getIcon: (type: string) => string;
  getColor: (type: string) => string;
  formatTime: (date: string) => string;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 50,
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
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: notification.is_read
              ? theme.background_color
              : theme.Text_color + "08",
            borderLeftColor: getColor(notification.notification_type),
          },
        ]}
        onPress={() => onPress(notification)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getColor(notification.notification_type) + "15" },
            ]}
          >
            <MaterialIcons
              name={getIcon(notification.notification_type) as any}
              size={24}
              color={getColor(notification.notification_type)}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.userInfo}>
              {notification.actor_avatar ? (
                <Image
                  source={{ uri: getAvatarUrl(notification.actor_avatar) }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.Text_color + "20" }]}>
                  <MaterialIcons name="person" size={20} color={theme.Text_color + "60"} />
                </View>
              )}
              <Text style={[styles.username, { color: theme.Text_color }]}>
                {notification.actor_username || "Người dùng"}
              </Text>
            </View>
            <Text style={[styles.message, { color: theme.Text_color + "AA" }]}>
              {notification.message}
            </Text>
            <Text style={[styles.time, { color: theme.Text_color + "60" }]}>
              {formatTime(notification.created_at)}
            </Text>
          </View>
        </View>
        {!notification.is_read && (
          <View style={[styles.unreadDot, { backgroundColor: getColor(notification.notification_type) }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  title: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: "bold",
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: SIZES.font,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  notificationContent: {
    flexDirection: "row",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: SIZES.font,
    fontWeight: "600",
  },
  message: {
    fontSize: SIZES.font,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: SIZES.small,
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
