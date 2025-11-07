// Script cập nhật mật khẩu cho tài khoản Admin và HandleReport đã có
// Chạy: node scripts/updateAdminPasswords.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const accounts = [
  {
    email: 'admin@gmail.com', // Email từ database
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'admin@starsocial.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'handlereport@starsocial.com',
    password: 'handlereport123',
    role: 'handlereport'
  }
];

async function updatePasswords() {
  try {
    const pool = await connection();
    console.log('🚀 Bắt đầu cập nhật mật khẩu cho tài khoản Admin và HandleReport...\n');

    for (const account of accounts) {
      try {
        // Tìm tài khoản theo email hoặc role
        let query = `SELECT TOP 1 * FROM Users WHERE Email = @email OR (Role = @role AND Email LIKE '%admin%')`;
        const result = await pool.request()
          .input('email', sql.NVarChar, account.email)
          .input('role', sql.NVarChar, account.role)
          .query(query);

        if (result.recordset.length === 0) {
          console.log(`⚠️  Không tìm thấy tài khoản: ${account.email} (Role: ${account.role})`);
          continue;
        }

        const user = result.recordset[0];
        console.log(`📝 Tìm thấy tài khoản: ${user.Email} (Role: ${user.Role})`);

        // Tạo salt mới và hash password
        const saltUser = crypto.randomBytes(8).toString('hex');
        const bcryptSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(account.password + saltUser, bcryptSalt);

        // Cập nhật mật khẩu và salt
        await pool.request()
          .input('email', sql.NVarChar, user.Email)
          .input('password', sql.NVarChar, hashedPassword)
          .input('Salt', sql.NVarChar(16), saltUser)
          .query(`
            UPDATE Users 
            SET Password = @password, Salt = @Salt 
            WHERE Email = @email
          `);

        console.log(`✅ Đã cập nhật mật khẩu cho: ${user.Email}`);
        console.log(`   Email: ${user.Email}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Role: ${user.Role}\n`);

      } catch (error) {
        console.error(`❌ Lỗi khi cập nhật tài khoản ${account.email}:`, error.message);
      }
    }

    // Cập nhật tất cả tài khoản có role admin
    try {
      const adminUsers = await pool.request()
        .input('role', sql.NVarChar, 'admin')
        .query('SELECT Email, Role FROM Users WHERE Role = @role');

      if (adminUsers.recordset.length > 0) {
        console.log('\n📋 Các tài khoản Admin trong database:');
        for (const admin of adminUsers.recordset) {
          console.log(`   - ${admin.Email} (Role: ${admin.Role})`);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách admin:', error.message);
    }

    // Cập nhật tất cả tài khoản có role handlereport
    try {
      const reportUsers = await pool.request()
        .input('role1', sql.NVarChar, 'handlereport')
        .input('role2', sql.NVarChar, 'handle report')
        .query(`SELECT Email, Role FROM Users WHERE Role = @role1 OR Role = @role2`);

      if (reportUsers.recordset.length > 0) {
        console.log('\n📋 Các tài khoản HandleReport trong database:');
        for (const report of reportUsers.recordset) {
          console.log(`   - ${report.Email} (Role: ${report.Role})`);
          
          // Cập nhật mật khẩu cho tài khoản handlereport
          const saltUser = crypto.randomBytes(8).toString('hex');
          const bcryptSalt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('handlereport123' + saltUser, bcryptSalt);

          await pool.request()
            .input('email', sql.NVarChar, report.Email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('Salt', sql.NVarChar(16), saltUser)
            .query(`
              UPDATE Users 
              SET Password = @password, Salt = @Salt 
              WHERE Email = @email
            `);

          console.log(`   ✅ Đã cập nhật mật khẩu: handlereport123`);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách handlereport:', error.message);
    }

    console.log('\n========================================');
    console.log('THÔNG TIN ĐĂNG NHẬP:');
    console.log('========================================');
    console.log('ADMIN:');
    console.log('  Email: admin@gmail.com (hoặc email admin trong database)');
    console.log('  Password: admin123');
    console.log('  URL: http://localhost:5173/admin');
    console.log('');
    console.log('HANDLEREPORT:');
    console.log('  Email: (email của tài khoản có role handlereport)');
    console.log('  Password: handlereport123');
    console.log('  URL: http://localhost:5173/processor');
    console.log('========================================');
    console.log('⚠️  LƯU Ý: Vui lòng đổi mật khẩu sau khi đăng nhập!');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error);
    process.exit(1);
  }
}

updatePasswords();

