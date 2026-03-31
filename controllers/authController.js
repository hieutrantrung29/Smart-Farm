import pool from '../config/database.js';
import jwt from 'jwt-simple';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
  const { email, user_name, password, user_type = 'operator' } = req.body;

  if (!email || !user_name || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Kiểm tra email đã tồn tại chưa
    const [existing] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Thêm user vào database
    await conn.query(
      'INSERT INTO user (email, user_name, password_hash, user_type) VALUES (?, ?, ?, ?)',
      [email, user_name, hashedPassword, user_type]
    );

    conn.release();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const conn = await pool.getConnection();
    
    const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
    
    if (users.length === 0) {
      conn.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      conn.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last_login_at
    await conn.query('UPDATE user SET last_login_at = NOW() WHERE user_id = ?', [user.user_id]);

    // Tạo JWT token
    const token = jwt.encode(
      { user_id: user.user_id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET
    );

    conn.release();
    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: { user_id: user.user_id, email: user.email, user_name: user.user_name }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};