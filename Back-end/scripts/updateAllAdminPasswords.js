// Script cập nhật mật khẩu cho TẤT CẢ tài khoản Admin và HandleReport trong database
// Chạy: node scripts/updateAllAdminPasswords.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function updateAllAdminPasswords() {
  try {
    const pool = await connection();
    console.log('🚀 Bắt đầu cập nhật mật khẩu cho TẤT CẢ tài khoản Admin và HandleReport...\n');

    // 1. Cập nhật tất cả tài khoản có role = 'admin'
    try {
      const adminUsers = await pool.request()
        .input('role', sql.NVarChar, 'admin')
        .query('SELECT User_id, Email, Role, First_Name, Last_name FROM Users WHERE Role = @role');

      if (adminUsers.recordset.length > 0) {
        console.log(`📋 Tìm thấy ${adminUsers.recordset.length} tài khoản Admin:\n`);
        
        for (const admin of adminUsers.recordset) {
          // Tạo salt mới và hash password
          const saltUser = crypto.randomBytes(8).toString('hex');
          const bcryptSalt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('admin123' + saltUser, bcryptSalt);

          // Cập nhật mật khẩu
          await pool.request()
            .input('user_id', sql.VarChar(26), admin.User_id)
            .input('password', sql.NVarChar, hashedPassword)
            .input('Salt', sql.NVarChar(16), saltUser)
            .query(`
              UPDATE Users 
              SET Password = @password, Salt = @Salt 
              WHERE User_id = @user_id
            `);

          console.log(`✅ Đã cập nhật mật khẩu cho Admin:`);
          console.log(`   Email: ${admin.Email}`);
          console.log(`   Name: ${admin.First_Name || ''} ${admin.Last_name || ''}`);
          console.log(`   Password: admin123\n`);
        }
      } else {
        console.log('⚠️  Không tìm thấy tài khoản Admin nào\n');
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật Admin:', error.message);
    }

    // 2. Cập nhật tất cả tài khoản có role = 'handlereport' hoặc 'handle report'
    try {
      const reportUsers = await pool.request()
        .input('role1', sql.NVarChar, 'handlereport')
        .input('role2', sql.NVarChar, 'handle report')
        .query(`SELECT User_id, Email, Role, First_Name, Last_name FROM Users WHERE Role = @role1 OR Role = @role2`);

      if (reportUsers.recordset.length > 0) {
        console.log(`📋 Tìm thấy ${reportUsers.recordset.length} tài khoản HandleReport:\n`);
        
        for (const report of reportUsers.recordset) {
          // Tạo salt mới và hash password
          const saltUser = crypto.randomBytes(8).toString('hex');
          const bcryptSalt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('handlereport123' + saltUser, bcryptSalt);

          // Cập nhật mật khẩu
          await pool.request()
            .input('user_id', sql.VarChar(26), report.User_id)
            .input('password', sql.NVarChar, hashedPassword)
            .input('Salt', sql.NVarChar(16), saltUser)
            .query(`
              UPDATE Users 
              SET Password = @password, Salt = @Salt 
              WHERE User_id = @user_id
            `);

          console.log(`✅ Đã cập nhật mật khẩu cho HandleReport:`);
          console.log(`   Email: ${report.Email}`);
          console.log(`   Name: ${report.First_Name || ''} ${report.Last_name || ''}`);
          console.log(`   Password: handlereport123\n`);
        }
      } else {
        console.log('⚠️  Không tìm thấy tài khoản HandleReport nào\n');
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật HandleReport:', error.message);
    }

    // 3. Hiển thị danh sách tất cả tài khoản admin và handlereport
    console.log('========================================');
    console.log('TỔNG KẾT:');
    console.log('========================================');
    
    try {
      const allAdmins = await pool.request()
        .input('role', sql.NVarChar, 'admin')
        .query('SELECT Email, Role FROM Users WHERE Role = @role');
      
      if (allAdmins.recordset.length > 0) {
        console.log('\n📋 TÀI KHOẢN ADMIN:');
        allAdmins.recordset.forEach((admin, index) => {
          console.log(`   ${index + 1}. Email: ${admin.Email}`);
          console.log(`      Password: admin123`);
        });
      }

      const allReports = await pool.request()
        .input('role1', sql.NVarChar, 'handlereport')
        .input('role2', sql.NVarChar, 'handle report')
        .query(`SELECT Email, Role FROM Users WHERE Role = @role1 OR Role = @role2`);
      
      if (allReports.recordset.length > 0) {
        console.log('\n📋 TÀI KHOẢN HANDLEREPORT:');
        allReports.recordset.forEach((report, index) => {
          console.log(`   ${index + 1}. Email: ${report.Email}`);
          console.log(`      Password: handlereport123`);
        });
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách:', error.message);
    }

    console.log('\n========================================');
    console.log('THÔNG TIN ĐĂNG NHẬP:');
    console.log('========================================');
    console.log('ADMIN:');
    console.log('  Sử dụng email của bất kỳ tài khoản Admin nào ở trên');
    console.log('  Password: admin123');
    console.log('  URL: http://localhost:5173/admin');
    console.log('');
    console.log('HANDLEREPORT:');
    console.log('  Sử dụng email của bất kỳ tài khoản HandleReport nào ở trên');
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

updateAllAdminPasswords();

