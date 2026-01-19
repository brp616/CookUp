const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// --- EDIT STARTS HERE ---
const allowedOrigins = [
  'http://localhost:5173',               // Local development (Vite)
  'https://cookup-1gl6.onrender.com'     // Your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// --- EDIT ENDS HERE ---

app.use(express.json());

// Ensure your port is dynamic for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});