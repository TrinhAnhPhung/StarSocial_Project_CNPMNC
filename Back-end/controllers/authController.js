// ✅ SỬA LỖI: Đường dẫn đúng đến tệp config trong 'src'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Giả sử đường dẫn này đúng
import sendEmail from '../utils/sendEmail.js'; 

/* ============================
    Đăng ký người dùng
============================ */
const registerUser = async (req, res) => {
  // Thêm log tracer
  console.log('--- 🚀 YÊU CẦU ĐĂNG KÝ ĐÃ ĐẾN SERVER ---');
  console.log('Request body:', req.body);
  
  const { email, password, first_name, last_name, role } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (email, password, first/last name)' });
  }

  try {
    const pool = await connection();

    const check = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT TOP 1 * FROM Users WHERE Email = @email`);

    if (check.recordset.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);

    await pool
      .request()
      .input('User_id', sql.VarChar(26), crypto.randomUUID().slice(0, 26))
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar(16), saltUser)
      .input('First_Name', sql.NVarChar, first_name)
      .input('Last_name', sql.NVarChar, last_name)
      .input('Role', sql.NVarChar, role || 'user')
      .query(`
        INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability)
        VALUES (@User_id, @email, @password, @Salt, @First_Name, @Last_name, @Role, 'Normal');
      `);
    
    // Log khi thành công
    console.log(`✅ Đăng ký thành công cho: ${email}`);
    res.status(201).json({ message: 'Đăng ký thành công', user: { email, first_name } });

  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error);
    res.status(500).json({ error: 'Đăng ký thất bại' });
  }
};

/* ============================
    Đăng nhập
============================ */
const loginUser = async (req, res) => {
  // ✅ ===== LOG TRACER ĐÃ THÊM =====
  console.log('--- 🚀 YÊU CẦU ĐĂNG NHẬP ĐÃ ĐẾN SERVER ---');
  console.log('Request body:', req.body);
  // ===================================

  const { email, password } = req.body;

  try {
    const pool = await connection();

    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT TOP 1 * FROM Users WHERE Email = @email`);

    const user = result.recordset[0];
    if (!user) {
      // ✅ LOG TRACER ĐÃ THÊM
      console.log(`Lỗi 400: Email không tồn tại (${email})`);
      return res.status(400).json({ success: false, error: 'Email không tồn tại' });
    }

    if (user.isLocked) {
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    // ✅ LOG CHI TIẾT ĐỂ DEBUG
    console.log(`🔍 Debug login cho ${email}:`);
    console.log(`   - Salt có giá trị: ${user.Salt ? 'CÓ' : 'KHÔNG'}`);
    console.log(`   - Salt length: ${user.Salt ? user.Salt.length : 0}`);
    console.log(`   - Password hash có giá trị: ${user.Password ? 'CÓ' : 'KHÔNG'}`);
    console.log(`   - Password hash length: ${user.Password ? user.Password.length : 0}`);

    // Kiểm tra Salt có NULL không
    if (!user.Salt || user.Salt === null || user.Salt.trim() === '') {
      console.log(`⚠️  Salt bị NULL hoặc rỗng cho ${email}. Cần cập nhật mật khẩu.`);
      return res.status(400).json({ success: false, error: 'Tài khoản chưa được thiết lập mật khẩu đúng cách. Vui lòng liên hệ quản trị viên.' });
    }

    // Kiểm tra Password hash có NULL không
    if (!user.Password || user.Password === null || user.Password.trim() === '') {
      console.log(`⚠️  Password hash bị NULL hoặc rỗng cho ${email}. Cần cập nhật mật khẩu.`);
      return res.status(400).json({ success: false, error: 'Tài khoản chưa được thiết lập mật khẩu đúng cách. Vui lòng liên hệ quản trị viên.' });
    }

    const isMatch = await bcrypt.compare(password + user.Salt, user.Password);
    if (!isMatch) {
      // ✅ LOG TRACER ĐÃ THÊM
      console.log(`❌ Lỗi 400: Mật khẩu không đúng cho (${email})`);
      console.log(`   - Password nhập vào: ${password}`);
      console.log(`   - Salt trong DB: ${user.Salt}`);
      console.log(`   - Password + Salt: ${password + user.Salt}`);
      return res.status(400).json({ success: false, error: 'Mật khẩu không đúng' });
    }

    // ✅ Normalize role: trim và giữ nguyên giá trị (có thể là "handlereport" hoặc "handle report")
    const userRole = user.Role ? user.Role.trim() : null;
    
    // ✅ SỬA LỖI: Thêm user.Role vào payload của JWT
    const token = jwt.sign(
      { id: user.User_id, email: user.Email, role: userRole }, 
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    
    // ✅ LOG TRACER ĐÃ THÊM
    console.log(`✅ Đăng nhập thành công cho: ${email} (Role: ${userRole})`);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.User_id,
        email: user.Email,
        full_name: `${user.First_Name || ''} ${user.Last_name || ''}`.trim(),
        role: userRole // Gửi role về cho client (đã được normalize)
      },
    });
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
}; // <-- Dấu } này rất quan trọng

