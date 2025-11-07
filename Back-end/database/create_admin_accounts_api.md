# Hướng dẫn tạo tài khoản Admin và HandleReport

## Cách 1: Sử dụng API (Khuyến nghị)

### Endpoint
```
POST /api/auth/create-admin
```

### Headers
```
Content-Type: application/json
X-Admin-Secret: admin_secret_key_2024
```

### Body (JSON)
```json
{
  "email": "admin@starsocial.com",
  "password": "admin123",
  "first_name": "Admin",
  "last_name": "StarSocial",
  "role": "admin",
  "secret": "admin_secret_key_2024"
}
```

### Ví dụ với cURL
```bash
# Tạo tài khoản Admin
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: admin_secret_key_2024" \
  -d '{
    "email": "admin@starsocial.com",
    "password": "admin123",
    "first_name": "Admin",
    "last_name": "StarSocial",
    "role": "admin"
  }'

# Tạo tài khoản HandleReport
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: admin_secret_key_2024" \
  -d '{
    "email": "handlereport@starsocial.com",
    "password": "handlereport123",
    "first_name": "Handle",
    "last_name": "Report",
    "role": "handlereport"
  }'
```

### Ví dụ với Postman
1. Method: POST
2. URL: `http://localhost:5000/api/auth/create-admin`
3. Headers:
   - `Content-Type: application/json`
   - `X-Admin-Secret: admin_secret_key_2024`
4. Body (raw JSON):
```json
{
  "email": "admin@starsocial.com",
  "password": "admin123",
  "first_name": "Admin",
  "last_name": "StarSocial",
  "role": "admin"
}
```

## Cách 2: Sử dụng SQL Script

Chạy file `create_admin_accounts.sql` trong SQL Server Management Studio.

**Lưu ý:** Script SQL sử dụng mật khẩu đã hash sẵn, nhưng khuyến nghị sử dụng API để tự động hash mật khẩu đúng cách.

## Cách 3: Sử dụng Node.js Script

Tạo file `createAdmin.js` trong thư mục Back-end:

```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { sql, connection } = require('./src/Config/SqlConnection.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createAdmin() {
  try {
    const pool = await connection();
    
    const email = 'admin@starsocial.com';
    const password = 'admin123';
    const first_name = 'Admin';
    const last_name = 'StarSocial';
    const role = 'admin';
    
    // Check if exists
    const check = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT TOP 1 * FROM Users WHERE Email = @email');
    
    if (check.recordset.length > 0) {
      console.log('Tài khoản đã tồn tại');
      return;
    }
    
    // Hash password
    const saltUser = crypto.randomBytes(8).toString('hex');
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + saltUser, bcryptSalt);
    
    // Insert
    await pool.request()
      .input('User_id', sql.VarChar(26), crypto.randomUUID().slice(0, 26))
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('Salt', sql.NVarChar(16), saltUser)
      .input('First_Name', sql.NVarChar, first_name)
      .input('Last_name', sql.NVarChar, last_name)
      .input('Role', sql.NVarChar, role)
      .query(`
        INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability)
        VALUES (@User_id, @email, @password, @Salt, @First_Name, @Last_name, @Role, 'Normal');
      `);
    
    console.log('✅ Đã tạo tài khoản admin thành công!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createAdmin();
```

Chạy: `node createAdmin.js`

## Thông tin đăng nhập mặc định

### Admin
- **Email:** admin@starsocial.com
- **Password:** admin123
- **URL:** http://localhost:5173/admin

### HandleReport
- **Email:** handlereport@starsocial.com
- **Password:** handlereport123
- **URL:** http://localhost:5173/processor

## Bảo mật

1. **Secret Key:** Đổi `ADMIN_SECRET_KEY` trong file `.env`:
   ```
   ADMIN_SECRET_KEY=your_super_secret_key_here
   ```

2. **Đổi mật khẩu:** Sau khi đăng nhập, vui lòng đổi mật khẩu ngay!

3. **Xóa endpoint:** Trong môi trường production, nên xóa hoặc bảo vệ endpoint `/api/auth/create-admin` bằng IP whitelist.

