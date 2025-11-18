import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Lấy danh sách tất cả người dùng (chỉ admin)
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const pool = await connection();

    // Kiểm tra quyền admin
    if (req.user?.role?.toLowerCase().trim() !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
    }

    // Query với LEFT JOIN để tính stats hiệu quả hơn
    const result = await pool.request().query(`
      SELECT 
        u.User_id AS id,
        u.Email,
        u.First_Name,
        u.Last_name,
        ISNULL(u.First_Name, '') + ' ' + ISNULL(u.Last_name, '') AS full_name,
        ISNULL(u.Role, 'user') AS Role,
        CASE WHEN u.isLocked = 1 THEN 'Banned' ELSE 'Active' END AS status,
        u.isLocked,
        u.Profile_Picture,
        u.Description,
        u.Reliability,
        u.Created_at, -- FIX 1: THÊM CỘT CREATED_AT VÀO QUERY
        ISNULL(p.posts_count, 0) AS posts_count,
        ISNULL(c.comments_count, 0) AS comments_count
      FROM Users u
      LEFT JOIN (
        SELECT User_id, COUNT(*) AS posts_count 
        FROM Post 
        GROUP BY User_id
      ) p ON u.User_id = p.User_id
      LEFT JOIN (
        SELECT User_id, COUNT(*) AS comments_count 
        FROM Comment 
        GROUP BY User_id
      ) c ON u.User_id = c.User_id
      ORDER BY u.User_id DESC
    `);

    const users = result.recordset.map(user => {
      // Xử lý isLocked (có thể là BIT, INT, hoặc BOOLEAN)
      const isLocked = user.isLocked === 1 || user.isLocked === true || user.isLocked === 'true';

      return {
        id: user.id,
        email: user.Email,
        full_name: (user.full_name || `${user.First_Name || ''} ${user.Last_name || ''}`).trim() || 'Unnamed User',
        first_name: user.First_Name || '',
        last_name: user.Last_name || '',
        role: user.Role || 'user',
        status: user.status || (isLocked ? 'Banned' : 'Active'),
        isLocked: isLocked,
        // FIX 1: SỬ DỤNG CREATED_AT CHO joined_date
        joined_date: user.Created_at, 
        profile_picture: user.Profile_Picture,
        description: user.Description,
        reliability: user.Reliability,
        posts_count: parseInt(user.posts_count) || 0,
        comments_count: parseInt(user.comments_count) || 0
      };
    });

    console.log(`✅ Admin đã lấy ${users.length} người dùng`);
    res.json(users);

  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách người dùng:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Lỗi server khi lấy danh sách người dùng', 
      detail: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ----------------------------------------------------------------------

/**
 * Lấy thông tin một người dùng cụ thể
 * GET /api/admin/users/:userId
 */
