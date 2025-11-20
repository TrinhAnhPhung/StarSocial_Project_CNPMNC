import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import { MaterialIcons } from "@expo/vector-icons";
import apiService from "../services/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAvatarUrl } from "../utils/imageUtils";
import { Image } from "react-native";
import AppLoader from "../component/AppLoader";
import authService from "../services/authService";
import socketService from "../services/socket";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
}

export default function ChatDetail() {
  const { id: conversationId, userId, name, avatar } = useLocalSearchParams<{
    id: string;
    userId: string;
    name?: string;
    avatar?: string;
  }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState(name || "Người dùng");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? "dark"] ?? COLORS.dark;
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (name) setParticipantName(name);
    loadCurrentUser();
    loadMessages();
    
    // Connect to socket
    const socket = socketService.connect();
    
    if (conversationId) {
      socketService.joinRoom(conversationId);
      
      // Listen for new messages
      socketService.onReceiveMessage((newMessage: any) => {
        console.log("Received message:", newMessage);
        
        setMessages((prev) => {
          // Check if message already exists by ID
          const exists = prev.some(msg => msg.id === newMessage.Message_id.toString());
          if (exists) return prev;
          
          const formattedMessage: Message = {
            id: newMessage.Message_id.toString(),
            content: newMessage.Content,
            sender_id: newMessage.Sender_id,
            created_at: newMessage.Sent_at,
            sender: {
              id: newMessage.Sender_id,
              first_name: newMessage.First_Name || '', 
              last_name: newMessage.Last_name || '',
              avatar: newMessage.profile_picture_url
            }
          };

          // If it's my message, try to find a matching temp message and replace it
          if (newMessage.Sender_id === currentUserId) {
              const tempMsgIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === newMessage.Content);
              if (tempMsgIndex !== -1) {
                  const newMsgs = [...prev];
                  newMsgs[tempMsgIndex] = formattedMessage;
                  return newMsgs;
              }
          }

          return [...prev, formattedMessage];
        });
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      // Listen for typing events
      socketService.onUserTyping((data: any) => {
        if (data.userId !== currentUserId) {
          setOtherUserTyping(true);
        }
      });

      socketService.onUserStoppedTyping((data: any) => {
        if (data.userId !== currentUserId) {
          setOtherUserTyping(false);
        }
      });
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    return () => {
      socketService.off('receive_message');
      socketService.off('user_typing');
      socketService.off('user_stopped_typing');
      // Don't disconnect socket here as it might be used by other screens, 
      // but for now we can leave it connected.
    };
  }, [conversationId, currentUserId]); // Add currentUserId to dependency to ensure we can check isMyMsg correctly

  const handleInputChange = (text: string) => {
    setInputText(text);
    
    if (!conversationId || !currentUserId) return;

    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTyping({
        conversationId,
        userId: currentUserId,
        userName: 'User' // You can pass real name if available
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendStopTyping({
        conversationId,
        userId: currentUserId
      });
    }, 2000);
  };

  const loadCurrentUser = async () => {
    try {
      const userData = await authService.getUserData();
      if (userData?.id) {
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const result = await apiService.getConversationMessages(conversationId);
      if (result.success) {
        const messagesData = (result.data || []).map((item: any) => ({
          id: item.Message_id.toString(),
          content: item.Content,
          sender_id: item.Sender_id,
          created_at: item.Sent_at,
          sender: {
            id: item.Sender_id,
            first_name: item.First_Name || '',
            last_name: item.Last_name || '',
            avatar: item.profile_picture_url
          }
        }));
        setMessages(messagesData);
        
        // Get participant name from first message
        if (messagesData.length > 0) {
          // Find a message that is NOT from current user to get participant name
          // But we might not have currentUserId set yet or it might be async.
          // Alternatively, we can use the first message that is not me, or just use the first message sender if it's not me.
          // However, we don't have easy access to "who is the other person" from just messages if all messages are from me.
          // But usually there are messages from both.
          // Let's try to find a message from the other person.
          const otherMessage = messagesData.find((m: Message) => m.sender_id !== currentUserId);
          if (otherMessage && otherMessage.sender) {
             setParticipantName(
              `${otherMessage.sender.first_name} ${otherMessage.sender.last_name}`
            );
          }
        }
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      } else {
        Alert.alert("Lỗi", result.message || "Không thể tải tin nhắn");
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải tin nhắn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversationId || isSending) return;
    if (!currentUserId) return;

    const content = inputText.trim();
    setInputText("");
    
    // Stop typing immediately when sending
    if (isTyping) {
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.sendStopTyping({
        conversationId,
        userId: currentUserId
      });
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Send via Socket
    socketService.sendMessage({
        conversationId,
        senderId: currentUserId,
        content
    });
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMyMessage = (message: Message) => {
    return message.sender_id === currentUserId;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMine = isMyMessage(item);
    const showAvatar = !isMine;
    const avatarUrl = item.sender
      ? getAvatarUrl(item.sender.avatar)
      : getAvatarUrl(undefined);

    return (
      <View
        style={[
          styles.messageContainer,
          isMine ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {showAvatar && (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.messageAvatar}
            defaultSource={require("../assets/logo.png")}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isMine
              ? {
                  backgroundColor: colorScheme === "dark" ? "#5A7DFE" : "#6C63FF",
                  alignSelf: "flex-end",
                }
              : {
                  backgroundColor: theme.card_background,
                  alignSelf: "flex-start",
                },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isMine ? "#FFFFFF" : theme.Text_color,
              },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isMine ? "#FFFFFFCC" : theme.Text_color + "80",
              },
            ]}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background_color }]}
          edges={["top"]}
        >
          <ThemeBar />
          <AppLoader message="Đang tải tin nhắn..." />
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
        <Animated.View
          style={[
            styles.header,
            {
              backgroundColor: theme.card_background,
              borderBottomColor: theme.border_color + "30",
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.Text_color}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.Text_color }]}>
            {participantName}
          </Text>
          <View style={styles.headerRight} />
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            ListFooterComponent={
              otherUserTyping ? (
                <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                  <Text style={{ color: theme.Text_color + '80', fontStyle: 'italic', fontSize: 12 }}>
                    Đang nhập...
                  </Text>
                </View>
              ) : null
            }
          />

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.card_background,
                borderTopColor: theme.border_color + "30",
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background_color,
                  color: theme.Text_color,
                  borderColor: theme.border_color + "30",
                },
              ]}
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={theme.Text_color + "60"}
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    inputText.trim() && !isSending
                      ? colorScheme === "dark"
                        ? "#5A7DFE"
                        : "#6C63FF"
                      : theme.border_color + "40",
                },
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.7}
            >
              {isSending ? (
                <MaterialIcons name="hourglass-empty" size={24} color="#FFFFFF" />
              ) : (
                <MaterialIcons name="send" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

