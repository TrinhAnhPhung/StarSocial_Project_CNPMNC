import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');

import { generateSalt, hashPassword, comparePassword, generateResetToken, isTokenExpired } from '../utils/authHelper.js';
import { generateToken } from '../utils/jwtHelper.js';
import sendEmail from '../utils/sendEmail.js';

// Đăng ký người dùng
export const registerUser = async (req, res) => {
  console.log('--- Yêu cầu đăng ký ---');
  const { email, password, first_name, last_name, role } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const pool = await connection();

    // Kiểm tra email đã tồn tại
    const existingUser = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT TOP 1 User_id FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    // Tạo mật khẩu hash
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    // Lưu user mới
    await pool
      .request()
      .input('User_id', sql.VarChar(26), crypto.randomUUID().slice(0, 26))
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar(16), salt)
      .input('First_Name', sql.NVarChar, first_name)
      .input('Last_name', sql.NVarChar, last_name)
      .input('Role', sql.NVarChar, role || 'user')
      .query(`
        INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability)
        VALUES (@User_id, @email, @password, @Salt, @First_Name, @Last_name, @Role, 'Normal')
      `);

    console.log(`✅ Đăng ký thành công: ${email}`);
    res.status(201).json({ message: 'Đăng ký thành công', user: { email, first_name } });
  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error);
    res.status(500).json({ error: 'Đăng ký thất bại' });
  }
};

// Đăng nhập
export const loginUser = async (req, res) => {
  console.log('--- Yêu cầu đăng nhập ---');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Thiếu email hoặc mật khẩu' });
  }

  try {
    const pool = await connection();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT TOP 1 * FROM Users WHERE Email = @email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(400).json({ success: false, error: 'Email không tồn tại' });
    }

    if (user.isLocked) {
      return res.status(403).json({ success: false, error: 'Tài khoản đã bị khóa' });
    }

    // Kiểm tra salt và password
    if (!user.Salt || !user.Password) {
      return res.status(400).json({ success: false, error: 'Tài khoản chưa được thiết lập đúng cách' });
    }

    // So sánh mật khẩu
    const isMatch = await comparePassword(password, user.Salt, user.Password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Mật khẩu không đúng' });
    }

    // Cập nhật trạng thái online
    await pool.request()
      .input('email', sql.NVarChar, email)
      .query('UPDATE Users SET Is_Online = 1, Last_Active = GETDATE() WHERE Email = @email');

    // Tạo JWT token
    const userRole = user.Role ? user.Role.trim() : null;
    const token = generateToken({
      id: user.User_id,
      email: user.Email,
      role: userRole
    });

    console.log(`✅ Đăng nhập thành công: ${email}`);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.User_id,
        email: user.Email,
        full_name: `${user.First_Name || ''} ${user.Last_name || ''}`.trim(),
        role: userRole
      }
    });
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
};

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Vui lòng nhập email' });
  }

  try {
    const pool = await connection();
    const userResult = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT TOP 1 User_id, Email FROM Users WHERE Email = @email');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    }

    const user = userResult.recordset[0];
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600 * 1000);

    // Lưu hoặc cập nhật token reset
    await pool
      .request()
      .input('user_id', sql.VarChar(26), user.User_id)
      .input('token', sql.NVarChar(255), token)
      .input('expires_at', sql.DateTime, expiresAt)
      .query(`
        MERGE password_resets AS target
        USING (SELECT @user_id AS user_id) AS src
        ON target.user_id = src.user_id
        WHEN MATCHED THEN
          UPDATE SET token = @token, expires_at = @expires_at, created_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (user_id, token, expires_at) VALUES (@user_id, @token, @expires_at);
      `);

    // Gửi email
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
    await sendEmail(
      user.Email,
      'Đặt lại mật khẩu StarSocial',
      `<p>Nhấn vào link để đặt lại mật khẩu: <a href="${resetLink}">Đặt lại mật khẩu</a></p>`
    );

    res.json({ message: 'Đã gửi liên kết đặt lại mật khẩu' });
  } catch (err) {
    console.error('❌ Lỗi forgotPassword:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu mới' });
  }

  try {
    const pool = await connection();
    const tokenResult = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query('SELECT TOP 1 * FROM password_resets WHERE token = @token');

    if (tokenResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Token không hợp lệ' });
    }

    const resetData = tokenResult.recordset[0];
    if (isTokenExpired(resetData.expires_at)) {
      return res.status(400).json({ error: 'Token đã hết hạn' });
    }

    // Hash mật khẩu mới
    const salt = generateSalt();
    const hashedPassword = await hashPassword(newPassword, salt);

    // Cập nhật mật khẩu
    await pool
      .request()
      .input('hashed', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar, salt)
      .input('user_id', sql.VarChar(26), resetData.user_id)
      .query('UPDATE Users SET Password = @hashed, Salt = @Salt WHERE User_id = @user_id');

    // Xóa token đã sử dụng
    await pool.request()
      .input('token', sql.NVarChar, token)
      .query('DELETE FROM password_resets WHERE token = @token');

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('❌ Lỗi resetPassword:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy profile người dùng
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const pool = await connection();
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query(`
        SELECT TOP 1 User_id AS id, full_name, username, email, bio, profile_picture_url
        FROM Users WHERE username = @username
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User found', user: result.recordset[0] });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tìm user theo email
export const findUserByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    const pool = await connection();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT TOP 1 User_id AS id, username, email FROM Users WHERE email = @email');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Đăng xuất
export const logoutUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const pool = await connection();
    await pool.request()
      .input('id', sql.VarChar(26), userId)
      .query('UPDATE Users SET Is_Online = 0, Last_Active = GETDATE() WHERE User_id = @id');

    res.json({ message: 'Đăng xuất thành công' });
  } catch (err) {
    console.error('❌ Lỗi đăng xuất:', err);
    res.status(500).json({ error: 'Đăng xuất thất bại' });
  }
};
