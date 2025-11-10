import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert, useColorScheme, StatusBar, ActivityIndicator } from "react-native";
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "../constants/color";
import { Link, useRouter } from "expo-router";
import { ThemeBar } from "../component/themeBar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import authService from "../services/authService";

const slides = [
  {
    id: '1',
    image: require('../assets/intro1.png'),
    title: 'Connect with friends and the world around you.',
    subtitle: 'Share your moments, thoughts, and experiences with a vibrant community.'
  },
  {
    id: '2',
    image: require('../assets/intro2.png'),
    title: 'Discover new interests and communities.',
    subtitle: 'Explore a wide range of topics, join groups, and find like-minded individuals.'
  },
  {
    id: '3',
    image: require('../assets/intro3.png'),
    title: 'Stay updated with the latest news and trends.',
    subtitle: 'Get real-time updates on current events, trending topics, and breaking news.'
  }
]
export default function Page() {
  const [showHomePage, setShowHomePage] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    // Validation
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      
      if (result.success) {
        // Luôn chuyển đến trang Home cho tất cả người dùng
        router.replace('/Home');
      } else {
        Alert.alert('Lỗi đăng nhập', result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }
  if (showIntro === null) {
    return null; // or a loading spinner
  }
  if (showIntro && !showHomePage) {
    return (
      // <StatusBar />
      // <AppIntroSlider
      //   data={slides}

      //   renderItem={({ item }) => (
      //     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: theme.background_color }}>
      //       <Image source={item.image} style={{ width: 300, height: 300, marginBottom: 20 }} />
      //       <Text style={{ fontSize: COLORS.large_font_size, fontWeight: 'bold', color: theme.Text_color, textAlign: 'center', marginBottom: 10 }}>{item.title}</Text>
      //       <Text style={{ fontSize: COLORS.medium_font_size, color: theme.Text_color, textAlign: 'center' }}>{item.subtitle}</Text>
      //     </View>
      //   )}
      //   activeDotStyle={{ backgroundColor: 'blue', width: 30 }}
      //   showSkipButton
      //   renderNextButton={() => <Text style={{ fontSize: COLORS.medium_font_size, color: 'blue', marginRight: 10 }}>Next</Text>}
      //   renderSkipButton={() => <Text style={{ fontSize: COLORS.medium_font_size, color: 'blue', marginRight: 10 }}>Skip</Text>}
      //   renderDoneButton={() => <Text style={{ fontSize: COLORS.medium_font_size, color: 'blue', marginRight: 10 }}>Done</Text>}
      //   onDone={() => {
      //     setShowHomePage(true);
      //     handleDone();
      //   }}
      // />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background_color }}>


        <AppIntroSlider
          data={slides}

          renderItem={({ item }) => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: theme.background_color }}>
              <Image source={item.image} style={{ width: 300, height: 300, marginBottom: 20 }} />
              <Text style={{ fontSize: COLORS.large_font_size, fontWeight: 'bold', color: theme.Text_color, textAlign: 'center', marginBottom: 10 }}>{item.title}</Text>
              <Text style={{ fontSize: COLORS.medium_font_size, color: theme.Text_color, textAlign: 'center' }}>{item.subtitle}</Text>
            </View>
          )}
          activeDotStyle={{ backgroundColor: 'blue', width: 30 }}
          showSkipButton
          renderNextButton={() => <Text style={{ fontSize: COLORS.medium_font_size, color: 'blue', marginRight: 10 }}>Next</Text>}
          renderSkipButton={() => <Text style={{ fontSize: COLORS.medium_font_size, color: 'blue', marginRight: 10 }}>Skip</Text>}
          renderDoneButton={() => <Text style={{ fontSize: COLORS.medium_font_size, color: 'blue', marginRight: 10 }}>Done</Text>}
          onDone={() => {
            setShowHomePage(true);
            handleDone();
          }}
        />
      </SafeAreaView>

    )
  }
  // { flex: 1, backgroundColor: theme.background_color }
  return (<>
    <SafeAreaProvider style={styles.test}>
      <SafeAreaView style={styles.test}>
        <ThemeBar />
        <View style={[styles.container, { backgroundColor: theme.background_color }]}>

          <Image source={require('../assets/logo.png')} style={{ width: 100, height: 100, marginBottom: 20 }} />
          <Text style={{ fontSize: COLORS.extra_large_font_size, fontWeight: 'bold', marginBottom: 30, marginTop: -10, color: theme.Text_color }}>Welcome to StarSocial</Text>
          <Text style={[styles.lable, { color: theme.Text_color }]}>Gmail</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor={theme.Text_color + '80'}
            value={email}
            style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
            onChangeText={setEmail}
          />

          <Text style={[styles.lable, { color: theme.Text_color }]}>Password</Text>
          <TextInput
            placeholder="Enter your Password"
            placeholderTextColor={theme.Text_color + '80'}
            value={password}
            secureTextEntry
            style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
            onChangeText={setPassword}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity style={{ alignSelf: 'flex-start', marginBottom: 15 }} onPress={() => router.push('/ForgotPassword')}>

              <Text style={[styles.lable, { color: theme.Text_color }]}>I forgot password</Text >
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 15 }} onPress={() => router.push('/Register')}>
              <Text style={[styles.lable, { color: theme.Text_color }]}>I don't have account</Text>

            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#ccc' : '#007bff',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20,
              width: '100%',
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontSize: 18 }}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </SafeAreaProvider>
  </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    justifyContent: "center",

  },
  test: {
    flex: 1,
    backgroundColor: 'red'
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,

  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  lable: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: COLORS.medium_font_size,
  }
});
