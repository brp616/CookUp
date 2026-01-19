import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import cookbookRoutes from './routes/cookbookRoutes.js';
import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';

const app = express();

// 1. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://cookup-1gl6.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Required for handling preflight requests
app.use(cors()); // This handles preflight for all routes automatically
// 2. Middleware
app.use(express.json());



// --- CHECK YOUR ROUTES BELOW THIS LINE ---
// Look for any route that looks like: app.get('/api/posts/:', ...) 
// The error "Missing parameter name" means you have a colon with no name after it.

// Example of a CORRECT route with a parameter:
// app.get('/api/posts/:id', (req, res) => { ... }); 

// 4. Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

