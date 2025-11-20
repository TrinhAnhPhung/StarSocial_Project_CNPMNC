import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import authService from "../services/authService";
import apiService from "../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { showSuccess, showError, showWarning } from "../utils/notification";

export default function CreatePost() {
  const [userData, setUserData] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? "dark"] ?? COLORS.dark;
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showWarning("Cần quyền truy cập thư viện ảnh để tạo bài viết");
    }
  };

  const loadUserData = async () => {
    const data = await authService.getUserData();
    setUserData(data);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
          showError('Cần quyền truy cập thư viện ảnh để chọn ảnh');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showError("Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const handleCreatePost = async () => {
    if (!image) {
      showWarning("Vui lòng chọn ảnh");
      return;
    }

    if (!caption.trim()) {
      showWarning("Vui lòng nhập mô tả cho bài viết");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // Xử lý ảnh cho React Native mobile
      const filename = image.split("/").pop() || `photo_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      let type = "image/jpeg";
      
      if (match) {
        const ext = match[1].toLowerCase();
        if (ext === "png") type = "image/png";
        else if (ext === "jpg" || ext === "jpeg") type = "image/jpeg";
        else if (ext === "gif") type = "image/gif";
        else if (ext === "webp") type = "image/webp";
        else type = "image/jpeg";
      }

      // Format cho React Native FormData
      formData.append("image", {
        uri: image,
        name: filename,
        type: type,
      } as any);

      // Thêm các trường text
      formData.append("caption", caption.trim());
      
      if (location && location.trim()) {
        formData.append("location", location.trim());
      }
      
      if (hashtags && hashtags.trim()) {
        formData.append("hashtags", hashtags.trim());
      }

      console.log("Creating post with:", {
        imageUri: image,
        filename,
        type,
        caption: caption.trim(),
        location: location?.trim(),
        hashtags: hashtags?.trim(),
      });

      const response = await apiService.createPost(formData);

      if (response.success) {
        showSuccess("Bài viết đã được tạo thành công!", () => {
          setImage(null);
          setCaption("");
          setLocation("");
          setHashtags("");
          router.push("/Home");
        });
      } else {
        showError(response.message || "Không thể tạo bài viết");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      showError("Không thể tạo bài viết. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={[styles.container, { backgroundColor: theme.background_color }]}>
        <ThemeBar />
        <Header />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text_primary }]}>Tạo bài đăng mới</Text>

            {/* Image Preview */}
            <TouchableOpacity
              style={[styles.imageContainer, { 
                backgroundColor: theme.background_color,
                borderColor: theme.border_color,
                borderWidth: 2,
                borderStyle: 'dashed'
              }]}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              {image ? (
                <View style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={pickImage}
                  >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <MaterialIcons name="add-photo-alternate" size={64} color={COLORS.primary} />
                  <Text style={[styles.placeholderText, { color: theme.text_primary }]}>
                    Chọn ảnh từ thư viện
                  </Text>
                  <Text style={[styles.placeholderSubtext, { color: theme.text_secondary }]}>
                    Chạm để chọn ảnh
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Caption */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text_primary }]}>Mô tả</Text>
              <TextInput
                style={[styles.textInput, { 
                  color: theme.text_primary, 
                  backgroundColor: theme.input_background,
                  borderColor: theme.border_color 
                }]}
                placeholder="Viết mô tả cho bài đăng..."
                placeholderTextColor={theme.text_secondary}
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text_primary }]}>Địa điểm</Text>
              <View style={[styles.inputWithIcon, { 
                backgroundColor: theme.input_background,
                borderColor: theme.border_color 
              }]}>
                <MaterialIcons name="location-on" size={20} color={theme.text_secondary} />
                <TextInput
                  style={[styles.textInputWithIcon, { color: theme.text_primary }]}
                  placeholder="Thêm địa điểm..."
                  placeholderTextColor={theme.text_secondary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            {/* Hashtags */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text_primary }]}>Hashtags</Text>
              <View style={[styles.inputWithIcon, { 
                backgroundColor: theme.input_background,
                borderColor: theme.border_color 
              }]}>
                <MaterialIcons name="tag" size={20} color={theme.text_secondary} />
                <TextInput
                  style={[styles.textInputWithIcon, { color: theme.text_primary }]}
                  placeholder="Ví dụ: #travel #photography"
                  placeholderTextColor={theme.text_secondary}
                  value={hashtags}
                  onChangeText={setHashtags}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: COLORS.primary,
                  opacity: (isUploading || !image) ? 0.5 : 1,
                },
              ]}
              onPress={handleCreatePost}
              disabled={isUploading || !image}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator color="#ffffff" />
                  <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>Đang đăng...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="cloud-upload" size={24} color="#fff" />
                  <Text style={styles.submitButtonText}>Đăng bài</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View>
          <BottomNavigation userAvatar={userData?.avatar || userData?.profile_picture} />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: FONTS.h1.fontWeight as any,
    marginBottom: SIZES.padding,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 12,
    fontSize: SIZES.font,
    fontWeight: "600",
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: SIZES.small,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONTS.body1.fontSize,
    fontWeight: FONTS.body1.fontWeight as any,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 2,
    fontSize: FONTS.body2.fontSize,
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 10,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: FONTS.body2.fontSize,
    marginLeft: 8,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...SHADOWS.medium,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: FONTS.h3.fontSize,
    fontWeight: FONTS.h3.fontWeight as any,
  },
});
