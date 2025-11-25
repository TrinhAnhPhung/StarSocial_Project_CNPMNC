import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useColorScheme, Image } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/color';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeBar } from '../component/themeBar';

const ForgotPassword = () => {
    const colorScheme = useColorScheme();
    const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
    const router = useRouter();
    const [email, setEmail] = useState('');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
            <ThemeBar />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Header with Close Button */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={30} color={theme.text_primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Image 
                                source={require('../assets/logo.png')} 
                                style={{ width: 80, height: 80, tintColor: COLORS.primary }} 
                                resizeMode="contain" 
                            />
                        </View>

                        {/* Title & Subtitle */}
                        <Text style={[styles.title, { color: theme.text_primary }]}>
                            Bạn gặp sự cố khi đăng nhập?
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.text_secondary }]}>
                            Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
                        </Text>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: theme.text_primary }]}>Email</Text>
                            <TextInput
                                placeholder="Nhập email của bạn"
                                placeholderTextColor={theme.text_secondary}
                                value={email}
                                onChangeText={setEmail}
                                style={[styles.input, { 
                                    color: theme.text_primary, 
                                    borderColor: theme.border_color,
                                    backgroundColor: theme.card_background 
                                }]}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Create New Account Link */}
                        <TouchableOpacity 
                            style={styles.createAccountLink}
                            onPress={() => router.push('/Register')}
                        >
                            <Text style={styles.linkText}>Tạo tài khoản mới</Text>
                        </TouchableOpacity>

                        {/* Submit Button */}
                        <TouchableOpacity style={styles.submitButton}>
                            <Text style={styles.submitButtonText}>Gửi liên kết đặt lại</Text>
                        </TouchableOpacity>

                        {/* Cant Reset Password Link */}
                        <TouchableOpacity style={styles.cantResetLink}>
                            <Text style={styles.linkText}>Bạn không thể đặt lại mật khẩu?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity 
                            style={[styles.backButton, { borderColor: theme.border_color, backgroundColor: theme.card_background }]}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.backButtonText, { color: '#3B82F6' }]}>Quay lại đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        marginTop: 20,
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    createAccountLink: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    linkText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
    },
    submitButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#3B82F6',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cantResetLink: {
        marginBottom: 30,
    },
    footer: {
        marginTop: 'auto',
        width: '100%',
        paddingBottom: 20,
    },
    backButton: {
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
