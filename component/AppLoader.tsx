import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useColorScheme } from "react-native";
import { COLORS } from "../constants/color";

type AppLoaderProps = {
  message?: string;
  logoSize?: number;
  containerStyle?: ViewStyle;
  logoSource?: ImageSourcePropType;
};

const DEFAULT_MESSAGE = "Đang tải...";

export default function AppLoader({
  message = DEFAULT_MESSAGE,
  logoSize = 72,
  containerStyle,
  logoSource = require("../assets/logo.png"),
}: AppLoaderProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? "dark"] ?? COLORS.dark;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 850,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  const animatedStyle = useMemo(() => {
    const scale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.78, 1.1],
    });

    const opacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.65, 1],
    });

    return {
      transform: [{ scale }],
      opacity,
    };
  }, [pulseAnim]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background_color },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.logoWrapper,
          {
            shadowColor: theme.Text_color + "38",
            backgroundColor: theme.background_color + "CC",
          },
        ]}
      >
        <Animated.Image
          source={logoSource}
          style={[
            styles.logo,
            { width: logoSize, height: logoSize },
            animatedStyle,
          ]}
        />
      </View>
      {message ? (
        <Text style={[styles.message, { color: theme.Text_color }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    marginBottom: 18,
  },
  logo: {
    resizeMode: "contain",
  },
  message: {
    fontSize: COLORS.medium_font_size,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});