/* ============================
    Quên mật khẩu
============================ */
const forgotPassword = async (req, res) => {
  
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Vui lòng nhập email' });

  try {
    const pool = await connection();
    const userResult = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT TOP 1 * FROM Users WHERE Email = @email`);

    if (userResult.recordset.length === 0)
      return res.status(404).json({ error: 'Không tìm thấy tài khoản với email này' });

    const user = userResult.recordset[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000);

    // ⚠️ KHUYẾN CÁO: Lệnh CREATE TABLE này nên chạy một lần trong DB, không nên để ở đây
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='password_resets' AND xtype='U')
        CREATE TABLE password_resets (
          id INT IDENTITY(1,1) PRIMARY KEY, user_id VARCHAR(26), token NVARCHAR(255),
          expires_at DATETIME, created_at DATETIME DEFAULT GETDATE()
        )
    `);

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

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    await sendEmail(
      user.Email, 'Đặt lại mật khẩu StarSocial',
      `<p>Nhấn vào link để đặt lại mật khẩu: <a href="${resetLink}">Đặt lại mật khẩu</a></p>`
    );

    res.json({ message: 'Đã gửi liên kết đặt lại mật khẩu đến email của bạn!' });
  } catch (err) {
    console.error('❌ Lỗi forgotPassword:', err);
    res.status(500).json({ error: 'Lỗi server khi gửi link đặt lại mật khẩu' });
  }
};

/* ============================
    Đặt lại mật khẩu
============================ */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword)
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu mới' });

  try {
    const pool = await connection();
    const tokenResult = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query(`SELECT TOP 1 * FROM password_resets WHERE token = @token`);

    if (tokenResult.recordset.length === 0)
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã sử dụng' });

    const resetData = tokenResult.recordset[0];
    if (Date.now() > new Date(resetData.expires_at).getTime())
      return res.status(400).json({ error: 'Token đã hết hạn' });

    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword + saltUser, bcryptSalt);

    await pool
      .request()
      .input('hashed', sql.NVarChar, hashed)
      .input('Salt', sql.NVarChar, saltUser)
      .input('user_id', sql.VarChar(26), resetData.user_id)
      .query(`UPDATE Users SET Password = @hashed, Salt = @Salt WHERE User_id = @user_id`);

    await pool.request().input('token', sql.NVarChar, token)
      .query(`DELETE FROM password_resets WHERE token = @token`);

    res.json({ message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    console.error('❌ Lỗi resetPassword:', err);
    res.status(500).json({ error: 'Lỗi server khi đặt lại mật khẩu' });
  }
};

/* ============================
    Lấy Profile (Logic đã chuyển từ routes)
============================ */
const getUserProfile = async (req, res) => {
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

/* ============================
    Tìm User bằng Email (Logic đã chuyển từ routes)
============================ */
const findUserByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const pool = await connection();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT TOP 1 User_id AS id, username, email
        FROM Users WHERE email = @email
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ SỬA LỖI: Export tất cả các hàm bằng ES modules
export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  findUserByEmail,
};