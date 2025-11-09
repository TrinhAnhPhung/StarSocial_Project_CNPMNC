const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getConnection, sql } = require('../config/database');

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email và mật khẩu là bắt buộc' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // Check if user already exists
    const pool = await getConnection();
    const checkRequest = pool.request();
    checkRequest.input('email', sql.NVarChar, email);
    
    const checkResult = await checkRequest.query(
      'SELECT Id FROM Users WHERE Email = @email'
    );

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email đã được sử dụng' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertRequest = pool.request();
    insertRequest.input('email', sql.NVarChar, email);
    insertRequest.input('password', sql.NVarChar, hashedPassword);
    insertRequest.input('fullName', sql.NVarChar, fullName || null);

    const insertResult = await insertRequest.query(
      `INSERT INTO Users (Email, Password, FullName, Role) 
       OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.FullName, INSERTED.Role, INSERTED.CreatedAt
       VALUES (@email, @password, @fullName, 'user')`
    );

    const user = insertResult.recordset[0];

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        id: user.Id,
        email: user.Email,
        fullName: user.FullName,
        role: user.Role || 'user',
        createdAt: user.CreatedAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email và mật khẩu là bắt buộc' 
      });
    }

    // Find user by email
    const pool = await getConnection();
    const request = pool.request();
    request.input('email', sql.NVarChar, email);

    const result = await request.query(
      'SELECT Id, Email, Password, FullName, Role, CreatedAt FROM Users WHERE Email = @email'
    );

    if (result.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    const user = result.recordset[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Update last login time
    const updateRequest = pool.request();
    updateRequest.input('id', sql.Int, user.Id);
    await updateRequest.query(
      'UPDATE Users SET UpdatedAt = GETDATE() WHERE Id = @id'
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        id: user.Id,
        email: user.Email,
        fullName: user.FullName,
        role: user.Role || 'user',
        createdAt: user.CreatedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

module.exports = router;

