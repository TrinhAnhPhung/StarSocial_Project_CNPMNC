# Hệ Thống Thông Báo (Notification System)

## Tổng Quan
Hệ thống thông báo cung cấp các hàm tiện ích để hiển thị thông báo thành công, lỗi, cảnh báo, và xác nhận một cách nhất quán trong toàn bộ ứng dụng.

## Vị Trí File
```
utils/notification.js
```

## Các Hàm Chính

### 1. showSuccess(message, onOk?)
Hiển thị thông báo thành công với icon ✅

**Tham số:**
- `message` (string): Nội dung thông báo
- `onOk` (function, optional): Callback khi người dùng bấm OK

**Ví dụ:**
```javascript
import { showSuccess } from '../utils/notification';

// Thông báo đơn giản
showSuccess('Đăng nhập thành công!');

// Thông báo với callback
showSuccess('Đăng nhập thành công!', () => {
  router.replace('/Home');
});
```

### 2. showError(message, onOk?)
Hiển thị thông báo lỗi với icon ❌

**Tham số:**
- `message` (string): Nội dung lỗi
- `onOk` (function, optional): Callback khi người dùng bấm OK

**Ví dụ:**
```javascript
import { showError } from '../utils/notification';

// Hiển thị lỗi
showError('Email hoặc mật khẩu không chính xác');

// Hiển thị lỗi với callback
showError('Phiên đăng nhập đã hết hạn', () => {
  router.replace('/Login');
});
```

### 3. showWarning(message, onOk?)
Hiển thị thông báo cảnh báo với icon ⚠️

**Tham số:**
- `message` (string): Nội dung cảnh báo
- `onOk` (function, optional): Callback khi người dùng bấm OK

**Ví dụ:**
```javascript
import { showWarning } from '../utils/notification';

// Cảnh báo validation
showWarning('Vui lòng điền đầy đủ thông tin');

// Cảnh báo quyền truy cập
showWarning('Cần quyền truy cập thư viện ảnh để tạo bài viết');
```

### 4. showInfo(message, onOk?)
Hiển thị thông báo thông tin với icon ℹ️

**Tham số:**
- `message` (string): Nội dung thông tin
- `onOk` (function, optional): Callback khi người dùng bấm OK

**Ví dụ:**
```javascript
import { showInfo } from '../utils/notification';

showInfo('Bạn có 3 tin nhắn mới');
```

### 5. showConfirm(title, message, onConfirm, onCancel?)
Hiển thị dialog xác nhận với 2 nút: Hủy và Xác nhận

**Tham số:**
- `title` (string): Tiêu đề dialog
- `message` (string): Nội dung thông báo
- `onConfirm` (function): Callback khi người dùng bấm Xác nhận
- `onCancel` (function, optional): Callback khi người dùng bấm Hủy

**Ví dụ:**
```javascript
import { showConfirm } from '../utils/notification';

showConfirm(
  'Xóa bài viết',
  'Bạn có chắc chắn muốn xóa bài viết này?',
  () => {
    // Thực hiện xóa
    handleDelete();
  },
  () => {
    console.log('Cancelled');
  }
);
```

### 6. formatErrorMessage(error)
Format error message từ API response

**Tham số:**
- `error` (object | string): Error object hoặc error string

**Trả về:** String - Formatted error message

**Ví dụ:**
```javascript
import { formatErrorMessage } from '../utils/notification';

try {
  await apiService.createPost(formData);
} catch (error) {
  const errorMsg = formatErrorMessage(error);
  showError(errorMsg);
}
```

### 7. showNetworkError()
Hiển thị thông báo lỗi mạng chuẩn

**Ví dụ:**
```javascript
import { showNetworkError } from '../utils/notification';

try {
  await apiService.login(email, password);
} catch (error) {
  if (error.message.includes('network')) {
    showNetworkError();
  }
}
```

### 8. showServerError()
Hiển thị thông báo lỗi server chuẩn

### 9. showAuthError()
Hiển thị thông báo lỗi xác thực (phiên đăng nhập hết hạn)

