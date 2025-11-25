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
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('vi');
  
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
    setError('');
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
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
        setError(result.message || 'Incorrect password. Please check your password.');
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text_secondary }]}>
                  {language === 'vi' ? 'Đăng nhập' : 'Login'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                  style={styles.langButton}
                >
                  <Text style={[styles.langText, { color: COLORS.primary }]}>
                    {language === 'vi' ? 'EN' : 'VN'}
                  </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.logoContainer}>
              <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              <Text style={[styles.appName, { color: theme.text_primary }]}>StarSocial</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text_primary }]}>
                  {language === 'vi' ? 'Email' : 'Email'}
                </Text>
                <TextInput
                    placeholder={language === 'vi' ? "Nhập email" : "Enter email"}
                    placeholderTextColor={theme.text_secondary}
                    value={email}
                    style={[styles.input, { backgroundColor: theme.background_color, borderColor: theme.border_color, color: theme.text_primary }]}
                    onChangeText={(text) => { setEmail(text); setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text_primary }]}>
                  {language === 'vi' ? 'Mật khẩu' : 'Password'}
                </Text>
                <View style={[styles.passwordContainer, { backgroundColor: theme.background_color, borderColor: error ? COLORS.danger : theme.border_color }]}>
                  <TextInput
                    placeholder={language === 'vi' ? "Nhập mật khẩu" : "Enter password"}
                    placeholderTextColor={theme.text_secondary}
                    value={password}
                    secureTextEntry={!showPassword}
                    style={[styles.passwordInput, { color: theme.text_primary }]}
                    onChangeText={(text) => { setPassword(text); setError(''); }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.text_secondary} />
                  </TouchableOpacity>
                </View>
                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}
              </View>

              <TouchableOpacity 
                style={styles.forgotPassword} 
                onPress={() => router.push('/ForgotPassword')}
              >
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
                  {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot Password?'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {language === 'vi' ? 'Đăng nhập' : 'Login'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.text_secondary }]}>
                  {language === 'vi' ? 'Chưa có tài khoản? ' : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => router.push('/Register')}>
                  <Text style={[styles.footerLink, { color: COLORS.primary }]}>
                    {language === 'vi' ? 'Đăng ký' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerLinks}>
                    <Text style={styles.footerLinkText}>{language === 'vi' ? 'Giới thiệu' : 'About'}</Text>
                    <Text style={styles.footerLinkText}>{language === 'vi' ? 'Việc làm' : 'Jobs'}</Text>
                    <Text style={styles.footerLinkText}>{language === 'vi' ? 'Trợ giúp' : 'Help'}</Text>
                    <Text style={styles.footerLinkText}>{language === 'vi' ? 'Quyền riêng tư' : 'Privacy'}</Text>
                </View>
                <View style={styles.footerLinks}>
                    <Text style={styles.footerLinkText}>{language === 'vi' ? 'Điều khoản' : 'Terms'}</Text>
                    <Text style={styles.footerLinkText}>{language === 'vi' ? 'Vị trí' : 'Locations'}</Text>
                    <Text style={styles.footerLinkText}>API</Text>
                </View>
                
                <View style={styles.copyrightContainer}>
                    
                    <Text style={styles.copyrightText}>©2025 Starsocial from StarTeam</Text>
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
    padding: 20,
  },
  header: {
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  headerTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: '#757575',
  },
  langButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  langText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    tintColor: COLORS.primary,
  },
  appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
      padding: 5,
  },
  inputError: {
      borderColor: COLORS.danger,
  },
  errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
  },
  errorText: {
      color: COLORS.danger,
      fontSize: 12,
      marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
      marginTop: 'auto',
      alignItems: 'center',
      paddingVertical: 20,
  },
  footerLinks: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 15,
      marginBottom: 10,
  },
  footerLinkText: {
      fontSize: 12,
      color: '#757575',
  },
  copyrightContainer: {
      alignItems: 'center',
      marginTop: 10,
  },
  languageText: {
      fontSize: 12,
      color: '#757575',
      marginBottom: 5,
  },
  copyrightText: {
      fontSize: 12,
      color: '#757575',
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
