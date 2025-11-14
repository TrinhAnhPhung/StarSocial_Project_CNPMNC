# Hướng dẫn sửa lỗi Expo Bundle

## Lỗi gặp phải:
- `GET http://localhost:8081/node_modules/expo-router/entry.bundle?plat... net::ERR_ABORTED 500 (Internal Server Error)`
- `Refused to execute script because its MIME type ('application/json') is not executable`

## Nguyên nhân:
1. Package `react-native-svg` chưa được cài đặt
2. Package `@expo/vector-icons` chưa được cài đặt
3. Expo cache có thể bị lỗi

## Cách sửa:

### Bước 1: Cài đặt dependencies
```bash
cd AppMobile/AppMobile
npm install
```

### Bước 2: Clear cache và restart Expo
```bash
# Xóa cache
npx expo start --clear

# Hoặc
npm start -- --clear
```

### Bước 3: Nếu vẫn lỗi, thử các bước sau:
```bash
# Xóa node_modules và reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start -c

# Hoặc clear Metro bundler cache
npx react-native start --reset-cache
```

### Bước 4: Kiểm tra các package đã được cài đặt:
```bash
npm list react-native-svg
npm list @expo/vector-icons
```

### Bước 5: Nếu vẫn lỗi, kiểm tra terminal/console của Expo server
- Xem có lỗi gì trong terminal nơi chạy `npm start`
- Lỗi thường sẽ hiển thị chi tiết hơn trong terminal

### Bước 6: Kiểm tra phiên bản package
Đảm bảo các package tương thích:
- `react-native-svg`: ^15.8.0
- `@expo/vector-icons`: ^15.0.3
- `expo`: ~54.0.22
- `react-native`: 0.81.5

## Lưu ý:
- Đảm bảo đang chạy trong thư mục `AppMobile/AppMobile`
- Đảm bảo đã cài đặt Node.js và npm
- Nếu đang chạy trên web, có thể cần rebuild: `npm run web`