### 10. showPermissionError()
Hiển thị thông báo lỗi quyền truy cập

## Các File Đã Áp Dụng

### ✅ Login.tsx
```javascript
import { showSuccess, showError, showWarning } from '../utils/notification';

// Validation
if (!email.trim()) {
  showWarning('Vui lòng nhập email');
  return;
}

// Thành công
showSuccess('Đăng nhập thành công!', () => {
  router.replace('/Home');
});

// Lỗi
showError('Email hoặc mật khẩu không chính xác');
```

### ✅ Register.tsx
```javascript
import { showSuccess, showError, showWarning } from '../utils/notification';

// Validation
if (!fullName.trim()) {
  showWarning('Vui lòng nhập họ và tên');
  return;
}

// Thành công
showSuccess('Đăng ký thành công! Vui lòng đăng nhập.', () => {
  router.back();
});
```

### ✅ CreatePost.tsx
```javascript
import { showSuccess, showError, showWarning } from '../utils/notification';

// Validation
if (!image) {
  showWarning('Vui lòng chọn ảnh hoặc video');
  return;
}

// Thành công
showSuccess('Bài viết đã được tạo thành công!', () => {
  router.push('/Home');
});

// Lỗi
showError('Không thể tạo bài viết. Vui lòng thử lại.');
```

### ✅ EditProfile.tsx
```javascript
import { showSuccess, showError, showWarning } from '../utils/notification';

// Validation
if (!firstName.trim() || !lastName.trim()) {
  showWarning('Vui lòng điền đầy đủ họ và tên');
  return;
}

// Thành công lưu avatar
showSuccess('Ảnh đại diện đã được cập nhật thành công!');

// Thành công cập nhật profile
showSuccess('Đã cập nhật hồ sơ thành công!', () => {
  router.back();
});

// Lỗi
showError('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
```

### ✅ Feed.tsx
```javascript
import { showError } from '../utils/notification';

// Lỗi load posts
catch (error) {
  showError('Không thể tải bài đăng. Vui lòng kiểm tra kết nối mạng.');
}
```

## Best Practices

### 1. Validation Messages
Sử dụng `showWarning()` cho validation errors:
```javascript
if (!email.trim()) {
  showWarning('Vui lòng nhập email');
  return;
}
```

### 2. Success Actions
Sử dụng `showSuccess()` với callback để điều hướng:
```javascript
showSuccess('Đăng ký thành công!', () => {
  router.back();
});
```

### 3. Error Handling
Sử dụng `showError()` cho lỗi từ API:
```javascript
try {
  await apiService.createPost(formData);
  showSuccess('Bài viết đã được tạo!');
} catch (error) {
  showError(formatErrorMessage(error));
}
```

### 4. User Confirmation
Sử dụng `showConfirm()` cho các hành động quan trọng:
```javascript
showConfirm(
  'Xóa bài viết',
  'Bạn có chắc chắn muốn xóa?',
  () => handleDelete()
);
```

## Lợi Ích

1. **Nhất quán**: Tất cả thông báo có cùng style và behavior
2. **Dễ bảo trì**: Chỉ cần sửa một nơi để thay đổi toàn bộ
3. **Type-safe**: TypeScript support với JSDoc
4. **Flexible**: Hỗ trợ callback cho mọi notification
5. **User-friendly**: Icon rõ ràng, message dễ hiểu

## Roadmap

### Tính năng có thể thêm:
- [ ] Toast notifications (thay vì Alert dialog)
- [ ] Notification queue system
- [ ] Customize notification duration
- [ ] Sound/vibration support
- [ ] Custom icon và color
- [ ] Rich notification với actions
- [ ] Notification history

## Lưu Ý

- Tất cả notifications đều sử dụng `Alert.alert()` của React Native
- `cancelable: false` được set để người dùng phải bấm button
- OnOk callback là optional, có thể bỏ qua nếu không cần
- Message có thể là string hoặc undefined (sẽ dùng default message)
