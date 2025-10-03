import { use, useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert, useColorScheme, StatusBar } from "react-native";
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apploading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import { COLORS } from "../constants/color";
import { Link } from "expo-router";
import { useNavigation } from "expo-router";
import { ThemeBar } from "../component/themeBar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme] ?? COLORS.dark;
  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem('hasSeenIntro').then(value => {
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

          <Image source={colorScheme === 'dark' ? require('../assets/logo.png') : require('../assets/logo.png')} style={{ width: 100, height: 100, marginBottom: 20 }} >

          </Image>
          <Text style={{ fontSize: COLORS.extra_large_font_size, fontWeight: 'bold', marginBottom: 30, marginTop: -10, color: theme.Text_color }}>Welcome to StarSocial</Text>
          <Text style={[styles.lable, { color: theme.Text_color }]}>Gmail</Text>
          <TextInput

            placeholder="Enter your email"
            style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
            onChange={(e) => setEmail(e.nativeEvent.text)}
          />

          <Text style={[styles.lable, { color: theme.Text_color }]}>Password</Text>
          <TextInput
            placeholder="Enter your Password"
            secureTextEntry
            style={[styles.input, { color: theme.Text_color, borderColor: theme.Text_color }]}
            onChange={(e) => setEmail(e.nativeEvent.text)}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity style={{ alignSelf: 'flex-start', marginBottom: 15 }} onPress={() => navigation.navigate('ForgotPassword')}>

              <Text style={[styles.lable, { color: theme.Text_color }]}>I forgot password</Text >
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 15 }} onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.lable, { color: theme.Text_color }]}>I don't have account</Text>

            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#007bff',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20,
              width: '100%',
            }}
            onPress={() => Alert.alert('Register button pressed')}
          >
            <Text style={{ color: "white", fontSize: 18 }}>Login {colorScheme}</Text>
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
