// Script cập nhật mật khẩu cho một tài khoản cụ thể theo email
// Chạy: node scripts/updatePasswordByEmail.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updatePasswordByEmail() {
  try {
    console.log('🚀 Cập nhật mật khẩu cho tài khoản cụ thể\n');

    // Nhập email
    const email = await question('Nhập email cần cập nhật mật khẩu: ');
    if (!email || email.trim() === '') {
      console.log('❌ Email không được để trống');
      rl.close();
      process.exit(1);
    }

    // Nhập mật khẩu mới
    const password = await question('Nhập mật khẩu mới: ');
    if (!password || password.trim() === '') {
      console.log('❌ Mật khẩu không được để trống');
      rl.close();
      process.exit(1);
    }

    rl.close();

    const pool = await connection();

    // Tìm tài khoản
    const result = await pool.request()
      .input('email', sql.NVarChar, email.trim())
      .query('SELECT TOP 1 User_id, Email, Role, First_Name, Last_name, Salt, Password FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      console.log(`❌ Không tìm thấy tài khoản với email: ${email}`);
      process.exit(1);
    }

    const user = result.recordset[0];
    console.log(`\n📋 Tìm thấy tài khoản:`);
    console.log(`   Email: ${user.Email}`);
    console.log(`   Role: ${user.Role}`);
    console.log(`   Name: ${user.First_Name || ''} ${user.Last_name || ''}`);
    console.log(`   Salt hiện tại: ${user.Salt || 'NULL'}`);
    console.log(`   Password hash hiện tại: ${user.Password ? 'CÓ' : 'NULL'}\n`);

    // Tạo salt mới và hash password
    console.log('⏳ Đang hash mật khẩu mới...');
    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);

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

    console.log(`\n✅ Đã cập nhật mật khẩu thành công!`);
    console.log(`   Email: ${user.Email}`);
    console.log(`   Password mới: ${password}`);
    console.log(`   Salt mới: ${saltUser}`);
    console.log(`\n📝 Bây giờ bạn có thể đăng nhập với:`);
    console.log(`   Email: ${user.Email}`);
    console.log(`   Password: ${password}`);

    // Test login
    console.log(`\n🧪 Đang test đăng nhập...`);
    const testMatch = await bcrypt.compare(password + saltUser, hashedPassword);
    if (testMatch) {
      console.log(`✅ Test thành công! Mật khẩu đã được hash đúng cách.`);
    } else {
      console.log(`❌ Test thất bại! Có vấn đề với hash.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    rl.close();
    process.exit(1);
  }
}

updatePasswordByEmail();