export const getUserById = async (req, res) => {
  try {
    const pool = await connection();

    if (req.user?.role?.toLowerCase().trim() !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
    }

    const { userId } = req.params;

    const result = await pool.request()
      .input('userId', sql.VarChar(26), userId)
      .query(`
        SELECT 
          User_id AS id,
          Email,
          First_Name,
          Last_name,
          First_Name + ' ' + Last_name AS full_name,
          Role,
          CASE WHEN isLocked = 1 THEN 'Banned' ELSE 'Active' END AS status,
          isLocked,
          -- FIX 2: Bỏ CONVERT(varchar, Created_at, 120) và trả về Created_at nguyên bản để client xử lý tốt hơn
          Created_at, 
          Profile_Picture,
          Description,
          Reliability,
          Quantities_Posts AS posts_count,
          Quantity_Comments AS comments_count
        FROM Users
        WHERE User_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const user = result.recordset[0];
    res.json({
      id: user.id,
      email: user.Email,
      full_name: user.full_name || `${user.First_Name || ''} ${user.Last_name || ''}`.trim(),
      first_name: user.First_Name,
      last_name: user.Last_name,
      role: user.Role,
      status: user.status,
      isLocked: user.isLocked === 1 || user.isLocked === true,
      // FIX 2: Đảm bảo trường Joined Date là Created_at
      joined_date: user.Created_at,
      profile_picture: user.Profile_Picture,
      description: user.Description,
      reliability: user.Reliability,
      posts_count: user.posts_count || 0,
      comments_count: user.comments_count || 0
    });

  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ error: 'Lỗi server', detail: error.message });
  }
};

// ----------------------------------------------------------------------

/**
 * Tạo người dùng mới (chỉ admin)
 * POST /api/admin/users
 */
export const createUser = async (req, res) => {
  try {
    const pool = await connection();

    if (req.user?.role?.toLowerCase().trim() !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền tạo người dùng' });
    }

    const { email, password, first_name, last_name, role } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (email, password, first_name, last_name)' });
    }

    // Kiểm tra email đã tồn tại chưa
    const check = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT TOP 1 * FROM Users WHERE Email = @email');

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
    await pool.request()
      .input('User_id', sql.VarChar(26), userId)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar(16), saltUser)
      .input('First_Name', sql.NVarChar, first_name)
      .input('Last_name', sql.NVarChar, last_name)
      .input('Role', sql.NVarChar, role || 'user')
      .query(`
        INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability, isLocked)
        VALUES (@User_id, @email, @password, @Salt, @First_Name, @Last_name, @Role, 'Normal', 0);
      `);

    console.log(`✅ Admin đã tạo người dùng mới: ${email}`);
    res.status(201).json({
      message: 'Đã tạo người dùng thành công',
      user: {
        id: userId,
        email,
        first_name,
        last_name,
        role: role || 'user'
      }
    });

  } catch (error) {
    console.error('❌ Lỗi khi tạo người dùng:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo người dùng', detail: error.message });
  }
};

// ----------------------------------------------------------------------

/**
 * Cập nhật thông tin người dùng (chỉ admin)
 * PUT /api/admin/users/:userId
 */
export const updateUser = async (req, res) => {
  try {
    const pool = await connection();

    if (req.user?.role?.toLowerCase().trim() !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền cập nhật người dùng' });
    }

    const { userId } = req.params;
    const { email, first_name, last_name, role, password } = req.body;

    // Kiểm tra user có tồn tại không
    const checkUser = await pool.request()
      .input('userId', sql.VarChar(26), userId)
      .query('SELECT TOP 1 * FROM Users WHERE User_id = @userId');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const user = checkUser.recordset[0];

    // Khai báo biến hash và salt để sử dụng lại (FIX 3)
    let hashedPassword = null;
    let saltUser = null;

    // Cập nhật thông tin cơ bản
    let updateQuery = `UPDATE Users SET `;
    const updates = [];

    if (first_name !== undefined) {
      updates.push(`First_Name = @first_name`);
    }
    if (last_name !== undefined) {
      updates.push(`Last_name = @last_name`);
    }
    if (role !== undefined) {
      updates.push(`Role = @role`);
    }
    if (email !== undefined && email !== user.Email) {
      // Kiểm tra email mới có trùng không
      const checkEmail = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('userId', sql.VarChar(26), userId) // Truyền userId vào check email
        .query('SELECT TOP 1 * FROM Users WHERE Email = @email AND User_id != @userId');

      if (checkEmail.recordset.length > 0) {
        return res.status(400).json({ error: 'Email đã được sử dụng bởi người dùng khác' });
      }
      updates.push(`Email = @email`);
    }

    // FIX 3: Cập nhật mật khẩu nếu có (Tính toán HASH và SALT chỉ 1 lần)
    if (password) {
      saltUser = crypto.randomBytes(8).toString('hex');
      const bcryptSalt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);
      updates.push(`Password = @hashedPassword`);
      updates.push(`Salt = @saltUser`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Không có thông tin nào để cập nhật' });
    }

    updateQuery += updates.join(', ') + ` WHERE User_id = @userId`;

    const request = pool.request()
      .input('userId', sql.VarChar(26), userId);

    if (first_name !== undefined) request.input('first_name', sql.NVarChar, first_name);
    if (last_name !== undefined) request.input('last_name', sql.NVarChar, last_name);
    if (role !== undefined) request.input('role', sql.NVarChar, role);
    if (email !== undefined) request.input('email', sql.NVarChar, email);
    
    // FIX 3: Chỉ truyền input hash/salt nếu chúng đã được tính toán
    if (password) {
      request.input('hashedPassword', sql.NVarChar, hashedPassword);
      request.input('saltUser', sql.NVarChar(16), saltUser);
    }

    await request.query(updateQuery);

    console.log(`✅ Admin đã cập nhật người dùng: ${userId}`);
    res.json({ message: 'Đã cập nhật người dùng thành công' });

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật người dùng:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật người dùng', detail: error.message });
  }
};

// ----------------------------------------------------------------------

/**
 * Khóa/Mở khóa người dùng (chỉ admin)
 * PATCH /api/admin/users/:userId/lock
 */
export const toggleLockUser = async (req, res) => {
  try {
    const pool = await connection();

    if (req.user?.role?.toLowerCase().trim() !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền khóa/mở khóa người dùng' });
    }

    const { userId } = req.params;
    // Đảm bảo isLocked là boolean/integer
    const isLocked = req.body.isLocked; 

    // Không cho phép khóa chính mình
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Bạn không thể khóa chính mình' });
    }

    // Kiểm tra user có tồn tại không
    const checkUser = await pool.request()
      .input('userId', sql.VarChar(26), userId)
      .query('SELECT TOP 1 Email, Role FROM Users WHERE User_id = @userId');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    const user = checkUser.recordset[0];
    
    // Thêm kiểm tra không cho khóa admin khác (tùy chọn bảo mật)
    const userRole = user.Role?.toLowerCase().trim();
    if (userRole === 'admin' && user.User_id !== req.user.id) {
         // Bạn có thể cho phép hoặc không cho phép khóa admin khác. 
         // Nếu không cho phép:
         // return res.status(400).json({ error: 'Không thể khóa tài khoản admin khác' });
    }


    const lockValue = isLocked === true || isLocked === 1 ? 1 : 0;

    // Cập nhật trạng thái khóa
    await pool.request()
      .input('userId', sql.VarChar(26), userId)
      .input('isLocked', sql.Bit, lockValue)
      .query('UPDATE Users SET isLocked = @isLocked WHERE User_id = @userId');

    console.log(`✅ Admin đã ${lockValue === 1 ? 'khóa' : 'mở khóa'} người dùng: ${user.Email}`);
    res.json({
      message: `Đã ${lockValue === 1 ? 'khóa' : 'mở khóa'} người dùng thành công`,
      isLocked: lockValue === 1
    });

  } catch (error) {
    console.error('❌ Lỗi khi khóa/mở khóa người dùng:', error);
    res.status(500).json({ error: 'Lỗi server', detail: error.message });
  }
};

// ----------------------------------------------------------------------

/**
 * Xóa người dùng (chỉ admin)
 * DELETE /api/admin/users/:userId
 */
export const deleteUser = async (req, res) => {
  try {
    const pool = await connection();

    if (req.user?.role?.toLowerCase().trim() !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền xóa người dùng' });
    }

    const { userId } = req.params;

    // Không cho phép xóa chính mình
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Bạn không thể xóa chính mình' });
    }

    // Kiểm tra user có tồn tại không
    const checkUser = await pool.request()
      .input('userId', sql.VarChar(26), userId)
      .query('SELECT TOP 1 Email, Role FROM Users WHERE User_id = @userId');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const user = checkUser.recordset[0];

    // Không cho phép xóa admin khác
    const userRole = user.Role?.toLowerCase().trim();
    if (userRole === 'admin') {
      return res.status(400).json({ error: 'Không thể xóa tài khoản admin' });
    }

    // Xóa người dùng (CASCADE sẽ xóa các dữ liệu liên quan)
    await pool.request()
      .input('userId', sql.VarChar(26), userId)
      .query('DELETE FROM Users WHERE User_id = @userId');

    console.log(`✅ Admin đã xóa người dùng: ${user.Email}`);
    res.json({ message: 'Đã xóa người dùng thành công' });

  } catch (error) {
    console.error('❌ Lỗi khi xóa người dùng:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa người dùng', detail: error.message });
  }
};