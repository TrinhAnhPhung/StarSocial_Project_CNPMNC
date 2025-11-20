import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/color";
import { useRouter } from "expo-router";
import { ThemeBar } from "../component/themeBar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import authService from "../services/authService";
import { showSuccess, showError, showWarning } from "../utils/notification";
import { Ionicons } from "@expo/vector-icons";

const slides = [
  {
    id: '1',
    image: require('../assets/intro1.png'),
    title: 'Connect with friends',
    subtitle: 'Share your moments, thoughts, and experiences with a vibrant community.'
  },
  {
    id: '2',
    image: require('../assets/intro2.png'),
    title: 'Discover new interests',
    subtitle: 'Explore a wide range of topics, join groups, and find like-minded individuals.'
  },
  {
    id: '3',
    image: require('../assets/intro3.png'),
    title: 'Stay updated',
    subtitle: 'Get real-time updates on current events, trending topics, and breaking news.'
  }
]

export default function Page() {
  const [showHomePage, setShowHomePage] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('hasSeenIntro').then((value: string | null) => {
      if (value === null) {
        setShowIntro(true);
      } else {
        setShowIntro(false);
        setShowHomePage(true);
      }
    });
  }, []);

  const handleDone = () => {
    AsyncStorage.setItem('hasSeenIntro', 'true');
    setShowHomePage(true);
  }

  const handleLogin = async () => {
    if (!email.trim()) {
      showWarning('Vui lòng nhập email');
      return;
    }

    if (!password.trim()) {
      showWarning('Vui lòng nhập mật khẩu');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showWarning('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      
      if (result.success) {
        showSuccess('Đăng nhập thành công!', () => {
          router.replace('/Home');
        });
      } else {
        showError(result.message || 'Email hoặc mật khẩu không chính xác');
      }
    } catch (error) {
      showError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (showIntro === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background_color }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (showIntro && !showHomePage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background_color }}>
        <AppIntroSlider
          data={slides}
          renderItem={({ item }) => (
            <View style={[styles.slide, { backgroundColor: theme.background_color }]}>
              <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
              <Text style={[styles.slideTitle, { color: theme.text_primary }]}>{item.title}</Text>
              <Text style={[styles.slideSubtitle, { color: theme.text_secondary }]}>{item.subtitle}</Text>
            </View>
          )}
          activeDotStyle={{ backgroundColor: COLORS.primary, width: 30 }}
          dotStyle={{ backgroundColor: theme.tab_inactive }}
          showSkipButton
          renderNextButton={() => <Text style={[styles.buttonText, { color: COLORS.primary }]}>Next</Text>}
          renderSkipButton={() => <Text style={[styles.buttonText, { color: theme.text_secondary }]}>Skip</Text>}
          renderDoneButton={() => <Text style={[styles.buttonText, { color: COLORS.primary, fontWeight: 'bold' }]}>Done</Text>}
          onDone={() => {
            setShowHomePage(true);
            handleDone();
          }}
        />
      </SafeAreaView>
    )
  }

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
              <Text style={[styles.welcomeText, { color: theme.text_primary }]}>Welcome Back!</Text>
              <Text style={[styles.subText, { color: theme.text_secondary }]}>Sign in to continue</Text>
            </View>

            <View style={styles.formContainer}>
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
                    placeholder="Enter your password"
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

              <TouchableOpacity 
                style={styles.forgotPassword} 
                onPress={() => router.push('/ForgotPassword')}
              >
                <Text style={{ color: COLORS.primary, ...FONTS.body4 }}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.text_secondary }]}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/Register')}>
                  <Text style={[styles.footerLink, { color: COLORS.primary }]}>Sign Up</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    ...FONTS.h1,
    marginBottom: 10,
  },
  subText: {
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  loginButtonText: {
    color: COLORS.white,
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    ...FONTS.body3,
  },
  footerLink: {
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  slideImage: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },
  slideTitle: {
    ...FONTS.h1,
    textAlign: 'center',
    marginBottom: 20,
  },
  slideSubtitle: {
    ...FONTS.body3,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    padding: 10,
  }
});
