import { StatusBar, useColorScheme, Platform, View } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/color";


export function ThemeBar() {
    const scheme = useColorScheme();
    const theme = COLORS[scheme ?? 'dark'] ?? COLORS.dark;
    useEffect(() => {
        if (Platform.OS === "android") {
            // Đổi màu navigation bar (phần dưới)
            NavigationBar.setBackgroundColorAsync(
                scheme === "light" ? "#ffffff" : "#262626"
            );
            NavigationBar.setButtonStyleAsync(
                scheme === "dark" ? "light" : "dark"
            );
            NavigationBar.setVisibilityAsync("visible");
        }
    }, [scheme]);

    return (
        <SafeAreaView style={{ flex: 0, justifyContent: "center", backgroundColor: theme.background_color }}>

            {/* Đổi màu status bar (phần trên) */}
            <StatusBar
                backgroundColor={theme.background_color}
                barStyle={scheme === "light" ? "dark-content" : "light-content"}

            />
        </SafeAreaView>

    );



}
// Sử dụng component ThemeBar ở các file khác như sau:
// import { ThemeBar } from '../component/themeBar';
// ...