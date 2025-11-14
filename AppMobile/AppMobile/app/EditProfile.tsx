import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import { MaterialIcons } from "@expo/vector-icons";
import apiService from "../services/api";
import { useRouter } from "expo-router";
import { getAvatarUrl } from "../utils/imageUtils";
import AppLoader from "../component/AppLoader";
import authService from "../services/authService";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

export default function EditProfile() {
  const [userData, setUserData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? "dark"] ?? COLORS.dark;
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserData();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await authService.getUserData();
      if (data) {
        setUserData(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setAvatar(data.avatar || data.profile_picture || null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaTypeOptions.Images],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setAvatar(imageUri);
        
        // Animate avatar change
        Animated.sequence([
          Animated.timing(avatarScale, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(avatarScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatar || avatar.startsWith("http")) {
      // Avatar is already uploaded or is a URL
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Create FormData
      const formData = new FormData();
      
      // Check if running on web
      const isWeb = typeof window !== "undefined" && window.FormData;
      
      if (isWeb) {
        // For web: fetch image and convert to File
        const response = await fetch(avatar);
        const blob = await response.blob();
        const file = new File([blob], "avatar.jpg", { type: blob.type });
        formData.append("avatar", file);
      } else {
        // For React Native: use URI object
        const filename = avatar.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        
        formData.append("avatar", {
          uri: avatar,
          name: filename,
          type: type,
        } as any);
      }

      const result = await apiService.updateProfilePicture(formData);
      if (result.success) {
        // Update avatar URL
        if (result.data?.avatar || result.data?.profile_picture) {
          setAvatar(result.data.avatar || result.data.profile_picture);
        }
        Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
      } else {
        Alert.alert("Lỗi", result.message || "Không thể cập nhật ảnh đại diện");
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật ảnh đại diện");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ họ và tên");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền email");
      return;
    }

    try {
      setIsSaving(true);

      // Save avatar first if it's a new image
      if (avatar && !avatar.startsWith("http")) {
        await handleSaveAvatar();
      }

      // Update profile
      const result = await apiService.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });

      if (result.success) {
        // Update local storage
        const updatedUserData = {
          ...userData,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          avatar: result.data?.avatar || avatar,
        };
        await authService.setUserData(updatedUserData);
        
        Alert.alert("Thành công", "Đã cập nhật hồ sơ", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Lỗi", result.message || "Không thể cập nhật hồ sơ");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật hồ sơ");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.container}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background_color }]}
          edges={["top"]}
        >
          <ThemeBar />
          <AppLoader message="Đang tải thông tin..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const avatarUrl = avatar ? (avatar.startsWith("http") ? avatar : avatar) : null;

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
            <MaterialIcons name="arrow-back" size={24} color={theme.Text_color} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.Text_color }]}>
            Chỉnh sửa hồ sơ
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <MaterialIcons name="hourglass-empty" size={24} color={theme.Text_color} />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color:
                      isSaving
                        ? theme.Text_color + "60"
                        : colorScheme === "dark"
                        ? "#5A7DFE"
                        : "#6C63FF",
                  },
                ]}
              >
                Lưu
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={handlePickImage}
                activeOpacity={0.8}
                disabled={isUploadingAvatar}
              >
                <Animated.View
                  style={[
                    styles.avatarContainer,
                    {
                      transform: [{ scale: avatarScale }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      colorScheme === "dark"
                        ? ["#5A7DFE", "#4A6DFE"]
                        : ["#6C63FF", "#5B52FF"]
                    }
                    style={styles.avatarGradient}
                  >
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                        defaultSource={require("../assets/logo.png")}
                      />
                    ) : (
                      <Image
                        source={require("../assets/logo.png")}
                        style={styles.avatar}
                      />
                    )}
                  </LinearGradient>
                  {isUploadingAvatar && (
                    <View style={styles.uploadingOverlay}>
                      <MaterialIcons name="cloud-upload" size={32} color="#FFFFFF" />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.changeAvatarButton}
                activeOpacity={0.7}
                disabled={isUploadingAvatar}
              >
                <MaterialIcons
                  name="camera-alt"
                  size={20}
                  color={colorScheme === "dark" ? "#5A7DFE" : "#6C63FF"}
                />
                <Text
                  style={[
                    styles.changeAvatarText,
                    {
                      color: colorScheme === "dark" ? "#5A7DFE" : "#6C63FF",
                    },
                  ]}
                >
                  {isUploadingAvatar ? "Đang tải..." : "Đổi ảnh"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Họ
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card_background,
                      color: theme.Text_color,
                      borderColor: theme.border_color + "30",
                    },
                  ]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Nhập họ"
                  placeholderTextColor={theme.Text_color + "60"}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Tên
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card_background,
                      color: theme.Text_color,
                      borderColor: theme.border_color + "30",
                    },
                  ]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Nhập tên"
                  placeholderTextColor={theme.Text_color + "60"}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card_background,
                      color: theme.Text_color,
                      borderColor: theme.border_color + "30",
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập email"
                  placeholderTextColor={theme.Text_color + "60"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
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
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    resizeMode: "cover",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeAvatarButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(90,125,254,0.1)",
  },
  changeAvatarText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
  },
});

