import { StatusBar, useColorScheme } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { use, useEffect } from "react";

export function ThemeBar() {
    const scheme = useColorScheme();
    useEffect(() => {
        NavigationBar.setBackgroundColorAsync(
            scheme === 'light' ? '#ffffff' : '#262626'

        );
        NavigationBar.setButtonStyleAsync(scheme === "dark" ? "light" : "dark");
    }, [scheme]);
    return (
        <StatusBar
            barStyle={scheme === 'light' ? 'dark-content' : 'light-content'}
            backgroundColor={scheme === 'light' ? '#ffffff' : '#262626'}
        />
    );
}