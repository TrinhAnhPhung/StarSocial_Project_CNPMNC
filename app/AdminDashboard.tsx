import { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme, 
  Alert, 
  ActivityIndicator,
  TextInput,
  RefreshControl,
  FlatList
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeBar } from "../component/themeBar";
import { COLORS } from "../constants/color";
import authService from "../services/authService";
import apiService from "../services/api";
import AddUserModal from "../component/AddUserModal";

type User = {
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status?: string;
  joined_date?: string;
  created_at?: string;
  id?: string;
  isLocked?: boolean;
};

type TabType = 'dashboard' | 'users' | 'settings';

export default function AdminDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme ?? 'dark'] ?? COLORS.dark;
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    loadUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedStatus, selectedRole, users]);

  const checkAdminAccess = async () => {
    const data = await authService.getUserData();
    if (!data || data.role !== 'admin') {
      Alert.alert('Không có quyền truy cập', 'Bạn không có quyền truy cập trang này.', [
        {
          text: 'OK',
          onPress: () => router.replace('/Home')
        }
      ]);
    }
    setLoading(false);
  };

  const loadUserData = async () => {
    const data = await authService.getUserData();
    setUserData(data);
    setCurrentUserId(data?.id || null);
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setError('');
      const response = await apiService.getUsers();
      
      if (response.success) {
        // Map response data to User type
        const usersData: User[] = (response.data || []).map((user: any) => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role || 'user',
          status: user.status || (user.isLocked ? 'banned' : 'active'),
          joined_date: user.joined_date || user.created_at,
          created_at: user.created_at,
          isLocked: user.isLocked || false,
        }));
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        setError(response.message || 'Không thể tải danh sách người dùng');
        if (response.message?.includes('403') || response.message?.includes('quyền')) {
          Alert.alert('Lỗi', 'Bạn không có quyền truy cập');
        }
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      setError(error.message || 'Không thể tải danh sách người dùng');
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách người dùng');
    } finally {
      setUsersLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'banned') {
        // Show locked users when filtering by banned
        filtered = filtered.filter(user => user.isLocked || user.status === 'banned');
      } else {
        filtered = filtered.filter(user => user.status === selectedStatus && !user.isLocked);
      }
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const getStatusColor = (status?: string, isLocked?: boolean) => {
    if (isLocked) {
      return '#dc3545';
    }
    switch (status) {
      case 'active':
        return '#28a745';
      case 'inactive':
        return '#6c757d';
      case 'banned':
        return '#dc3545';
      case 'pending':
        return '#007bff';
      case 'suspended':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (status?: string, isLocked?: boolean) => {
    if (isLocked) {
      return 'Bị khóa';
    }
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'banned':
        return 'Bị cấm';
      case 'pending':
        return 'Chờ duyệt';
      case 'suspended':
        return 'Tạm khóa';
      default:
        return 'Hoạt động';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'user':
        return 'Người dùng';
      case 'guest':
        return 'Khách';
      case 'moderator':
        return 'Điều hành viên';
      default:
        return role;
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingUser(null);
    setModalLoading(false);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      setModalLoading(true);
      
      if (editingUser) {
        // Update user
        const response = await apiService.updateUser(editingUser.id!, userData);
        
        if (response.success) {
          Alert.alert('Thành công', response.message || 'Đã cập nhật người dùng thành công');
          await loadUsers();
          handleCloseModal();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể cập nhật người dùng');
        }
      } else {
        // Create user
        const response = await apiService.createUser(userData);
        
        if (response.success) {
          Alert.alert('Thành công', response.message || 'Đã tạo người dùng thành công');
          await loadUsers();
          handleCloseModal();
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể tạo người dùng');
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu người dùng');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    // Prevent deleting current user or admin
    if (user.id === currentUserId) {
      Alert.alert('Lỗi', 'Bạn không thể xóa chính mình');
      return;
    }

    if (user.role?.toLowerCase() === 'admin') {
      Alert.alert('Lỗi', 'Bạn không thể xóa người dùng có vai trò Admin');
      return;
    }

    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc chắn muốn xóa người dùng ${user.email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteUser(user.id!);
              
              if (response.success) {
                Alert.alert('Thành công', response.message || 'Đã xóa người dùng thành công');
                await loadUsers();
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể xóa người dùng');
              }
            } catch (error: any) {
              console.error('Error deleting user:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa người dùng');
            }
          }
        }
      ]
    );
  };

  const handleToggleLock = async (user: User) => {
    // Prevent locking current user
    if (user.id === currentUserId) {
      Alert.alert('Lỗi', 'Bạn không thể khóa/mở khóa chính mình');
      return;
    }

    const action = user.isLocked ? 'mở khóa' : 'khóa';
    Alert.alert(
      `${action === 'khóa' ? 'Khóa' : 'Mở khóa'} người dùng`,
      `Bạn có chắc chắn muốn ${action} người dùng ${user.email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: action === 'khóa' ? 'Khóa' : 'Mở khóa', 
          onPress: async () => {
            try {
              const response = await apiService.toggleLockUser(user.id!, user.isLocked || false);
              
              if (response.success) {
                Alert.alert('Thành công', response.message || `Đã ${action} người dùng thành công`);
                await loadUsers();
              } else {
                Alert.alert('Lỗi', response.message || `Không thể ${action} người dùng`);
              }
            } catch (error: any) {
              console.error('Error toggling lock:', error);
              Alert.alert('Lỗi', error.message || `Không thể ${action} người dùng`);
            }
          }
        }
      ]
    );
  };

  const handleAddUser = () => {
    handleOpenAddModal();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              console.log('🔄 Bắt đầu quá trình đăng xuất...');
              
              const logoutResult = await authService.logout();
              
              if (logoutResult && !logoutResult.success) {
                setIsLoggingOut(false);
                console.error('❌ Lỗi logout:', logoutResult.message);
                Alert.alert('Lỗi', `Không thể đăng xuất: ${logoutResult.message || 'Lỗi không xác định'}`);
                return;
              }
              
              console.log('✅ Logout thành công, đang kiểm tra lại...');
              
              await new Promise(resolve => setTimeout(resolve, 300));
              
              const finalCheck = await authService.isAuthenticated();
              console.log('🔍 Kiểm tra lại authentication sau logout:', finalCheck);
              
              if (finalCheck) {
                console.warn('⚠️ Vẫn còn authenticated, force clear AsyncStorage...');
                try {
                  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                  await AsyncStorage.multiRemove(['auth_token', 'user_data']);
                  await new Promise(resolve => setTimeout(resolve, 200));
                  console.log('✅ Đã force xóa token và user data');
                } catch (clearError) {
                  console.error('❌ Lỗi khi force xóa:', clearError);
                }
              }
              
              const finalAuthCheck = await authService.isAuthenticated();
              if (finalAuthCheck) {
                console.error('❌ VẪN CÒN AUTHENTICATED! Force clear toàn bộ...');
                try {
                  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                  await AsyncStorage.clear();
                  console.log('✅ Đã clear toàn bộ AsyncStorage');
                } catch (clearError) {
                  console.error('❌ Lỗi khi clear:', clearError);
                }
              }
              
              setIsLoggingOut(false);
              
              Alert.alert(
                'Đăng xuất thành công',
                'Bạn đã đăng xuất thành công. Đang chuyển về trang mặc định...',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('🔄 Đang chuyển hướng về root route (/)...');
                      router.replace('/');
                    }
                  }
                ]
              );
              
            } catch (error: any) {
              setIsLoggingOut(false);
              console.error('❌ Lỗi trong quá trình logout:', error);
              Alert.alert(
                'Lỗi đăng xuất',
                `Đã xảy ra lỗi: ${error?.message || 'Lỗi không xác định'}\n\nVui lòng thử lại hoặc khởi động lại app.`,
                [
                  {
                    text: 'Thử lại',
                    onPress: handleLogout
                  },
                  {
                    text: 'OK',
                    style: 'default'
                  }
                ]
              );
            }
          }
        }
      ]
    );
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: theme.Text_color + '05', borderColor: theme.Text_color + '20' }]}>
      <View style={styles.userCardHeader}>
        <View style={styles.userCardInfo}>
          <Text style={[styles.userEmail, { color: theme.Text_color }]} numberOfLines={1}>
            {item.email}
          </Text>
          {item.full_name && (
            <Text style={[styles.userName, { color: theme.Text_color + 'AA' }]} numberOfLines={1}>
              {item.full_name}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, item.isLocked) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status, item.isLocked) }]}>
            {getStatusLabel(item.status, item.isLocked)}
          </Text>
        </View>
      </View>
      
      <View style={styles.userCardBody}>
        <View style={styles.userCardRow}>
          <Text style={[styles.userCardLabel, { color: theme.Text_color + 'AA' }]}>Vai trò:</Text>
          <Text style={[styles.userCardValue, { color: theme.Text_color }]}>
            {getRoleLabel(item.role)}
          </Text>
        </View>
        {(item.joined_date || item.created_at) && (
          <View style={styles.userCardRow}>
            <Text style={[styles.userCardLabel, { color: theme.Text_color + 'AA' }]}>Ngày tham gia:</Text>
            <Text style={[styles.userCardValue, { color: theme.Text_color }]}>
              {new Date(item.joined_date || item.created_at!).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}
        {item.isLocked && (
          <View style={styles.userCardRow}>
            <Text style={[styles.userCardLabel, { color: '#dc3545' }]}>🔒 Tài khoản bị khóa</Text>
          </View>
        )}
      </View>
      
      <View style={styles.userCardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#007bff' }]}
          onPress={() => handleOpenEditModal(item)}
        >
          <Text style={styles.actionButtonText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: item.isLocked ? '#28a745' : '#fd7e14' 
          }]}
          onPress={() => handleToggleLock(item)}
          disabled={item.id === currentUserId}
        >
          <Text style={styles.actionButtonText}>
            {item.isLocked ? '🔓 Mở khóa' : '🔒 Khóa'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
          onPress={() => handleDeleteUser(item)}
          disabled={item.id === currentUserId || item.role?.toLowerCase() === 'admin'}
        >
          <Text style={[styles.actionButtonText, 
            (item.id === currentUserId || item.role?.toLowerCase() === 'admin') && 
            { opacity: 0.5 }
          ]}>
            🗑️ Xóa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDashboard = () => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      banned: users.filter(u => u.status === 'banned').length,
      pending: users.filter(u => u.status === 'pending').length,
    };

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.dashboardSection}>
          <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>Tổng quan</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#007bff' }]}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Tổng người dùng</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#28a745' }]}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Đang hoạt động</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#dc3545' }]}>
              <Text style={styles.statValue}>{stats.banned}</Text>
              <Text style={styles.statLabel}>Bị cấm</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ffc107' }]}>
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Chờ duyệt</Text>
            </View>
          </View>
        </View>

        <View style={styles.dashboardSection}>
          <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>Thông tin quản trị viên</Text>
          {userData && (
            <View style={[styles.adminInfoCard, { backgroundColor: theme.Text_color + '10', borderColor: theme.Text_color + '30' }]}>
              <Text style={[styles.adminInfoText, { color: theme.Text_color }]}>
                Email: {userData.email}
              </Text>
              <Text style={[styles.adminInfoText, { color: theme.Text_color }]}>
                Họ tên: {userData.full_name || 'Chưa cập nhật'}
              </Text>
              <Text style={[styles.adminInfoText, { color: '#28a745', fontWeight: 'bold' }]}>
                Vai trò: Quản trị viên
              </Text>
            </View>
          )}
        </View>

        <View style={styles.dashboardSection}>
          <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>Tính năng nhanh</Text>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#28a745' }]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={styles.quickActionText}>👥 Quản lý người dùng</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#ffc107' }]}
            onPress={() => Alert.alert('Thông báo', 'Tính năng quản lý nội dung đang phát triển')}
          >
            <Text style={styles.quickActionText}>📝 Quản lý nội dung</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#17a2b8' }]}
            onPress={() => Alert.alert('Thông báo', 'Tính năng thống kê đang phát triển')}
          >
            <Text style={styles.quickActionText}>📊 Thống kê</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.normalUserButton, { backgroundColor: '#6c757d' }]}
          onPress={() => router.replace('/Home')}
        >
          <Text style={styles.normalUserButtonText}>← Về trang người dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#dc3545' }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderUsers = () => (
    <View style={styles.tabContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.Text_color + '10', 
            color: theme.Text_color,
            borderColor: theme.Text_color + '30'
          }]}
          placeholder="Tìm kiếm theo email hoặc tên..."
          placeholderTextColor={theme.Text_color + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive, 
            { backgroundColor: selectedStatus === 'all' ? '#007bff' : theme.Text_color + '10' }]}
          onPress={() => setSelectedStatus('all')}
        >
          <Text style={[styles.filterChipText, { color: selectedStatus === 'all' ? 'white' : theme.Text_color }]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'active' && styles.filterChipActive,
            { backgroundColor: selectedStatus === 'active' ? '#28a745' : theme.Text_color + '10' }]}
          onPress={() => setSelectedStatus('active')}
        >
          <Text style={[styles.filterChipText, { color: selectedStatus === 'active' ? 'white' : theme.Text_color }]}>
            Hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'inactive' && styles.filterChipActive,
            { backgroundColor: selectedStatus === 'inactive' ? '#6c757d' : theme.Text_color + '10' }]}
          onPress={() => setSelectedStatus('inactive')}
        >
          <Text style={[styles.filterChipText, { color: selectedStatus === 'inactive' ? 'white' : theme.Text_color }]}>
            Không hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'banned' && styles.filterChipActive,
            { backgroundColor: selectedStatus === 'banned' ? '#dc3545' : theme.Text_color + '10' }]}
          onPress={() => setSelectedStatus('banned')}
        >
          <Text style={[styles.filterChipText, { color: selectedStatus === 'banned' ? 'white' : theme.Text_color }]}>
            Bị cấm
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'pending' && styles.filterChipActive,
            { backgroundColor: selectedStatus === 'pending' ? '#007bff' : theme.Text_color + '10' }]}
          onPress={() => setSelectedStatus('pending')}
        >
          <Text style={[styles.filterChipText, { color: selectedStatus === 'pending' ? 'white' : theme.Text_color }]}>
            Chờ duyệt
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: '#fee', borderColor: '#fcc' }]}>
          <Text style={[styles.errorText, { color: '#c33' }]}>{error}</Text>
        </View>
      )}

      {/* Add User Button */}
      <TouchableOpacity 
        style={[styles.addUserButton, { backgroundColor: '#28a745' }]}
        onPress={handleAddUser}
        disabled={usersLoading}
      >
        <Text style={styles.addUserButtonText}>➕ Thêm người dùng</Text>
      </TouchableOpacity>

      {/* Users List */}
      {usersLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, { color: theme.Text_color }]}>Đang tải...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.Text_color + 'AA' }]}>
            Không tìm thấy người dùng nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id || item.email}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.usersList}
        />
      )}
    </View>
  );

  const renderSettings = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.dashboardSection}>
        <Text style={[styles.sectionTitle, { color: theme.Text_color }]}>Cài đặt hệ thống</Text>
        
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: theme.Text_color + '10', borderColor: theme.Text_color + '30' }]}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
        >
          <Text style={[styles.settingsButtonText, { color: theme.Text_color }]}>
            ⚙️ Cài đặt hệ thống
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: theme.Text_color + '10', borderColor: theme.Text_color + '30' }]}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
        >
          <Text style={[styles.settingsButtonText, { color: theme.Text_color }]}>
            📊 Thống kê
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: theme.Text_color + '10', borderColor: theme.Text_color + '30' }]}
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
        >
          <Text style={[styles.settingsButtonText, { color: theme.Text_color }]}>
            📈 Báo cáo
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#dc3545' }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading || isLoggingOut) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10, color: theme.Text_color }}>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đang tải...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background_color }]}>
        <ThemeBar />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#007bff' }]}>
          <Text style={styles.headerTitle}>🔐 Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Quản trị hệ thống</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>
              📊 Tổng quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.tabActive]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
              👥 Người dùng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
              ⚙️ Cài đặt
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'settings' && renderSettings()}

        {/* Add/Edit User Modal */}
        <AddUserModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onSubmit={handleSaveUser}
          initialData={editingUser}
          loading={modalLoading}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: COLORS.extra_large_font_size,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: COLORS.medium_font_size,
    color: 'white',
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: COLORS.medium_font_size,
    color: '#6c757d',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  dashboardSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: COLORS.large_font_size,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: COLORS.small_font_size,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  adminInfoCard: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  adminInfoText: {
    fontSize: COLORS.medium_font_size,
    marginBottom: 5,
  },
  quickActionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    fontSize: COLORS.medium_font_size,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    // Active state handled by backgroundColor
  },
  filterChipText: {
    fontSize: COLORS.small_font_size,
    fontWeight: '500',
  },
  addUserButton: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addUserButtonText: {
    color: 'white',
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
  },
  usersList: {
    padding: 15,
  },
  userCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userCardInfo: {
    flex: 1,
    marginRight: 10,
  },
  userEmail: {
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userName: {
    fontSize: COLORS.small_font_size,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: COLORS.small_font_size,
    fontWeight: '600',
  },
  userCardBody: {
    marginBottom: 10,
  },
  userCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  userCardLabel: {
    fontSize: COLORS.small_font_size,
  },
  userCardValue: {
    fontSize: COLORS.small_font_size,
    fontWeight: '500',
  },
  userCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    gap: 5,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    minHeight: 35,
    justifyContent: 'center',
  },
  errorContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: COLORS.small_font_size,
  },
  actionButtonText: {
    color: 'white',
    fontSize: COLORS.small_font_size,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: COLORS.medium_font_size,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: COLORS.medium_font_size,
  },
  settingsButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  settingsButtonText: {
    fontSize: COLORS.medium_font_size,
    fontWeight: '500',
  },
  normalUserButton: {
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  normalUserButtonText: {
    color: 'white',
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: COLORS.medium_font_size,
    fontWeight: 'bold',
  },
});
