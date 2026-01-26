import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

//model imports
import "./models/user.js"; 
import "./models/Post.js";
import "./models/Cookbook.js"; 

// Route imports
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import cookbookRoutes from "./routes/cookbookRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import metadata from "./routes/metadata.js";

// Load environment variables
dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


/*
   Middleware */

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://cookup-1gl6.onrender.com",/*added in production url*/
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// parsing
app.use(express.json());

/* 
   Database code
 */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* 
   API Routes
*/

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/cookbooks", cookbookRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/users", userRoutes);
app.use('/api', metadata); /*got rid of call to metadata after bug problems*/ 

// Health check
app.get("/health", (req, res) => {
  res.send("Backend is up and running!");
});

/* 
   Frontend Serving (looks)
============================ */

// Serve React build
app.use(express.static(path.join(__dirname, "../client/dist")));

// API 404 handler for debugging
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// React Router fallback
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

//let's blast off!
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
