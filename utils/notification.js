import { Alert, Platform } from 'react-native';

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Nội dung thông báo
 * @param {function} onOk - Callback khi bấm OK (optional)
 */
export const showSuccess = (message, onOk = undefined) => {
  Alert.alert(
    '✅ Thành công',
    message,
    [
      {
        text: 'OK',
        onPress: onOk,
      },
    ],
    { cancelable: false }
  );
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo lỗi
 * @param {function} onOk - Callback khi bấm OK (optional)
 */
export const showError = (message, onOk = undefined) => {
  Alert.alert(
    '❌ Lỗi',
    message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    [
      {
        text: 'OK',
        onPress: onOk,
      },
    ],
    { cancelable: false }
  );
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} message - Nội dung cảnh báo
 * @param {function} onOk - Callback khi bấm OK (optional)
 */
export const showWarning = (message, onOk = undefined) => {
  Alert.alert(
    '⚠️ Cảnh báo',
    message,
    [
      {
        text: 'OK',
        onPress: onOk,
      },
    ],
    { cancelable: false }
  );
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} message - Nội dung thông tin
 * @param {function} onOk - Callback khi bấm OK (optional)
 */
export const showInfo = (message, onOk = undefined) => {
  Alert.alert(
    'ℹ️ Thông báo',
    message,
    [
      {
        text: 'OK',
        onPress: onOk,
      },
    ],
    { cancelable: false }
  );
};

/**
 * Hiển thị dialog xác nhận
 * @param {string} title - Tiêu đề
 * @param {string} message - Nội dung
 * @param {function} onConfirm - Callback khi xác nhận
 * @param {function} onCancel - Callback khi hủy (optional)
 */
export const showConfirm = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Hủy',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Xác nhận',
        onPress: onConfirm,
      },
    ],
    { cancelable: false }
  );
};

/**
 * Hiển thị thông báo loading (chỉ text, không có dialog)
 * Sử dụng với ActivityIndicator component
 */
export const showLoading = (message = 'Đang xử lý...') => {
  // Đây chỉ là placeholder, thực tế cần dùng với component Loading
  console.log('Loading:', message);
  return message;
};

/**
 * Format error message từ API response
 * @param {object} error - Error object
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
};

/**
 * Hiển thị thông báo lỗi mạng
 */
export const showNetworkError = () => {
  showError('Không có kết nối mạng. Vui lòng kiểm tra và thử lại.');
};

/**
 * Hiển thị thông báo lỗi server
 */
export const showServerError = () => {
  showError('Máy chủ đang bảo trì. Vui lòng thử lại sau.');
};

/**
 * Hiển thị thông báo lỗi xác thực
 */
export const showAuthError = () => {
  showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
};

/**
 * Hiển thị thông báo lỗi quyền truy cập
 */
export const showPermissionError = () => {
  showError('Bạn không có quyền thực hiện thao tác này.');
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showLoading,
  formatErrorMessage,
  showNetworkError,
  showServerError,
  showAuthError,
  showPermissionError,
};
