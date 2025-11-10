import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/color';

type HeaderProps = {
  onNotificationPress?: () => void;
  onChatPress?: () => void;
};

export default function Header({ onNotificationPress, onChatPress }: HeaderProps) {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.background_color }]}>
      <View style={styles.leftSection}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="notifications" size={24} color={theme.Text_color} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onChatPress}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chat" size={24} color={theme.Text_color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E020',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 30,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
});

