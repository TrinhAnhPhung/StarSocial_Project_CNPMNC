# Hướng dẫn sửa lỗi 500 Internal Server Error

## Lỗi gặp phải:
```
GET http://localhost:8081/node_modules/expo-router/entry.bundle?plat... 
net::ERR_ABORTED 500 (Internal Server Error)

Refused to execute script because its MIME type ('application/json') 
is not executable
```

## Nguyên nhân:
1. **Package chưa được cài đặt**: `react-native-svg` và `@expo/vector-icons` chưa được cài
2. **Cache bị lỗi**: Expo/Metro bundler cache có vấn đề
3. **Lỗi trong code**: Có lỗi khiến Metro không thể build bundle

## Cách sửa (theo thứ tự):

### Bước 1: Cài đặt dependencies
```bash
cd AppMobile/AppMobile
npm install
```

### Bước 2: Clear cache và restart Expo
```bash
# Xóa cache và restart
npx expo start --clear

# Hoặc
npm start -- --clear
```

### Bước 3: Nếu vẫn lỗi, xóa node_modules và reinstall
```bash
# Xóa node_modules
rm -rf node_modules
# Hoặc trên Windows:
rmdir /s /q node_modules

# Cài đặt lại
npm install

# Clear cache và start lại
npx expo start --clear
```

### Bước 4: Kiểm tra terminal của Expo server
- Xem terminal nơi chạy `npm start` hoặc `expo start`
- Lỗi chi tiết sẽ hiển thị ở đó, không phải trong browser console
- Tìm dòng có chữ "Error" hoặc "Failed"

### Bước 5: Kiểm tra package đã được cài đặt
```bash
npm list react-native-svg
npm list @expo/vector-icons
```

Nếu thấy `empty` hoặc `undefined`, package chưa được cài. Chạy lại `npm install`.

### Bước 6: Nếu vẫn lỗi, kiểm tra version compatibility
Đảm bảo các package tương thích với Expo SDK 54:
- `react-native-svg`: ^15.8.0 (hoặc version tương thích với Expo)
- `@expo/vector-icons`: ^15.0.3
- `expo`: ~54.0.22

### Bước 7: Kiểm tra lỗi trong code
Kiểm tra các file mới tạo:
- `component/icons/PostIcons.tsx`
- `component/Header.tsx`
- `component/BottomNavigation.tsx`
- `component/PostCard.tsx`

Đảm bảo không có lỗi syntax.

## Lưu ý quan trọng:
1. **Luôn kiểm tra terminal của Expo server** - lỗi chi tiết sẽ ở đó
2. **Đảm bảo đang chạy trong thư mục đúng**: `AppMobile/AppMobile`
3. **Clear cache** sau khi cài package mới
4. **Restart Expo server** sau mỗi thay đổi dependencies

## Nếu vẫn không được:
1. Xóa folder `.expo` và `node_modules`
2. Xóa `package-lock.json`
3. Chạy `npm install` lại
4. Chạy `npx expo start --clear`

