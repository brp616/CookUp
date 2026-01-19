import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import route files (Ensure these have the .js extension)
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import cookbookRoutes from './routes/cookbookRoutes.js';

// 1. Initialize Dotenv
dotenv.config();

const app = express();

// 2. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',               // Local development
  'https://cookup-1gl6.onrender.com'     // Deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS to ALL routes
app.use(cors(corsOptions));

// 3. Global Middleware
app.use(express.json());

// 4. Database Connection
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });

// 5. Connect Routes
// This maps your route files to specific URL paths
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/cookbooks', cookbookRoutes);

// Health Check (To verify the server is live in a browser)
app.get('/health', (req, res) => res.send('Backend is up and running!'));

// 6. Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});