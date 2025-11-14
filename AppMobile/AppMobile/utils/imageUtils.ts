import API_BASE_URL from '../constants/apiConfig';

/**
 * Lấy URL đầy đủ của hình ảnh từ backend
 * @param imageUrl - URL từ backend (có thể là relative hoặc absolute)
 * @returns URL đầy đủ của hình ảnh
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '';
  }

  // Nếu đã là URL đầy đủ (bắt đầu bằng http:// hoặc https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Nếu là Cloudinary URL
  if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  // Nếu là relative path, thêm base URL
  // Loại bỏ /api từ API_BASE_URL vì hình ảnh không nằm trong /api
  const baseUrl = API_BASE_URL.replace('/api', '');
  
  // Đảm bảo imageUrl bắt đầu bằng /
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${cleanUrl}`;
}

/**
 * Lấy URL avatar của người dùng
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  return getImageUrl(avatarUrl);
}

/**
 * Lấy URL hình ảnh bài đăng
 */
export function getPostImageUrl(imageUrl: string | null | undefined): string {
  return getImageUrl(imageUrl);
}

