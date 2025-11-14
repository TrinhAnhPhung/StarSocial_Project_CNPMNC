import { useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert, useColorScheme, ActivityIndicator, ScrollView } from "react-native";
import { COLORS } from "../constants/color";
import { useRouter } from "expo-router";
import { ThemeBar } from "../component/themeBar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import authService from "../services/authService";

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 3) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 3 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    // Tách họ và tên
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
        Alert.alert('Thành công', result.message || 'Đăng ký thành công', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to login
              router.back();
            }
          }
        ]);
      } else {
        Alert.alert('Lỗi đăng ký', result.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
        <ThemeBar />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo} 
            />
            <Text style={[styles.title, { color: theme.Text_color }]}>
              Đăng ký tài khoản
            </Text>

            <Text style={[styles.label, { color: theme.Text_color }]}>
              Họ và tên
            </Text>
            <TextInput
              placeholder="Nhập họ và tên"
              placeholderTextColor={theme.Text_color + '80'}
              value={fullName}
              style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Text style={[styles.label, { color: theme.Text_color }]}>
              Email
            </Text>
            <TextInput
              placeholder="Nhập email"
              placeholderTextColor={theme.Text_color + '80'}
              value={email}
              style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: theme.Text_color }]}>
              Mật khẩu
            </Text>
            <TextInput
              placeholder="Nhập mật khẩu (ít nhất 3 ký tự)"
              placeholderTextColor={theme.Text_color + '80'}
              value={password}
              secureTextEntry
              style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
              onChangeText={setPassword}
            />

            <Text style={[styles.label, { color: theme.Text_color }]}>
              Xác nhận mật khẩu
            </Text>
            <TextInput
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={theme.Text_color + '80'}
              value={confirmPassword}
              secureTextEntry
              style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: loading ? '#ccc' : '#007bff' }
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkContainer}
              onPress={() => router.back()}
            >
              <Text style={[styles.linkText, { color: theme.Text_color }]}>
                Đã có tài khoản? Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: COLORS.medium_font_size,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
    fontSize: COLORS.medium_font_size,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 10,
  },
  linkText: {
    fontSize: COLORS.medium_font_size,
    textDecorationLine: 'underline',
  },
});
