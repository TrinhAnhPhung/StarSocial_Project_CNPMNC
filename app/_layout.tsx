import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'StarSocial',
        }}
      />
      <Stack.Screen
        name="Login"
        options={{
          title: 'Đăng nhập',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Register"
        options={{
          title: 'Đăng ký',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        options={{
          title: 'Quên mật khẩu',
        }}
      />
      <Stack.Screen
        name="Home"
        options={{
          title: 'Trang chủ',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="CreatePost"
        options={{
          title: 'Tạo bài viết',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Comments"
        options={{
          title: 'Bình luận',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Profile"
        options={{
          title: 'Hồ sơ',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        options={{
          title: 'Chỉnh sửa hồ sơ',
        }}
      />
      <Stack.Screen
        name="Explore"
        options={{
          title: 'Khám phá',
        }}
      />
      <Stack.Screen
        name="Activity"
        options={{
          title: 'Hoạt động',
        }}
      />
      <Stack.Screen
        name="Chat"
        options={{
          title: 'Tin nhắn',
        }}
      />
      <Stack.Screen
        name="ChatDetail"
        options={{
          title: 'Trò chuyện',
        }}
      />
    </Stack>
  );
}