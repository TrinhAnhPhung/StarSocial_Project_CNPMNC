import API_BASE_URL from '../constants/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('📱 ApiService initialized');
    console.log('🌐 Base URL:', this.baseURL);
  }

  // Lấy token từ AsyncStorage
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Lưu token vào AsyncStorage
  async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🔵 API Request:', {
      url,
      method: options.method || 'GET',
      hasBody: !!options.body
    });
    
    // Lấy token nếu có
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Thêm token vào header nếu có
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Chuyển body thành JSON string nếu là object
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log('🟡 Fetching:', url);
      const response = await fetch(url, config);
      console.log('🟢 Response status:', response.status);
      
      const data = await response.json();
      
      // Xử lý lỗi từ backend
      if (!response.ok) {
        console.error('🔴 Response error:', data);
        // Nếu token hết hạn hoặc không hợp lệ
        if (response.status === 401 || response.status === 403) {
          // Xóa token và yêu cầu đăng nhập lại
          await this.setToken(null);
        }
        throw new Error(data.error || data.message || 'Request failed');
      }
      
      console.log('✅ Request successful');
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      console.error('Error details:', {
        message: error.message,
        url: url,
        baseURL: this.baseURL
      });
      throw error;
    }
  }

  async register(email, password, first_name, last_name) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: { email, password, first_name, last_name },
      });
      return {
        success: true,
        message: response.message || 'Đăng ký thành công',
        data: response.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Đăng ký thất bại',
      };
    }
  }

  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      
      // Backend trả về { success, token, user, message }
      if (response.success && response.token) {
        // Lưu token vào AsyncStorage
        await this.setToken(response.token);
        return {
          success: true,
          message: response.message || 'Đăng nhập thành công',
          data: {
            ...response.user,
            token: response.token,
          },
        };
      } else {
        return {
          success: false,
          message: response.error || response.message || 'Đăng nhập thất bại',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      };
    }
  }

  async logout() {
    // Xóa token khi logout
    await this.setToken(null);
    return { success: true };
  }

  async getCurrentUser() {
    try {
      const response = await this.request('/auth/me', {
        method: 'GET',
      });
      return {
        success: true,
        data: response.user || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải thông tin người dùng',
      };
    }
  }

  async getPost(postId) {
    try {
      const response = await this.request(`/posts/${postId}`, {
        method: 'GET',
      });
      return {
        success: true,
        data: response.post || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải bài viết',
      };
    }
  }

  async healthCheck() {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // Post APIs
  async getPosts() {
    try {
      const response = await this.request('/posts', {
        method: 'GET',
      });
      return {
        success: true,
        data: response.posts || response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải bài đăng',
        data: [],
      };
    }
  }

  async likePost(postId) {
    try {
      const response = await this.request(`/posts/${postId}/like`, {
        method: 'POST',
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể thích bài đăng',
      };
    }
  }

  async unlikePost(postId) {
    try {
      const response = await this.request(`/posts/${postId}/like`, {
        method: 'POST',
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể bỏ thích bài đăng',
      };
    }
  }

  // Create Post với upload file
  async createPost(formData) {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Bạn cần đăng nhập để tạo bài viết');
      }

      console.log('Creating post with FormData...');
      
      // Kiểm tra nếu đang chạy trên web
      const isWeb = typeof window !== 'undefined' && window.FormData;
      
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      // Trên web, không set Content-Type để browser tự động set boundary
      // Trên React Native, cũng không cần set
      
      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.log('Response text:', text);
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error(text || 'Lỗi không xác định từ server');
          }
        }
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error(text || 'Lỗi phản hồi từ server');
      }

      if (!response.ok) {
        console.error('Post creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data?.error || data?.message || `Lỗi ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error in createPost:', error);
      return {
        success: false,
        message: error.message || 'Không thể tạo bài viết',
      };
    }
  }

  // Get Trending Posts
  async getTrendingPosts() {
    try {
      const response = await this.request('/posts/trending', {
        method: 'GET',
      });
      return {
        success: true,
        data: response.posts || response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải bài đăng trending',
        data: [],
      };
    }
  }

  // Comments APIs
  async getComments(postId) {
    try {
      const response = await this.request(`/posts/${postId}/comments`, {
        method: 'GET',
      });
      return {
        success: true,
        data: response.comments || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải bình luận',
        data: [],
      };
    }
  }

  async addComment(postId, content) {
    try {
      const response = await this.request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: { content },
      });
      return {
        success: true,
        data: response.comment || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể thêm bình luận',
      };
    }
  }

  async likeComment(postId, commentId) {
    try {
      const response = await this.request(`/posts/${postId}/comments/${commentId}/like`, {
        method: 'POST',
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể thích bình luận',
      };
    }
  }

  // Update/Delete Post
  async updatePost(postId, { caption, location, hashtags }) {
    try {
      const response = await this.request(`/posts/${postId}`, {
        method: 'PUT',
        body: { caption, location, hashtags },
      });
      return {
        success: true,
        data: response.post || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể cập nhật bài viết',
      };
    }
  }

  async deletePost(postId) {
    try {
      const response = await this.request(`/posts/${postId}`, {
        method: 'DELETE',
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể xóa bài viết',
      };
    }
  }

  // Notifications APIs
  async getNotifications() {
    try {
      const response = await this.request('/notifications', {
        method: 'GET',
      });
      return {
        success: true,
        data: response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải thông báo',
        data: [],
      };
    }
  }

  async getUnreadCount() {
    try {
      const response = await this.request('/notifications/unread-count', {
        method: 'GET',
      });
      return {
        success: true,
        count: response.count || 0,
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
      };
    }
  }

  async markNotificationRead(notificationId) {
    try {
      const response = await this.request(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể đánh dấu đã đọc',
      };
    }
  }

  // Users/People APIs
  async getUsers() {
    try {
      const response = await this.request('/users', {
        method: 'GET',
      });
      return {
        success: true,
        data: response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải danh sách người dùng',
        data: [],
      };
    }
  }

  async followUser(userId) {
    try {
      const response = await this.request(`/users/${userId}/follow`, {
        method: 'POST',
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể theo dõi người dùng',
      };
    }
  }

  async getFollowStatus(userId) {
    try {
      const response = await this.request(`/users/${userId}/follow-status`, {
        method: 'GET',
      });
      return {
        success: true,
        isFollowing: response.is_following || false,
      };
    } catch (error) {
      return {
        success: false,
        isFollowing: false,
      };
    }
  }

  // Profile APIs
  async updateProfile({ first_name, last_name, email, username, bio, phone, date_of_birth, gender, location }) {
    try {
      // Prepare body with all fields, removing empty/undefined values
      const body = {};
      if (first_name) body.first_name = first_name;
      if (last_name) body.last_name = last_name;
      if (email) body.email = email;
      if (username) body.username = username;
      if (bio !== undefined) body.bio = bio;
      if (phone) body.phone = phone;
      if (date_of_birth) body.date_of_birth = date_of_birth;
      if (gender) body.gender = gender;
      if (location) body.location = location;

      const response = await this.request('/profile/me', {
        method: 'PUT',
        body: body,
      });
      return {
        success: true,
        data: response.user || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể cập nhật hồ sơ',
      };
    }
  }

  async updateProfilePicture(formData) {
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.baseURL}/profile/picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Cập nhật ảnh đại diện thất bại');
      }
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể cập nhật ảnh đại diện',
      };
    }
  }

  async getUserProfile(userId) {
    try {
      const response = await this.request(`/profile/${userId}`, {
        method: 'GET',
      });
      return {
        success: true,
        data: response.user || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải hồ sơ',
      };
    }
  }

  // Chat/Conversations APIs
  async getConversations() {
    try {
      const response = await this.request('/conversations', {
        method: 'GET',
      });
      return {
        success: true,
        data: response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải cuộc trò chuyện',
        data: [],
      };
    }
  }

  async getUnreadChatCount() {
    try {
      const response = await this.request('/conversations/unread-count', {
        method: 'GET',
      });
      return {
        success: true,
        count: response.count || 0,
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
      };
    }
  }

  async getConversationMessages(conversationId) {
    try {
      const response = await this.request(`/conversations/${conversationId}/messages`, {
        method: 'GET',
      });
      return {
        success: true,
        data: response.messages || response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải tin nhắn',
        data: [],
      };
    }
  }

  async createOrGetConversation(userId) {
    try {
      const response = await this.request('/conversations', {
        method: 'POST',
        body: { userId },
      });
      return {
        success: true,
        data: response.conversation || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tạo cuộc trò chuyện',
      };
    }
  }

  async sendMessage(conversationId, content) {
    try {
      const response = await this.request(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: { content },
      });
      return {
        success: true,
        data: response.message || response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể gửi tin nhắn',
      };
    }
  }

  // Followers APIs
  async getFollowers(userId) {
    try {
      const response = await this.request(`/users/${userId}/followers`, {
        method: 'GET',
      });
      return {
        success: true,
        data: response.followers || response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải danh sách người theo dõi',
        data: [],
      };
    }
  }

  async getFollowing(userId) {
    try {
      const response = await this.request(`/users/${userId}/following`, {
        method: 'GET',
      });
      return {
        success: true,
        data: response.following || response || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Không thể tải danh sách đang theo dõi',
        data: [],
      };
    }
  }
}

export default new ApiService();

