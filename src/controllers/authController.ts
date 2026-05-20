import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ইউজার রেজিস্ট্রেশন (Signup)
export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Missing required fields' });
    return;
  }

  try {
    // ইমেইল আগে থেকেই আছে কিনা চেক
    const existCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existCheck.rows.length > 0) {
      res.status(400).json({ success: false, message: 'Email already exists' });
      return;
    }

    // পাসওয়ার্ড হ্যাশ করা (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'contributor';

    // ইউজার ডাটা সেভ করা (Raw SQL)
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at',
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ইউজার লগইন (Login)
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // ইউজার না পাওয়া গেলে
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // পাসওয়ার্ড চেক করা
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // টোকেন তৈরি করা (id, name, role দিয়ে)
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'my_super_secret_key_123',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};