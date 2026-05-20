import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// রিকোয়েস্ট অবজেক্টে ইউজারের ডাটা রাখার জন্য ইন্টারফেস তৈরি
export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  // যদি টোকেন না পাঠানো হয়
  if (!token) {
    res.status(401).json({ success: false, message: 'Authorization header missing' });
    return;
  }

  try {
    // টোকেন ভেরিফাই করা
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key_123') as any;
    
    // টোকেন থেকে আইডি, নাম ও রোল রিকোয়েস্টে সেট করা
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};