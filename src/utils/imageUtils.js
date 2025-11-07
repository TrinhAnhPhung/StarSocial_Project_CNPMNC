/**
 * Helper function để xử lý URL ảnh đúng cách
 * @param {string|null|undefined} imageUrl - URL ảnh từ database
 * @param {string} backendUrl - URL backend (optional, sẽ lấy từ env nếu không có)
 * @returns {string} - URL ảnh đã được format đúng
 */
export const getImageUrl = (imageUrl, backendUrl = null) => {
  // Lấy backend URL từ environment variable nếu không được truyền vào
  const linkBackend = backendUrl || import.meta.env.VITE_Link_backend || 'http://localhost:5000';

  // Nếu không có URL hoặc là null/undefined, trả về default avatar
  if (!imageUrl || imageUrl === null || imageUrl === undefined) {
    return 'https://ui-avatars.com/api/?name=User&background=random&size=128';
  }

  // Chuyển đổi sang string để xử lý
  const imageUrlStr = String(imageUrl).trim();

  // Nếu là chuỗi rỗng hoặc là chuỗi 'null'/'undefined', trả về default avatar
  if (imageUrlStr === '' || imageUrlStr === 'null' || imageUrlStr === 'undefined' || imageUrlStr === 'NULL') {
    return 'https://ui-avatars.com/api/?name=User&background=random&size=128';
  }

  // Nếu URL đã là full URL (http/https hoặc Cloudinary), trả về trực tiếp
  if (imageUrlStr.startsWith('http://') || imageUrlStr.startsWith('https://')) {
    return imageUrlStr;
  }

  // Nếu URL bắt đầu bằng /uploads/ hoặc /, thêm backend URL
  if (imageUrlStr.startsWith('/uploads/') || imageUrlStr.startsWith('/')) {
    return `${linkBackend}${imageUrlStr}`;
  }

  // Trường hợp khác, thêm /uploads/ và backend URL
  return `${linkBackend}/uploads/${imageUrlStr}`;
};

// Export default để dễ import
export default { getImageUrl };

