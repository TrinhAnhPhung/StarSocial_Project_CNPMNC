// Script tạo tài khoản Admin và HandleReport
// Chạy: node scripts/createAdminAccounts.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('../src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const accounts = [
  {
    email: 'admin@starsocial.com',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'StarSocial',
    role: 'admin'
  },
  {
    email: 'handlereport@starsocial.com',
    password: 'handlereport123',
    first_name: 'Handle',
    last_name: 'Report',
    role: 'handlereport'
  }
];

async function createAccounts() {
  try {
    const pool = await connection();
    console.log('🚀 Bắt đầu tạo tài khoản Admin và HandleReport...\n');

    for (const account of accounts) {
      try {
        // Kiểm tra email đã tồn tại chưa
        const check = await pool.request()
          .input('email', sql.NVarChar, account.email)
          .query('SELECT TOP 1 * FROM Users WHERE Email = @email');

        if (check.recordset.length > 0) {
          console.log(`⚠️  Tài khoản đã tồn tại: ${account.email} (Role: ${account.role})`);
          continue;
        }

        // Tạo salt và hash password
        const saltUser = crypto.randomBytes(8).toString('hex');
        const bcryptSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(account.password + saltUser, bcryptSalt);

        // Tạo User_id
        const userId = crypto.randomUUID().slice(0, 26);

        // Insert vào database
        await pool.request()
          .input('User_id', sql.VarChar(26), userId)
          .input('email', sql.NVarChar, account.email)
          .input('password', sql.NVarChar, hashedPassword)
          .input('Salt', sql.NVarChar(16), saltUser)
          .input('First_Name', sql.NVarChar, account.first_name)
          .input('Last_name', sql.NVarChar, account.last_name)
          .input('Role', sql.NVarChar, account.role)
          .query(`
            INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability)
            VALUES (@User_id, @email, @password, @Salt, @First_Name, @Last_name, @Role, 'Normal');
          `);

        console.log(`✅ Đã tạo tài khoản ${account.role}: ${account.email}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Name: ${account.first_name} ${account.last_name}\n`);

      } catch (error) {
        console.error(`❌ Lỗi khi tạo tài khoản ${account.email}:`, error.message);
      }
    }

    console.log('========================================');
    console.log('THÔNG TIN ĐĂNG NHẬP:');
    console.log('========================================');
    console.log('ADMIN:');
    console.log('  Email: admin@starsocial.com');
    console.log('  Password: admin123');
    console.log('  URL: http://localhost:5173/admin');
    console.log('');
    console.log('HANDLEREPORT:');
    console.log('  Email: handlereport@starsocial.com');
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

createAccounts();

