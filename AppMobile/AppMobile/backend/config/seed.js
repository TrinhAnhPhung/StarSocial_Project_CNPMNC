const bcrypt = require('bcrypt');
const { getConnection, sql } = require('./database');
require('dotenv').config();

// Tạo admin user từ file .env
const createAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFullName = process.env.ADMIN_FULL_NAME || 'Administrator';

    // Nếu không có cấu hình admin trong .env, bỏ qua
    if (!adminEmail || !adminPassword) {
      console.log('Admin user not configured in .env file. Skipping admin user creation.');
      return;
    }

    const pool = await getConnection();
    const request = pool.request();

    // Kiểm tra xem admin user đã tồn tại chưa
    request.input('email', sql.NVarChar, adminEmail);
    const checkResult = await request.query(
      'SELECT Id FROM Users WHERE Email = @email'
    );

    if (checkResult.recordset.length > 0) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Tạo admin user với role='admin'
    const insertRequest = pool.request();
    insertRequest.input('email', sql.NVarChar, adminEmail);
    insertRequest.input('password', sql.NVarChar, hashedPassword);
    insertRequest.input('fullName', sql.NVarChar, adminFullName);
    insertRequest.input('role', sql.NVarChar, 'admin');

    await insertRequest.query(
      `INSERT INTO Users (Email, Password, FullName, Role) 
       VALUES (@email, @password, @fullName, @role)`
    );

    console.log(`✅ Admin user created successfully: ${adminEmail}`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👤 Full Name: ${adminFullName}`);
    console.log(`🔑 Role: admin`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    // Không throw error để không block server startup
  }
};

module.exports = {
  createAdminUser
};

