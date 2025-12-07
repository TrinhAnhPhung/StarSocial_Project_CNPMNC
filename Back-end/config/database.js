import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Cấu hình kết nối SQL Server
const dbConfig = {
  user: process.env.DB_USER || process.env.DB_User,
  password: process.env.DB_PASSWORD || process.env.DB_Password,
  server: process.env.DB_SERVER || process.env.DB_Server || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.DB_Port || '1433'),
  database: process.env.DB_NAME || process.env.DB_Name || 'StarSocial_primary',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

// Kết nối đến SQL Server
export const connect = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
      console.log('✅ Đã kết nối đến SQL Server database:', dbConfig.database);
    }
    return pool;
  } catch (err) {
    console.error('❌ Lỗi kết nối SQL Server:', err);
    throw err;
  }
};

// Đóng kết nối
export const disconnect = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Đã đóng kết nối SQL Server');
    }
  } catch (err) {
    console.error('❌ Lỗi đóng kết nối:', err);
    throw err;
  }
};

// Khởi tạo kết nối khi load module
connect().catch((err) => {
  console.error('❌ Không thể kết nối đến database:', err.message);
});

export { sql };
