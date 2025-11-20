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
  ActivityIndicator,
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
import { showSuccess, showError, showWarning } from "../utils/notification";

export default function EditProfile() {
  const [userData, setUserData] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
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
        setUsername(data.username || data.user_name || "");
        setBio(data.bio || data.description || "");
        setPhone(data.phone || data.phone_number || "");
        setDateOfBirth(data.date_of_birth || data.birthday || "");
        setGender(data.gender || "");
        setLocation(data.location || data.address || "");
        setAvatar(data.avatar || data.profile_picture || null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showError("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showWarning("Cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện");
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
        setIsAvatarChanged(true);
        
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
      showError("Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatar || !isAvatarChanged) {
      showWarning("Vui lòng chọn ảnh mới trước khi lưu.");
      return;
    }

    // If it's already a URL from server, skip upload
    if (avatar.startsWith("http") && !avatar.includes("file://") && !avatar.includes("content://")) {
      showSuccess("Ảnh đã được lưu.");
      setIsAvatarChanged(false);
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Create FormData
      const formData = new FormData();
      
      // For React Native: use URI object
      const filename = avatar.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      
      formData.append("avatar", {
        uri: avatar,
        name: filename,
        type: type,
      } as any);

      const result = await apiService.updateProfilePicture(formData);
      if (result.success) {
        // Update avatar URL
        const newAvatar = result.data?.avatar || result.data?.profile_picture || avatar;
        setAvatar(newAvatar);
        setIsAvatarChanged(false);
        
        // Update local storage
        const storedUser = await authService.getUserData();
        if (storedUser) {
          storedUser.avatar = newAvatar;
          storedUser.profile_picture = newAvatar;
          await authService.setUserData(storedUser);
        }
        
        showSuccess("Ảnh đại diện đã được cập nhật thành công!");
      } else {
        throw new Error(result.message || "Không thể cập nhật ảnh đại diện");
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      showError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      showWarning("Vui lòng điền đầy đủ họ và tên");
      return;
    }

    if (!email.trim()) {
      showWarning("Vui lòng điền email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showWarning("Email không hợp lệ");
      return;
    }

    // Phone validation (if provided)
    if (phone.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone.trim().replace(/[^0-9]/g, ''))) {
        showWarning("Số điện thoại không hợp lệ (10-11 chữ số)");
        return;
      }
    }

    // Date of birth validation (if provided)
    if (dateOfBirth.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirth.trim())) {
        showWarning("Ngày sinh không hợp lệ. Định dạng: YYYY-MM-DD");
        return;
      }
    }

    // Username validation (if provided)
    if (username.trim()) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username.trim())) {
        showWarning("Tên người dùng không hợp lệ (3-20 ký tự, chỉ chữ, số và _)");
        return;
      }
    }

    try {
      setIsSaving(true);
      await continueProfileUpdate();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showError(error.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      setIsSaving(false);
    }
  };

    const continueProfileUpdate = async () => {
    try {
      // Update profile information
      const result = await apiService.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirth.trim(),
        gender: gender,
        location: location.trim(),
      });

      if (result.success) {
        // Update local storage with latest data
        const updatedUserData = {
          ...userData,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          username: username.trim(),
          user_name: username.trim(),
          bio: bio.trim(),
          description: bio.trim(),
          phone: phone.trim(),
          phone_number: phone.trim(),
          date_of_birth: dateOfBirth.trim(),
          birthday: dateOfBirth.trim(),
          gender: gender,
          location: location.trim(),
          address: location.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          avatar: result.data?.avatar || result.data?.profile_picture || avatar || userData?.avatar,
          profile_picture: result.data?.avatar || result.data?.profile_picture || avatar || userData?.profile_picture,
        };
        
        await authService.setUserData(updatedUserData);
        
        showSuccess("Đã cập nhật hồ sơ thành công!", () => {
          router.back();
        });
      } else {
        showError(result.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Error in continueProfileUpdate:", error);
      showError(error.message || "Không thể cập nhật hồ sơ. Vui lòng kiểm tra kết nối mạng.");
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

  // Handle avatar URL - if it's a local file URI, use it directly; otherwise use getAvatarUrl
  const avatarUrl = avatar 
    ? (avatar.startsWith("http") || avatar.startsWith("file://") || avatar.startsWith("content://") 
        ? avatar 
        : getAvatarUrl(avatar))
    : null;

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
          {isAvatarChanged && (
            <TouchableOpacity
              onPress={handleSaveAvatar}
              style={styles.saveButton}
              disabled={isUploadingAvatar}
              activeOpacity={0.7}
            >
              {isUploadingAvatar ? (
                <MaterialIcons name="hourglass-empty" size={24} color={theme.Text_color} />
              ) : (
                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      color:
                        isUploadingAvatar
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
          )}
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

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Tên người dùng
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
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Nhập tên người dùng"
                  placeholderTextColor={theme.Text_color + "60"}
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: theme.Text_color }]}>
                    Tiểu sử
                  </Text>
                  <Text style={[styles.charCount, { color: theme.Text_color + "60" }]}>
                    {bio.length}/200
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.card_background,
                      color: theme.Text_color,
                      borderColor: theme.border_color + "30",
                    },
                  ]}
                  value={bio}
                  onChangeText={(text) => text.length <= 200 && setBio(text)}
                  placeholder="Giới thiệu về bạn"
                  placeholderTextColor={theme.Text_color + "60"}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isSaving}
                  maxLength={200}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Số điện thoại
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
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={theme.Text_color + "60"}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Ngày sinh (YYYY-MM-DD)
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
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="VD: 2000-01-15"
                  placeholderTextColor={theme.Text_color + "60"}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Giới tính
                </Text>
                <View style={styles.genderContainer}>
                  {['Nam', 'Nữ', 'Khác'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setGender(item)}
                      style={[
                        styles.genderButton,
                        {
                          backgroundColor: gender === item 
                            ? (colorScheme === 'dark' ? '#5A7DFE' : '#6C63FF')
                            : theme.card_background,
                          borderColor: theme.border_color + "30",
                        },
                      ]}
                      disabled={isSaving}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          {
                            color: gender === item ? '#FFFFFF' : theme.Text_color,
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Vị trí
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
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Nhập vị trí"
                  placeholderTextColor={theme.Text_color + "60"}
                  editable={!isSaving}
                />
              </View>

              {/* Nút Cập nhật hồ sơ */}
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  {
                    backgroundColor: colorScheme === "dark" ? "#5A7DFE" : "#6C63FF",
                  },
                ]}
                onPress={handleUpdateProfile}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.updateButtonText}>
                    Cập nhật hồ sơ
                  </Text>
                )}
              </TouchableOpacity>
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
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  updateButton: {
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

