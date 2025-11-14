# QUICK FIX - Sửa lỗi react-native-svg

## Bước 1: Dừng Expo server
Nhấn `Ctrl + C` trong terminal đang chạy `npm start`

## Bước 2: Cài đặt dependencies
Chạy lệnh sau trong terminal (trong thư mục AppMobile/AppMobile):
```
npm install
```

## Bước 3: Clear cache và start lại
```
npm start -- --clear
```

## Hoặc sử dụng file batch:
1. Double-click file `install-dependencies.bat`
2. Đợi cài đặt xong
3. Chạy: `npm start -- --clear`

## Kiểm tra đã cài đặt thành công:
Sau khi chạy `npm install`, kiểm tra:
```
npm list react-native-svg
```

Nếu thấy version (ví dụ: `react-native-svg@15.8.0`), đã cài đặt thành công.

## Nếu vẫn lỗi:
1. Xóa node_modules: `rmdir /s /q node_modules`
2. Xóa package-lock.json: `del package-lock.json`
3. Chạy lại: `npm install`
4. Chạy: `npm start -- --clear`

