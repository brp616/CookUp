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
import Post from "./models/Post.js";
import User from "./models/user.js";
import Cookbook from "./models/Cookbook.js";

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


//temporary migration function to update cookbookId format
const runMigration = async () => {
  try {
    // 1. Find posts where cookbookId is a single string (not an array)
    const postsToFix = await Post.find({ 
      cookbookId: { $exists: true, $not: { $type: "array" } } 
    });

    if (postsToFix.length > 0) {
      console.log(`[Migration] Found ${postsToFix.length} posts to convert to arrays...`);
      
      for (let post of postsToFix) {
        const oldId = post.cookbookId;
        await Post.updateOne(
          { _id: post._id },
          { $set: { cookbookId: [oldId] } }
        );
      }
      console.log("[Migration] Successfully converted all IDs to arrays.");
    } else {
      console.log("[Migration] No legacy string IDs found. Database is clean.");
    }
  } catch (err) {
    console.error("[Migration] Error during migration:", err);
  }
};

//similar temporary route to make empty cookbooks for all existing users if they don't exist
const generateMissingCookbooks = async () => {
  try {
    console.log("--- Checking for users without cookbooks ---");
    const users = await User.find();

    for (const user of users) {
      // Check if this user already has ANY cookbook
      const existingBooks = await Cookbook.find({ userId: user._id });

      if (existingBooks.length === 0) {
        console.log(`Creating default cookbooks for user: ${user.username || user.email}`);

        const defaults = [
          { title: "To Cook", userId: user._id, category: "to-cook", icon: "⏳", color: "#a2d2f3" },
    { title: "Cooked", userId: user, category: "cooked", icon: "🍳", color: "#a2f3a2" }
        ];

        await Cookbook.insertMany(defaults);
      }
    }
    console.log("--- Cookbook check complete ---");
  } catch (err) {
    console.error("Migration Error:", err);
  }
};

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

//temporary migration and cookbook generation
//await runMigration();
//await Cookbook.deleteMany({ title: { $in: ["Favorites", "Want to Try", "Family Recipes"] } });
//await generateMissingCookbooks(); 

//let's blast off!
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
