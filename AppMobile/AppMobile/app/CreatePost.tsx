import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { COLORS } from "../constants/color";
import Header from "../component/Header";
import BottomNavigation from "../component/BottomNavigation";
import authService from "../services/authService";
import apiService from "../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";

const PRIMARY_COLOR_DARK = '#5A7DFE';
const PRIMARY_COLOR_LIGHT = '#6C63FF';

export default function CreatePost() {
  const [userData, setUserData] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = useMemo(() => COLORS[colorScheme ?? "dark"] ?? COLORS.dark, [colorScheme]);
  const primaryColor = useMemo(() => colorScheme === 'dark' ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT, [colorScheme]);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadUserData();
    requestPermissions();
    
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
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Cần quyền truy cập thư viện ảnh để tạo bài viết");
    }
  };

  const loadUserData = useCallback(async () => {
    const data = await authService.getUserData();
    setUserData(data);
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaTypeOptions.Images, ImagePicker.MediaTypeOptions.Videos],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  }, []);

  const handleCreatePost = async () => {
    if (!image) {
      Alert.alert("Thông báo", "Vui lòng chọn ảnh hoặc video");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // Kiểm tra nếu đang chạy trên web
      const isWeb = typeof window !== 'undefined';
      
      if (isWeb) {
        // Trên web, cần fetch image và convert thành File/Blob
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          const filename = image.split("/").pop() || "photo.jpg";
          
          // Xác định MIME type từ blob hoặc extension
          let type = blob.type || "image/jpeg";
          if (!type || type === "application/octet-stream") {
            const match = /\.(\w+)$/.exec(filename);
            if (match) {
              const ext = match[1].toLowerCase();
              if (ext === "png") type = "image/png";
              else if (ext === "gif") type = "image/gif";
              else if (ext === "mp4") type = "video/mp4";
              else if (ext === "mov") type = "video/quicktime";
              else type = "image/jpeg";
            }
          }
          
          const file = new File([blob], filename, { type });
          formData.append("image", file);
        } catch (fetchError) {
          console.error("Error fetching image for web:", fetchError);
          Alert.alert("Lỗi", "Không thể xử lý ảnh. Vui lòng thử lại.");
          setIsUploading(false);
          return;
        }
      } else {
        // Trên React Native mobile
        const filename = image.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        let type = "image/jpeg";
        
        if (match) {
          const ext = match[1].toLowerCase();
          if (ext === "png") type = "image/png";
          else if (ext === "gif") type = "image/gif";
          else if (ext === "mp4") type = "video/mp4";
          else if (ext === "mov") type = "video/quicktime";
          else type = "image/jpeg";
        }

        // Format đúng cho React Native FormData
        formData.append("image", {
          uri: image,
          name: filename,
          type: type,
        } as any);
      }

      // Append text fields
      if (caption && caption.trim()) {
        formData.append("caption", caption.trim());
      }
      if (location && location.trim()) {
        formData.append("location", location.trim());
      }
      if (hashtags && hashtags.trim()) {
        formData.append("hashtags", hashtags.trim());
      }

      console.log("FormData created:", {
        hasImage: !!image,
        isWeb: isWeb,
        caption: caption?.trim(),
        location: location?.trim(),
        hashtags: hashtags?.trim(),
      });

      const response = await apiService.createPost(formData);

      if (response.success) {
        Alert.alert("Thành công", "Bài viết đã được tạo thành công", [
          {
            text: "OK",
            onPress: () => {
              router.push("/Home");
            },
          },
        ]);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể tạo bài viết");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      Alert.alert("Lỗi", error.message || "Không thể tạo bài viết");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]} edges={["top"]}>
        <ThemeBar />
        <Header />
        <Animated.View style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.Text_color }]}>Tạo bài đăng mới</Text>

            {/* Image Preview */}
            <TouchableOpacity
              style={[styles.imageContainer, { backgroundColor: theme.Text_color + "10" }]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <MaterialIcons name="add-photo-alternate" size={64} color={theme.Text_color + "60"} />
                  <Text style={[styles.placeholderText, { color: theme.Text_color + "80" }]}>
                    Chạm để chọn ảnh/video
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Caption */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.Text_color }]}>Mô tả</Text>
              <TextInput
                style={[styles.textInput, { color: theme.Text_color, borderColor: theme.Text_color + "20" }]}
                placeholder="Viết mô tả cho bài đăng..."
                placeholderTextColor={theme.Text_color + "60"}
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.Text_color }]}>Địa điểm</Text>
              <TextInput
                style={[styles.textInput, { color: theme.Text_color, borderColor: theme.Text_color + "20" }]}
                placeholder="Thêm địa điểm..."
                placeholderTextColor={theme.Text_color + "60"}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Hashtags */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.Text_color }]}>Hashtags</Text>
              <TextInput
                style={[styles.textInput, { color: theme.Text_color, borderColor: theme.Text_color + "20" }]}
                placeholder="Ví dụ: #travel #photography"
                placeholderTextColor={theme.Text_color + "60"}
                value={hashtags}
                onChangeText={setHashtags}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  opacity: isUploading ? 0.6 : 1,
                },
              ]}
              onPress={handleCreatePost}
              disabled={isUploading || !image}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colorScheme === "dark" 
                  ? [PRIMARY_COLOR_DARK, '#4A6DFE'] 
                  : [PRIMARY_COLOR_LIGHT, '#5B52FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                {isUploading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Đăng bài</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </Animated.View>
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
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: "bold",
    marginBottom: 20,
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
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 12,
    fontSize: COLORS.medium_font_size,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: COLORS.medium_font_size,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: COLORS.medium_font_size,
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 10,
    shadowColor: PRIMARY_COLOR_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: COLORS.large_font_size,
    fontWeight: "bold",
  },
});
