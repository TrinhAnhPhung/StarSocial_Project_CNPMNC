import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env từ thư mục Back-end
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Cấu hình kết nối SQL Server từ file .env
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

// Hàm kết nối đến SQL Server
const connect = async () => {
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

// Khởi tạo kết nối khi load module
connect().catch((err) => {
  console.error('❌ Không thể kết nối đến database:', err.message);
});

// Wrapper để tương thích với cách sử dụng PostgreSQL (pool.query())
const poolWrapper = {
  query: async (queryText, params = []) => {
    try {
      const poolInstance = await connect();
      const request = poolInstance.request();
      
      // Chuyển đổi cú pháp PostgreSQL sang SQL Server
      let sqlQuery = queryText;
      
      // Thay thế RANDOM() bằng NEWID() cho SQL Server (nếu chưa có NEWID())
      if (!sqlQuery.includes('NEWID()')) {
        sqlQuery = sqlQuery.replace(/ORDER BY RANDOM()/gi, 'ORDER BY NEWID()');
      }
      
      // Thay thế LIMIT bằng TOP (chỉ xử lý LIMIT đơn giản)
      const limitMatch = sqlQuery.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const limitValue = limitMatch[1];
        // Tìm SELECT và thêm TOP vào sau SELECT
        sqlQuery = sqlQuery.replace(/SELECT\s+/i, `SELECT TOP ${limitValue} `);
        sqlQuery = sqlQuery.replace(/LIMIT\s+\d+/i, '');
      }
      
      // Chuyển đổi $1, $2, ... sang @p1, @p2, ...
      const paramMap = {};
      params.forEach((param, index) => {
        const paramName = `p${index + 1}`;
        sqlQuery = sqlQuery.replace(new RegExp(`\\$${index + 1}\\b`, 'g'), `@${paramName}`);
        paramMap[paramName] = param;
      });
      
      // Thêm các parameter vào request
      Object.keys(paramMap).forEach((key) => {
        const value = paramMap[key];
        // Xác định kiểu dữ liệu
        if (value === null || value === undefined) {
          request.input(key, sql.NVarChar, null);
        } else if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            request.input(key, sql.Int, value);
          } else {
            request.input(key, sql.Float, value);
          }
        } else if (typeof value === 'boolean') {
          request.input(key, sql.Bit, value);
        } else {
          request.input(key, sql.NVarChar, value);
        }
      });
      
      // Thực thi query
      const result = await request.query(sqlQuery);
      
      // Trả về kết quả tương thích với PostgreSQL format
      return {
        rows: result.recordset || [],
        rowCount: result.rowsAffected?.[0] || 0,
      };
    } catch (err) {
      console.error('❌ Lỗi khi thực thi query:', err);
      console.error('Query:', queryText);
      throw err;
    }
  },
};

// Export pool wrapper
export default poolWrapper;
