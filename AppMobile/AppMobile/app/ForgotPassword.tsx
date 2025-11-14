import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import { COLORS } from '../constants/color'
import { useColorScheme } from 'react-native';
import { ThemeBar } from '../component/themeBar';
const ForgotPassword = () => {
    const colorScheme = useColorScheme();
    const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    return (
        <>
            <ThemeBar />
            <View style={[styles.container, { backgroundColor: theme.background_color }]}>
                <Text style={{ fontSize: COLORS.extra_large_font_size, marginBottom: 30, marginTop: -10, color: theme.Text_color, fontWeight: 'bold' }}>Forgot Password</Text>
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
            </View>
        </>

    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 24,
        justifyContent: "center",
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,

    },
    lable: {
        alignSelf: 'flex-start',
        fontSize: COLORS.medium_font_size,
        fontWeight: 'bold',
        marginBottom: 5,

    }

})