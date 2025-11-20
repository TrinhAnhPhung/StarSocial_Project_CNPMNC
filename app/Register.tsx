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
            <View style={styles.headerContainer}>
              <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              <Text style={[styles.title, { color: theme.text_primary }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: theme.text_secondary }]}>Join our community today</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text_primary }]}>Full Name</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.input_background, borderColor: theme.border_color }]}>
                  <Ionicons name="person-outline" size={20} color={theme.text_secondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.text_secondary}
                    value={fullName}
                    style={[styles.input, { color: theme.text_primary }]}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text_primary }]}>Email</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.input_background, borderColor: theme.border_color }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.text_secondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor={theme.text_secondary}
                    value={email}
                    style={[styles.input, { color: theme.text_primary }]}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text_primary }]}>Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.input_background, borderColor: theme.border_color }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.text_secondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Create a password"
                    placeholderTextColor={theme.text_secondary}
                    value={password}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: theme.text_primary }]}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.text_secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text_primary }]}>Confirm Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.input_background, borderColor: theme.border_color }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.text_secondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor={theme.text_secondary}
                    value={confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={[styles.input, { color: theme.text_primary }]}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.text_secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.registerButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.text_secondary }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={[styles.footerLink, { color: COLORS.primary }]}>Login</Text>
                </TouchableOpacity>
              </View>
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
    padding: SIZES.padding,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    ...FONTS.h1,
    marginBottom: 5,
  },
  subtitle: {
    ...FONTS.body3,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.h4,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    ...FONTS.body3,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.medium,
  },
  registerButtonText: {
    color: COLORS.white,
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    ...FONTS.body3,
  },
  footerLink: {
    ...FONTS.h3,
    fontWeight: 'bold',
  },
});
