-- ⚠️ KHUYẾN CÁO: Sử dụng API hoặc Node.js script thay vì chạy SQL trực tiếp
-- Vì mật khẩu cần được hash bằng bcrypt, script SQL này chỉ để tham khảo
-- 
-- CÁCH TỐT NHẤT: Chạy script Node.js
-- cd StarSocial-Community/Back-end
-- node scripts/createAdminAccounts.js

-- Hoặc sử dụng API:
-- POST http://localhost:5000/api/auth/create-admin
-- Header: X-Admin-Secret: admin_secret_key_2024
-- Body: {
--   "email": "admin@starsocial.com",
--   "password": "admin123",
--   "first_name": "Admin",
--   "last_name": "StarSocial",
--   "role": "admin"
-- }

PRINT '========================================';
PRINT 'KHUYẾN CÁO: Sử dụng API hoặc Node.js script';
PRINT 'Để tạo tài khoản với mật khẩu được hash đúng cách';
PRINT '========================================';

-- Script này chỉ tạo tài khoản với mật khẩu tạm thời
-- Sau khi tạo, cần đăng nhập và đổi mật khẩu ngay

-- Tạo tài khoản ADMIN (mật khẩu tạm: admin123)
-- Sau khi tạo, cần reset mật khẩu qua API forgot-password

DECLARE @adminUserId VARCHAR(26) = 'admin' + SUBSTRING(REPLACE(NEWID(), '-', ''), 1, 22);
DECLARE @adminEmail NVARCHAR(255) = 'admin@starsocial.com';
DECLARE @adminFirstName NVARCHAR(255) = 'Admin';
DECLARE @adminLastName NVARCHAR(255) = 'StarSocial';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @adminEmail)
BEGIN
    -- ⚠️ LƯU Ý: Mật khẩu này sẽ không hoạt động vì chưa được hash đúng cách
    -- Cần sử dụng API hoặc Node.js script để hash mật khẩu
    INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability)
    VALUES (
        @adminUserId, 
        @adminEmail, 
        'temp_password_needs_reset', -- Mật khẩu tạm, cần reset
        'temp_salt', 
        @adminFirstName, 
        @adminLastName, 
        'admin', 
        'Normal'
    );
    PRINT '✅ Đã tạo tài khoản Admin (cần reset mật khẩu): ' + @adminEmail;
END
ELSE
BEGIN
    PRINT '⚠️ Tài khoản Admin đã tồn tại: ' + @adminEmail;
END
GO

-- Tạo tài khoản HANDLEREPORT (mật khẩu tạm: handlereport123)

DECLARE @reportUserId VARCHAR(26) = 'report' + SUBSTRING(REPLACE(NEWID(), '-', ''), 1, 22);
DECLARE @reportEmail NVARCHAR(255) = 'handlereport@starsocial.com';
DECLARE @reportFirstName NVARCHAR(255) = 'Handle';
DECLARE @reportLastName NVARCHAR(255) = 'Report';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @reportEmail)
BEGIN
    -- ⚠️ LƯU Ý: Mật khẩu này sẽ không hoạt động vì chưa được hash đúng cách
    -- Cần sử dụng API hoặc Node.js script để hash mật khẩu
    INSERT INTO Users (User_id, Email, Password, Salt, First_Name, Last_name, Role, Reliability)
    VALUES (
        @reportUserId, 
        @reportEmail, 
        'temp_password_needs_reset', -- Mật khẩu tạm, cần reset
        'temp_salt', 
        @reportFirstName, 
        @reportLastName, 
        'handlereport', 
        'Normal'
    );
    PRINT '✅ Đã tạo tài khoản HandleReport (cần reset mật khẩu): ' + @reportEmail;
END
ELSE
BEGIN
    PRINT '⚠️ Tài khoản HandleReport đã tồn tại: ' + @reportEmail;
END
GO

PRINT '========================================';
PRINT '⚠️ QUAN TRỌNG:';
PRINT 'Tài khoản đã được tạo nhưng mật khẩu chưa được hash đúng cách.';
PRINT 'Vui lòng sử dụng API hoặc Node.js script để tạo tài khoản với mật khẩu đúng.';
PRINT '========================================';
