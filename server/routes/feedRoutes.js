import express from "express";
import axios from "axios";
import Post from "../models/Post.js";
import User from "../models/user.js";

const router = express.Router();

// Using the Render env var, fallback to local
const pythonUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";

router.get("/fresh", async (req, res) => {
  const { userId } = req.query;
  // quick check - sometimes frontend sends "undefined" as a string
  const validUser = userId && userId !== "undefined";

  try {
    let excludeIDS = [];
    let recommendedIds = [];

    if (validUser) {
      excludeIDS.push(userId);
      const CurrentUser = await User.findById(userId).lean(); // .lean() for speed
      
      if (CurrentUser?.following) {
        const followingIds = CurrentUser.following.map(id => id.toString());
        excludeIDS = [...excludeIDS, ...followingIds];
      }

      // try the python ai service
      try {
        const pyRes = await axios.get(`${pythonUrl}/recommend/${userId}`, { timeout: 3500 });
        // key check: pyRes.data.recommendations
        recommendedIds = pyRes.data?.recommendations || [];
        console.log(`huzzah! got ${recommendedIds.length} IDs from AI for ${userId}`);
      } catch (err) {
        console.warn("ope - AI timed out. Falling back to latest.");
      }
    }

    let finalPosts = [];

    // try to fill based on what the AI liked
    if (recommendedIds.length > 0) {
      const posts = await Post.find({
        _id: { $in: recommendedIds },
        user: { $ne: userId } // don't show user their own stuff
      }).populate("user", "username");

      // keep the order the AI gave us
      finalPosts = recommendedIds
        .map(id => posts.find(p => p._id.toString() === id))
        .filter(Boolean);
    }

    // if AI failed or we just need more content
    if (finalPosts.length < 10) {
      console.log("filling gaps with recent posts...");
      
      const seenIds = finalPosts.map(p => p._id);
      const morePosts = await Post.find({
        user: { $nin: excludeIDS },
        _id: { $nin: seenIds }
      })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("user", "username");

      finalPosts = [...finalPosts, ...morePosts];
    }

    res.json(finalPosts.slice(0, 20)); // cap it at 20
} catch (err) {
    console.error("Discover Feed Error:", err);
    // last ditch effort
    const emergency = await Post.find().sort({ createdAt: -1 }).limit(10);
    res.json(emergency);
  }});

export default router;