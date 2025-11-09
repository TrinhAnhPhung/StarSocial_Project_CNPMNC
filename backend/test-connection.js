const sql = require('mssql');
require('dotenv').config();

// Cấu hình kết nối SQL Server (sử dụng cùng logic với database.js)
const dbServer = process.env.DB_SERVER || 'localhost';
const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(dbServer);
const isAzureSQL = dbServer.includes('.database.windows.net');

// Xử lý encryption cho SQL Server từ xa
let useEncrypt = process.env.DB_ENCRYPT === 'true';
if (!useEncrypt && isAzureSQL) {
  useEncrypt = true;
} else if (!useEncrypt && isIPAddress) {
  useEncrypt = false;
}

const config = {
  server: dbServer,
  database: process.env.DB_NAME || 'StarSocialDB',
  options: {
    encrypt: useEncrypt,
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
  }
};

// Sử dụng Windows Authentication nếu không có DB_USER và DB_PASSWORD
if (process.env.DB_USER && process.env.DB_PASSWORD) {
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
  console.log('🔐 Sử dụng SQL Server Authentication');
} else {
  config.options.trustedConnection = true;
  console.log('🔐 Sử dụng Windows Authentication');
}

async function testConnection() {
  try {
    console.log('\n📡 Đang kết nối đến SQL Server...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Server:', config.server);
    console.log('Database:', config.database);
    if (config.user) {
      console.log('User:', config.user);
    } else {
      console.log('Authentication: Windows Authentication');
    }
    console.log('Encrypt:', config.options.encrypt);
    console.log('Trust Certificate:', config.options.trustServerCertificate);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await sql.connect(config);
    console.log('✅ Kết nối thành công!\n');
    
    // Test query
    const result = await sql.query('SELECT @@VERSION AS Version, DB_NAME() AS CurrentDatabase');
    console.log('📊 Thông tin SQL Server:');
    console.log('Database hiện tại:', result.recordset[0].CurrentDatabase);
    console.log('Version:', result.recordset[0].Version.split('\n')[0]);
    
    // Kiểm tra database có tồn tại không
    const dbCheck = await sql.query(`
      SELECT name FROM sys.databases WHERE name = '${process.env.DB_NAME || 'StarSocialDB'}'
    `);
    
    if (dbCheck.recordset.length > 0) {
      console.log('\n✅ Database', process.env.DB_NAME || 'StarSocialDB', 'đã tồn tại');
    } else {
      console.log('\n⚠️  Database', process.env.DB_NAME || 'StarSocialDB', 'chưa tồn tại');
      console.log('💡 Chạy lệnh: CREATE DATABASE StarSocialDB;');
    }
    
    await sql.close();
    console.log('\n✅ Test kết nối hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi kết nối:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (error.code === 'ELOGIN') {
      console.log('💡 Gợi ý:');
      console.log('1. Kiểm tra mật khẩu SQL Server trong file .env (đảm bảo đúng và không có khoảng trắng)');
      console.log('2. Đảm bảo SQL Server Authentication đã được bật');
      console.log('3. Đảm bảo user "' + (config.user || 'sa') + '" đã được enabled và có quyền truy cập');
      if (config.server?.match(/\d+\.\d+\.\d+\.\d+/) || config.server?.includes('.database.windows.net')) {
        console.log('4. Kiểm tra firewall cho phép kết nối từ IP của bạn');
      }
      console.log('5. Xem hướng dẫn chi tiết trong file FIX_REMOTE_SQL.md');
    } else if (error.code === 'ESOCKET' && error.message?.includes('TLS ServerName')) {
      console.log('💡 Lỗi TLS với IP Address:');
      console.log('1. Giải pháp đơn giản: Set DB_ENCRYPT=false trong file .env');
      console.log('2. Giải pháp tốt nhất: Sử dụng hostname thay vì IP address');
      console.log('3. Xem hướng dẫn chi tiết trong file FIX_TLS_IP_ERROR.md');
    } else if (error.code === 'ETIMEOUT') {
      console.log('💡 Gợi ý:');
      console.log('1. Kiểm tra SQL Server đang chạy');
      console.log('2. Kiểm tra tên server trong file .env');
      console.log('3. Kiểm tra firewall');
    } else if (error.code === 'ESOCKET') {
      console.log('💡 Gợi ý:');
      console.log('1. Kiểm tra SQL Server đang chạy');
      console.log('2. Kiểm tra SQL Server Browser đang chạy');
      console.log('3. Kiểm tra port 1433 không bị chặn');
    }
    
    process.exit(1);
  }
}

testConnection();

