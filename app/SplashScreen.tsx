import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
    const router = useRouter();
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/Login');
        }, 2000); // 2 giây thôi, không phải 20000 (20 giây)

        return () => clearTimeout(timer); // clear khi unmount
    }, [router]);

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 20 }}>Splash Screen</Text>
        </View>
    );
}
