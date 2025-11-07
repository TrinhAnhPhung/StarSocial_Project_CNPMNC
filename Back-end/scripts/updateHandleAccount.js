// Script cập nhật mật khẩu cho tài khoản handle@gmail.com
// Chạy: node scripts/updateHandleAccount.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function updateHandleAccount() {
  try {
    const pool = await connection();
    console.log('🚀 Cập nhật mật khẩu cho tài khoản handle@gmail.com\n');

    const email = 'handle@gmail.com';
    const password = '123456'; // Mật khẩu bạn muốn đặt

    // Tìm tài khoản
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT TOP 1 User_id, Email, Role, First_Name, Last_name, Salt, Password FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      console.log(`❌ Không tìm thấy tài khoản với email: ${email}`);
      console.log(`💡 Đang tìm các tài khoản có email chứa "handle"...`);
      
      const similarResult = await pool.request()
        .query(`SELECT Email, Role FROM Users WHERE Email LIKE '%handle%'`);
      
      if (similarResult.recordset.length > 0) {
        console.log(`\n📋 Tìm thấy các tài khoản tương tự:`);
        similarResult.recordset.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.Email} (Role: ${user.Role})`);
        });
      }
      
      process.exit(1);
    }

    const user = result.recordset[0];
    console.log(`📋 Tìm thấy tài khoản:`);
    console.log(`   Email: ${user.Email}`);
    console.log(`   Role: ${user.Role}`);
    console.log(`   Name: ${user.First_Name || ''} ${user.Last_name || ''}`);
    console.log(`   Salt hiện tại: ${user.Salt || 'NULL'}`);
    console.log(`   Password hash hiện tại: ${user.Password ? 'CÓ (length: ' + user.Password.length + ')' : 'NULL'}\n`);

    // Tạo salt mới và hash password
    console.log('⏳ Đang hash mật khẩu mới...');
    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);

    console.log(`   Salt mới: ${saltUser}`);
    console.log(`   Password hash mới: ${hashedPassword.substring(0, 50)}...\n`);

    // Cập nhật mật khẩu
    await pool.request()
      .input('user_id', sql.VarChar(26), user.User_id)
      .input('password', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar(16), saltUser)
      .query(`
        UPDATE Users 
        SET Password = @password, Salt = @Salt 
        WHERE User_id = @user_id
      `);

    console.log(`✅ Đã cập nhật mật khẩu thành công!`);
    console.log(`\n📝 Thông tin đăng nhập:`);
    console.log(`   Email: ${user.Email}`);
    console.log(`   Password: ${password}`);

    // Test login
    console.log(`\n🧪 Đang test đăng nhập...`);
    const testMatch = await bcrypt.compare(password + saltUser, hashedPassword);
    if (testMatch) {
      console.log(`✅ Test thành công! Mật khẩu đã được hash đúng cách.`);
      console.log(`\n💡 Bây giờ bạn có thể đăng nhập với:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log(`❌ Test thất bại! Có vấn đề với hash.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

updateHandleAccount();

