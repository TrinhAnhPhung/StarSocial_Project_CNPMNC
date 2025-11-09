import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/color';

type UserData = {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: string;
};

type AddUserModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (userData: UserData) => Promise<void>;
  initialData?: any;
  loading?: boolean;
};

export default function AddUserModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: AddUserModalProps) {
  const isEditMode = Boolean(initialData);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && initialData) {
      setEmail(initialData.email || '');
      setRole(initialData.role || 'user');
      setPassword('');
      
      // Parse full_name thành first_name và last_name
      if (initialData.full_name) {
        const nameParts = initialData.full_name.trim().split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      } else {
        setFirstName(initialData.first_name || '');
        setLastName(initialData.last_name || '');
      }
    } else {
      // Reset form khi thêm mới
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('user');
    }
    setShowPassword(false);
    setSubmitting(false);
  }, [initialData, isEditMode, visible]);

  const handleSave = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Email không được để trống.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    if (!isEditMode && !password.trim()) {
      Alert.alert('Lỗi', 'Mật khẩu không được để trống khi tạo người dùng mới.');
      return;
    }

    if (!isEditMode && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        email: email.trim(),
        password: password.trim() || undefined,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
      });
      // onClose sẽ được gọi trong onSubmit handler của parent
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    { value: 'user', label: 'Người dùng' },
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'moderator', label: 'Điều hành viên' },
    { value: 'guest', label: 'Khách' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background_color }]}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: theme.Text_color }]}>
              {isEditMode ? '📝 Chỉnh sửa người dùng' : '✨ Thêm người dùng mới'}
            </Text>

            {/* First Name và Last Name */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: theme.Text_color }]}>Họ</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.Text_color + '10', 
                    color: theme.Text_color,
                    borderColor: theme.Text_color + '30'
                  }]}
                  placeholder="Nguyễn"
                  placeholderTextColor={theme.Text_color + '80'}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: theme.Text_color }]}>Tên</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.Text_color + '10', 
                    color: theme.Text_color,
                    borderColor: theme.Text_color + '30'
                  }]}
                  placeholder="Văn A"
                  placeholderTextColor={theme.Text_color + '80'}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.Text_color }]}>Email</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isEditMode ? theme.Text_color + '20' : theme.Text_color + '10', 
                  color: theme.Text_color,
                  borderColor: theme.Text_color + '30'
                }]}
                placeholder="johndoe@mail.com"
                placeholderTextColor={theme.Text_color + '80'}
                value={email}
                onChangeText={setEmail}
                editable={!isEditMode}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password - chỉ hiển thị khi thêm mới hoặc có thể thay đổi khi sửa */}
            {(!isEditMode || password) && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.Text_color }]}>
                  Mật khẩu {isEditMode ? '(để trống nếu không thay đổi)' : '*'}
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { 
                      backgroundColor: theme.Text_color + '10', 
                      color: theme.Text_color,
                      borderColor: theme.Text_color + '30'
                    }]}
                    placeholder={isEditMode ? 'Nhập mật khẩu mới (tùy chọn)' : 'Mật khẩu (ít nhất 6 ký tự)'}
                    placeholderTextColor={theme.Text_color + '80'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={[styles.eyeIcon, { color: theme.Text_color }]}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Role */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.Text_color }]}>Vai trò</Text>
              <View style={styles.roleContainer}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.roleButton,
                      role === r.value && styles.roleButtonActive,
                      { 
                        backgroundColor: role === r.value ? '#007bff' : theme.Text_color + '10',
                        borderColor: theme.Text_color + '30'
                      }
                    ]}
                    onPress={() => setRole(r.value)}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        { color: role === r.value ? 'white' : theme.Text_color }
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: '#6c757d' }]}
                onPress={onClose}
                disabled={submitting || loading}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: '#007bff' }]}
                onPress={handleSave}
                disabled={submitting || loading}
              >
                {submitting || loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: COLORS.large_font_size,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: COLORS.small_font_size,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    fontSize: COLORS.medium_font_size,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 45,
    borderWidth: 1,
    fontSize: COLORS.medium_font_size,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  roleButtonActive: {
    // Active style handled by backgroundColor
  },
  roleButtonText: {
    fontSize: COLORS.small_font_size,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45,
  },
  cancelButton: {
    // Style handled by backgroundColor
  },
  saveButton: {
    // Style handled by backgroundColor
  },
  buttonText: {
    color: 'white',
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
  },
});

