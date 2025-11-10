# Hướng dẫn sửa lỗi "react-native-svg is not installed"

## Lỗi gặp phải:
```
CommandError: "react-native-svg" is added as a dependency in your project's 
package.json but it doesn't seem to be installed. Run "npm install", or the 
equivalent for your package manager, and try again.
```

## Cách sửa (Chọn 1 trong các cách sau):

### Cách 1: Sử dụng file batch (Dễ nhất - Windows)
1. Mở file `install-dependencies.bat` trong thư mục `AppMobile/AppMobile`
2. Double-click để chạy
3. Sau khi cài xong, chạy: `npm start -- --clear`

### Cách 2: Chạy lệnh trong PowerShell/CMD
1. Mở PowerShell hoặc CMD
2. Di chuyển đến thư mục:
   ```
   cd "AppMobile\AppMobile"
   ```
3. Chạy lệnh cài đặt:
   ```
   npm install
   ```
4. Sau khi cài xong, clear cache và start:
   ```
   npm start -- --clear
   ```

### Cách 3: Nếu vẫn lỗi, xóa và cài lại
1. Xóa `node_modules` và `package-lock.json`:
   ```
   rmdir /s /q node_modules
   del package-lock.json
   ```
2. Cài đặt lại:
   ```
   npm install
   ```
3. Clear cache và start:
   ```
   npm start -- --clear
   ```

## Kiểm tra package đã được cài đặt:
Chạy lệnh sau để kiểm tra:
```
npm list react-native-svg
npm list @expo/vector-icons
```

Nếu thấy version (ví dụ: `react-native-svg@15.14.0`), package đã được cài đặt.

## Lưu ý:
- **QUAN TRỌNG**: Phải chạy `npm install` trong thư mục `AppMobile/AppMobile`
- Sau khi cài đặt, **bắt buộc** phải chạy `npm start -- --clear` để clear cache
- Nếu vẫn lỗi, kiểm tra terminal của Expo server để xem lỗi chi tiết

## Nếu vẫn không được:
1. Đóng tất cả terminal/command prompt
2. Xóa folder `.expo` trong thư mục `AppMobile/AppMobile`
3. Chạy lại `npm install`
4. Chạy `npm start -- --clear`

