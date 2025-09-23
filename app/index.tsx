import { View, Text, Image, Animated, StyleSheet, useColorScheme, StatusBar } from "react-native";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./SplashScreen";
import Page from "./Login";
import { COLORS } from "../constants/color";

import { ThemeBar } from "../component/themeBar";
const Stack = createNativeStackNavigator();

export default function App() {
    const [showFlashScreen, setShowFlashScreen] = useState(true);
    const fadeAnim = new Animated.Value(1);

    const colorScheme = useColorScheme();
    const theme = COLORS[colorScheme] ?? COLORS.dark;

    useEffect(() => {
        setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => setShowFlashScreen(false));
        }, 1000);
    }, []);
    if (showFlashScreen) {
        return (
            <>
                <ThemeBar />
                {/* Các component khác */  <Animated.View style={[styles.container, { opacity: fadeAnim }, { backgroundColor: theme.backgroundColor }]}>
                    <Image source={require('../assets/logo.png')} style={{ width: 200, height: 200 }} />
                </Animated.View>}

            </>

        );
    }
    return (<>
        <ThemeBar />{
            <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
                <Text style={{ color: theme.Text_color }}>Login screen sẽ nằm ở file khác, ví dụ `app/login.tsx` dday la </Text>
            </View >
        }</>
        // <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>

        //     <Stack.Screen name="Login" component={Page} />
        // </Stack.Navigator>

    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',


    }
});