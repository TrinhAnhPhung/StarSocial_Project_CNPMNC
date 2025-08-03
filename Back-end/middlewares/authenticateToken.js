import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Sử dụng secret của bạn
    req.userId = decoded.id; // Lưu id người dùng từ token vào request
    next(); // Chuyển sang middleware tiếp theo
  } catch (error) {
    // Sử dụng biến error trong catch
    console.error(error); // Log lỗi ra console
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export default authenticateToken;
