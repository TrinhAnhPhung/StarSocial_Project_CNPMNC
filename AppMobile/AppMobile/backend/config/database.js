const sql = require('mssql');
require('dotenv').config();

// Cấu hình kết nối SQL Server
const dbServer = process.env.DB_SERVER || 'localhost';
const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(dbServer);
const isAzureSQL = dbServer.includes('.database.windows.net');

// Xử lý encryption cho SQL Server từ xa
// Lưu ý: Khi dùng IP address với TLS, có thể gặp lỗi "Setting the TLS ServerName to an IP address is not permitted"
// Giải pháp: Nếu là IP address, thử tắt encryption hoặc sử dụng hostname
let useEncrypt = process.env.DB_ENCRYPT === 'true';
if (!useEncrypt && isAzureSQL) {
  // Azure SQL luôn yêu cầu encryption
  useEncrypt = true;
} else if (!useEncrypt && isIPAddress) {
  // Đối với IP address, mặc định không encrypt để tránh lỗi TLS
  // Nếu SQL Server yêu cầu encryption, cần sử dụng hostname thay vì IP
  useEncrypt = false;
  console.log('⚠️  Warning: Connecting to SQL Server by IP address without encryption.');
  console.log('   For secure connection, use hostname instead of IP address.');
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
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Nếu là IP address và yêu cầu encryption, cần xử lý đặc biệt
if (isIPAddress && useEncrypt && process.env.DB_FORCE_ENCRYPT_IP !== 'true') {
  console.log('⚠️  Warning: TLS with IP address may cause issues.');
  console.log('   Consider:');
  console.log('   1. Use hostname instead of IP address');
  console.log('   2. Set DB_ENCRYPT=false in .env (less secure)');
  console.log('   3. Set DB_FORCE_ENCRYPT_IP=true to force encryption (may fail)');
}

// Sử dụng Windows Authentication nếu không có DB_USER và DB_PASSWORD
// Ngược lại sử dụng SQL Server Authentication
if (process.env.DB_USER && process.env.DB_PASSWORD) {
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
} else {
  // Windows Authentication (chỉ dùng cho SQL Server local)
  config.options.trustedConnection = true;
}

let pool = null;

const getConnection = async () => {
  try {
    if (pool) {
      return pool;
    }
    pool = await sql.connect(config);
    console.log('Connected to SQL Server');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const pool = await getConnection();
    const request = pool.request();

    // Create Users table if it doesn't exist
    const createUsersTable = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Email NVARCHAR(255) UNIQUE NOT NULL,
        Password NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(255),
        Role NVARCHAR(50) DEFAULT 'user',
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      )
    `;

    await request.query(createUsersTable);
    console.log('Database tables initialized successfully');
    
    // Add Role column if table exists but column doesn't
    try {
      const checkColumnQuery = `
        IF NOT EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Role'
        )
        BEGIN
          ALTER TABLE Users ADD Role NVARCHAR(50) DEFAULT 'user';
          PRINT 'Role column added to Users table';
        END
      `;
      await request.query(checkColumnQuery);
    } catch (error) {
      // Column might already exist, ignore error
      console.log('Role column check:', error.message);
    }
    
    // Tạo admin user từ .env nếu có
    const { createAdminUser } = require('./seed');
    await createAdminUser();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  getConnection,
  closeConnection,
  initializeDatabase,
  sql
};

