// src/Config/SqlConnection.js
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const sql = require('mssql');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env từ thư mục Back-end (__dirname là src/Config, nên cần lên 2 cấp)
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const dbConfig = {
    user: process.env.DB_User,
    password: process.env.DB_Password,
    server: process.env.DB_Server,
    port: 1434,
    database: process.env.DB_Name,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

const connection = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
            console.log("✅ Kết nối đến cơ sở dữ liệu thành công!");
        }
        return pool; // 🔥 Quan trọng: return pool ra ngoài
    } catch (err) {
        console.error("❌ Lỗi kết nối đến cơ sở dữ liệu:", err);
        throw err;
    }
};

export { sql, connection };
