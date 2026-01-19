import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js"; // Import the router
import cookbookRoutes from "./routes/cookbookRoutes.js"; // Import the router
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// --- LINK ROUTES ---
// This says: "All routes starting with /api/posts should use postRoutes"
app.use("/api/posts", postRoutes);
app.use('/api/cookbooks', cookbookRoutes);
app.use("/api/auth", authRoutes);
// --- DATABASE & SERVER START ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🚀 Connected to MongoDB");
    app.listen(5000, () => console.log("📡 Server running on port 5000"));
  })
  .catch(err => console.error("Connection error:", err));