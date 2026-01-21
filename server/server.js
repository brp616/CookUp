import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import cookbookRoutes from './routes/cookbookRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ============================
   Middleware
============================ */

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://cookup-1gl6.onrender.com'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Body parsing
app.use(express.json());

/* ============================
   Database
============================ */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

/* ============================
   API Routes (MUST come first)
============================ */

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/cookbooks', cookbookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.send('Backend is up and running!');
});

/* ============================
   Frontend Serving
============================ */


// Serve React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API 404 handler (IMPORTANT: before frontend fallback)
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// React Router fallback (ALWAYS last)
app.get('/:path*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});