import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Tạo salt ngẫu nhiên
export const generateSalt = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Hash password với salt
export const hashPassword = async (password, salt) => {
  const bcryptSalt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password + salt, bcryptSalt);
};

// So sánh password
export const comparePassword = async (password, salt, hashedPassword) => {
  return await bcrypt.compare(password + salt, hashedPassword);
};

// Tạo reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Kiểm tra token hết hạn
export const isTokenExpired = (expiresAt) => {
  return Date.now() > new Date(expiresAt).getTime();
};
