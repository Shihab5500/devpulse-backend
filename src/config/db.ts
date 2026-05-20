import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ডাটাবেজ কানেকশন পুল তৈরি
export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),
});