// src/Config/NotificationSqlConnection.js
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const sql = require('mssql');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env từ thư mục Back-end (giống SqlConnection.js)
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

// Cấu hình DB thông báo (database riêng StarSocialNotification)
const dbNotificationConfig = {
  user: process.env.DB_User,
  password: process.env.DB_Password,
  server: process.env.DB_Server,
  port: 1434, // dùng đúng port bạn đang dùng cho DB chính (nếu DB chính 1433 thì đổi cả 2 cho khớp)
  database: process.env.DB_Notification_Name || 'StarSocialNotification',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let notificationPool = null;

const notificationConnection = async () => {
  try {
    if (!notificationPool) {
      // 🔴 trước đây: await sql.connect(dbNotificationConfig);
      // ✅ dùng pool riêng, không ảnh hưởng SqlConnection.js
      notificationPool = await new sql.ConnectionPool(dbNotificationConfig).connect();
      console.log('✅ Kết nối đến cơ sở dữ liệu thông báo thành công!');
    }
    return notificationPool;
  } catch (err) {
    console.error('❌ Lỗi kết nối đến cơ sở dữ liệu thông báo:', err);
    throw err;
  }
};

export { sql, notificationConnection };
