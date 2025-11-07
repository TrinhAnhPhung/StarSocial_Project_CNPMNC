import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Tạo tài khoản Admin hoặc HandleReport
 * POST /api/auth/create-admin
 * Body: { email, password, first_name, last_name, role }
 * Header: X-Admin-Secret (secret key để bảo vệ endpoint này)
 */
const createAdminAccount = async (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;
  const adminSecret = req.headers['x-admin-secret'] || req.body.secret;

  // Secret key để bảo vệ endpoint (nên đặt trong .env)
  const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin_secret_key_2024';

  // Kiểm tra secret key
  if (!adminSecret || adminSecret !== SECRET_KEY) {
    return res.status(403).json({ error: 'Không có quyền tạo tài khoản admin/handlereport' });
  }

  // Validate input
  if (!email || !password || !first_name || !last_name || !role) {
    return res.status(400).json({ 
      error: 'Thiếu thông tin bắt buộc (email, password, first_name, last_name, role)' 
    });
  }

  // Chỉ cho phép tạo tài khoản với role admin hoặc handlereport
  if (role !== 'admin' && role !== 'handlereport') {
    return res.status(400).json({ 
      error: 'Role phải là "admin" hoặc "handlereport"' 
    });
  }

  try {
    const pool = await connection();

    // Kiểm tra email đã tồn tại chưa
    const check = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT TOP 1 * FROM Users WHERE Email = @email`);

    if (check.recordset.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    // Tạo salt và hash password
    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);

    // Tạo User_id
    const userId = crypto.randomUUID().slice(0, 26);

    // Insert vào database
    await pool
      .request()
      .input('User_id', sql.VarChar(26), userId)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar(16), saltUser)
      .input('First_Name', sql.NVarChar, first_name)
      .input('Last_name', sql.NVarChar, last_name)
      .input('Role', sql.NVarChar, role)
      .query(`
        INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability)
        VALUES (@User_id, @email, @password, @Salt, @First_Name, @Last_name, @Role, 'Normal');
      `);

    console.log(`✅ Đã tạo tài khoản ${role} thành công cho: ${email}`);
    res.status(201).json({ 
      message: `Tài khoản ${role} đã được tạo thành công`,
      user: { 
        email, 
        first_name, 
        last_name, 
        role 
      } 
    });

  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản admin/handlereport:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo tài khoản', detail: error.message });
  }
};

/**
 * Cập nhật mật khẩu cho tài khoản Admin hoặc HandleReport
 * POST /api/auth/update-admin-password
 * Body: { email, password, role, secret }
 * Header: X-Admin-Secret (secret key để bảo vệ endpoint này)
 */
const updateAdminPassword = async (req, res) => {
  const { email, password, role, secret } = req.body;
  const adminSecret = req.headers['x-admin-secret'] || secret;

  // Secret key để bảo vệ endpoint
  const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin_secret_key_2024';

  // Kiểm tra secret key
  if (!adminSecret || adminSecret !== SECRET_KEY) {
    return res.status(403).json({ error: 'Không có quyền cập nhật mật khẩu admin/handlereport' });
  }

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Thiếu thông tin bắt buộc (email, password)' 
    });
  }

  try {
    const pool = await connection();

    // Tìm tài khoản theo email hoặc role
    let query = `SELECT TOP 1 * FROM Users WHERE Email = @email`;
    if (role) {
      query += ` OR (Role = @role AND Email = @email)`;
    }

    const request = pool.request()
      .input('email', sql.NVarChar, email);
    
    if (role) {
      request.input('role', sql.NVarChar, role);
    }

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    }

    const user = result.recordset[0];

    // Tạo salt mới và hash password
    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);

    // Cập nhật mật khẩu
    await pool
      .request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar(16), saltUser)
      .query(`
        UPDATE Users 
        SET Password = @password, Salt = @Salt 
        WHERE Email = @email
      `);

    console.log(`✅ Đã cập nhật mật khẩu cho: ${email} (Role: ${user.Role})`);
    res.status(200).json({ 
      message: 'Đã cập nhật mật khẩu thành công',
      user: { 
        email: user.Email,
        role: user.Role
      } 
    });

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật mật khẩu:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật mật khẩu', detail: error.message });
  }
};

/**
 * Cập nhật mật khẩu cho TẤT CẢ tài khoản Admin hoặc HandleReport
 * POST /api/auth/update-all-admin-passwords
 * Body: { role, password, secret }
 * Header: X-Admin-Secret (secret key để bảo vệ endpoint này)
 */
const updateAllAdminPasswords = async (req, res) => {
  const { role, password, secret } = req.body;
  const adminSecret = req.headers['x-admin-secret'] || secret;

  // Secret key để bảo vệ endpoint
  const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin_secret_key_2024';

  // Kiểm tra secret key
  if (!adminSecret || adminSecret !== SECRET_KEY) {
    return res.status(403).json({ error: 'Không có quyền cập nhật mật khẩu' });
  }

  // Validate input
  if (!role || !password) {
    return res.status(400).json({ 
      error: 'Thiếu thông tin bắt buộc (role, password)' 
    });
  }

  // Chỉ cho phép cập nhật role admin hoặc handlereport
  if (role !== 'admin' && role !== 'handlereport') {
    return res.status(400).json({ 
      error: 'Role phải là "admin" hoặc "handlereport"' 
    });
  }

  try {
    const pool = await connection();

    // Tìm tất cả tài khoản có role tương ứng (bao gồm cả "handle report")
    const query = role === 'admin' 
      ? `SELECT User_id, Email, Role FROM Users WHERE Role = @role`
      : `SELECT User_id, Email, Role FROM Users WHERE Role = @role OR Role = @role2`;
    
    const request = pool.request()
      .input('role', sql.NVarChar, role);
    
    if (role === 'handlereport') {
      request.input('role2', sql.NVarChar, 'handle report');
    }

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: `Không tìm thấy tài khoản nào có role: ${role}` });
    }

    // Tạo salt và hash password (dùng chung cho tất cả)
    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);

    // Cập nhật mật khẩu cho tất cả tài khoản
    const updatedAccounts = [];
    for (const user of result.recordset) {
      // Tạo salt riêng cho mỗi user (bảo mật hơn)
      const userSalt = crypto.randomBytes(8).toString('hex');
      const userHashedPassword = await bcrypt.hash(password + userSalt, bcryptSalt);

      await pool
        .request()
        .input('user_id', sql.VarChar(26), user.User_id)
        .input('password', sql.NVarChar, userHashedPassword)
        .input('Salt', sql.NVarChar(16), userSalt)
        .query(`
          UPDATE Users 
          SET Password = @password, Salt = @Salt 
          WHERE User_id = @user_id
        `);

      updatedAccounts.push({
        email: user.Email,
        role: user.Role
      });
    }

    console.log(`✅ Đã cập nhật mật khẩu cho ${updatedAccounts.length} tài khoản ${role}`);
    res.status(200).json({ 
      message: `Đã cập nhật mật khẩu thành công cho ${updatedAccounts.length} tài khoản`,
      count: updatedAccounts.length,
      accounts: updatedAccounts
    });

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật mật khẩu:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật mật khẩu', detail: error.message });
  }
};

export { 
  createAdminAccount, 
  updateAdminPassword, 
  updateAllAdminPasswords 
};
