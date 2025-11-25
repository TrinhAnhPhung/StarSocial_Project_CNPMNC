import { useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, useColorScheme } from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/color";
import { useRouter } from "expo-router";
import { ThemeBar } from "../component/themeBar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import authService from "../services/authService";
import { showSuccess, showError, showWarning } from "../utils/notification";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName.trim()) {
      showWarning('Vui lòng nhập họ và tên');
      return;
    }

    if (!email.trim()) {
      showWarning('Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showWarning('Email không hợp lệ');
      return;
    }

    if (!password.trim()) {
      showWarning('Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 3) {
      showWarning('Mật khẩu phải có ít nhất 3 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      showWarning('Mật khẩu xác nhận không khớp');
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || nameParts[0] || '';

    setLoading(true);
    try {
      const result = await authService.register(
        email.trim(), 
        password, 
        first_name, 
        last_name
      );
      
      if (result.success) {
        showSuccess('Đăng ký thành công! Vui lòng đăng nhập.', () => {
          router.back();
        });
      } else {
        showError(result.message || 'Email đã tồn tại hoặc thông tin không hợp lệ');
      }
    } catch (error) {
      showError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background_color }}>
        <ThemeBar />
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/logo.png')} 
                style={{ width: 80, height: 80, tintColor: COLORS.primary }} 
                resizeMode="contain" 
              />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.text_primary }]}>Tạo tài khoản</Text>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text_primary }]}>Họ tên đầy đủ</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text_primary, 
                  borderColor: theme.border_color,
                  backgroundColor: theme.card_background 
                }]}
                placeholder="VD: Trịnh Anh Cường"
                placeholderTextColor={theme.text_secondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text_primary }]}>Email</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text_primary, 
                  borderColor: theme.border_color,
                  backgroundColor: theme.card_background 
                }]}
                placeholder="Nhập Email"
                placeholderTextColor={theme.text_secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text_primary }]}>Mật khẩu</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text_primary, 
                  borderColor: theme.border_color,
                  backgroundColor: theme.card_background 
                }]}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={theme.text_secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text_primary }]}>Xác nhận mật khẩu</Text>
              <View style={[styles.passwordContainer, { 
                  borderColor: theme.border_color,
                  backgroundColor: theme.card_background 
                }]}>
                <TextInput
                  style={[styles.passwordInput, { color: theme.text_primary }]}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={theme.text_secondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={theme.text_secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </Text>
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.text_secondary }]}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
