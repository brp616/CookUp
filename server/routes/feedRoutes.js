import express from "express";
import axios from "axios";
import Post from "../models/Post.js";
import User from "../models/user.js";

const pythonUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";

const router = express.Router();

/**
 * GET /api/feed/fresh
 * Purpose: A "True Discover" feed that shows recipes ONLY from 
 * chefs the user does NOT follow and is NOT themselves.
 */
router.get("/fresh", async (req, res) => {
  const { userId } = req.query;

  try {
    let excludeIds = [];

    if (userId && userId !== "undefined") {
      excludeIds.push(userId); 
      const currentUser = await User.findById(userId);
      if (currentUser && currentUser.following) {
        const followingIds = currentUser.following.map(id => id.toString());
        excludeIds = [...excludeIds, ...followingIds];
      }
    }

    // 2. Fetch recommendations from Python AI service
    let recommendedIds = [];
    if (userId && userId !== "undefined") {
      try {
        const pythonResponse = await axios.get(
          `${pythonUrl}/recommend/${userId}`,
          { timeout: 3000 }
        );
        
        // FIX: Access the correct key from your FastAPI response
        recommendedIds = pythonResponse.data.recommendations || [];
        
        console.log(`✅ AI Service returned ${recommendedIds.length} IDs for user ${userId}`);
      } catch (err) {
        console.warn("⚠️ AI Service unreachable or timed out. Falling back to latest.");
      }
    }

    const discoveryQuery = {
      user: { $nin: excludeIds }
    };

   let finalPosts = [];

    if (recommendedIds.length > 0) {
      // Find the posts recommended by AI. 
      // We only exclude the user's OWN posts so they don't see themselves.
      const posts = await Post.find({
        _id: { $in: recommendedIds },
        user: { $ne: userId } // Only exclude YOU, allow people you follow for now
      });

      // Maintain AI ranking order
      finalPosts = recommendedIds
        .map((id) => posts.find((p) => p._id.toString() === id))
        .filter((p) => p !== undefined);
      
      console.log(`✅ AI delivered ${finalPosts.length} posts to the feed.`);
    }

    // 4. Fallback: If AI didn't give enough, fill the rest with "Discovery" posts
    if (finalPosts.length < 10) {
      console.log("Adding discovery posts to fill the gaps...");
      const morePosts = await Post.find({
        user: { $nin: excludeIds }, // Use strict discovery here
        _id: { $nin: finalPosts.map(p => p._id) } // Don't duplicate what AI already found
      })
      .sort({ createdAt: -1 })
      .limit(15);

      finalPosts = [...finalPosts, ...morePosts];
    }

    res.json(finalPosts);

  } catch (err) {
    console.error("Discover Feed Error:", err.message);
    const emergencyPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
    res.json(emergencyPosts);
  }
});

export default router;