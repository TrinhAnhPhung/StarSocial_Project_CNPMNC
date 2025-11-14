import { Image, Animated, StyleSheet, useColorScheme } from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { COLORS } from "../constants/color";
import { ThemeBar } from "../component/themeBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter, useFocusEffect } from "expo-router";
import authService from "../services/authService";
import React from "react";
import AppLoader from "../component/AppLoader";

export default function App() {
    const [showFlashScreen, setShowFlashScreen] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const router = useRouter();

    const colorScheme = useColorScheme();
    const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;

    const checkAuth = async () => {
        console.log('🔍 index.tsx: Đang kiểm tra authentication...');
        try {
            const authenticated = await authService.isAuthenticated();
            console.log('🔍 index.tsx: Kết quả authentication:', authenticated);
            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('❌ index.tsx: Lỗi khi kiểm tra authentication:', error);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        // Kiểm tra authentication ngay lập tức
        checkAuth().then(() => {
            // Sau khi kiểm tra auth xong, hiển thị flash screen nếu cần (chỉ lần đầu)
            timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: false,
                }).start(() => setShowFlashScreen(false));
            }, 1000);
        });
        
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, []);

    // Re-check authentication khi focus vào screen này (khi navigate về /)
    useFocusEffect(
        useCallback(() => {
            console.log('🔄 index.tsx: Screen focused, re-checking auth...');
            // Đảm bảo flash screen không chặn việc kiểm tra auth
            setShowFlashScreen(false);
            // Reset authentication state để bắt đầu lại quá trình kiểm tra
            setIsAuthenticated(null);
            // Delay một chút để đảm bảo AsyncStorage đã được cập nhật (đặc biệt quan trọng sau logout)
            const timer = setTimeout(() => {
                checkAuth();
            }, 300);
            
            return () => clearTimeout(timer);
        }, [])
    );

    if (showFlashScreen) {
        return (
            <><SafeAreaView style={{ flex: 1, backgroundColor: theme.background_color }}>
                <ThemeBar />
                <Animated.View style={[styles.container, { opacity: fadeAnim }, { backgroundColor: theme.background_color }]}>
                    <Image source={require('../assets/logo.png')} style={{ width: 200, height: 200 }} />
                </Animated.View>
            </SafeAreaView>
            </>
        );
    }

    // Redirect based on authentication status
    if (isAuthenticated === null) {
        // Hiển thị loading indicator khi đang kiểm tra authentication
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.background_color }}>
                <ThemeBar />
                <AppLoader message="Đang kiểm tra..." />
            </SafeAreaView>
        );
    }

    if (isAuthenticated) {
        // Luôn chuyển đến trang Home cho tất cả người dùng
        return <Redirect href="/Home" />;
    }

    // Redirect to Login screen if not authenticated
    return <Redirect href="/Login" />;
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});