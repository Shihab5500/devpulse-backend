import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import issueRoutes from './routes/issueRoutes';

dotenv.config();

const app = express();

// JSON ডাটা হ্যান্ডেল করার জন্য মিডলওয়্যার
app.use(express.json());

// রাউটগুলো লিংক করা
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

app.get('/', (req, res) => {
  res.send('DevPulse Backend Server is Running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});