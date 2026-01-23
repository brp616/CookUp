import express from "express";
import axios from "axios";
import Post from "../models/Post.js"; // Ensure this path matches your structure

const router = express.Router();

// GET /api/feed/fresh?userId=123
router.get("/fresh", async (req, res) => {
  const { userId } = req.query;

  try {
    // 1. Ask Python for the list of recommended IDs
    // We set a short timeout (1s) so the app doesn't freeze if Python is sleeping
    const pythonResponse = await axios.get(
      `http://127.0.0.1:8000/recommend/${userId}`,
      {
        timeout: 3000,
      },
    );

    const recommendedIds = pythonResponse.data.data;

    // If Python returns nothing (or user has no history), fall back to latest posts
    if (!recommendedIds || recommendedIds.length === 0) {
      console.log("No personal recommendations found. Showing latest posts.");
      const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
      return res.json(latestPosts);
    }

    // 2. Fetch the REAL Post objects from MongoDB using those IDs
    const posts = await Post.find({ _id: { $in: recommendedIds } });

    // 3. Re-sort them!
    // MongoDB returns them in random order, so we force them back into the order Python gave us
    const orderedPosts = recommendedIds
      .map((id) => posts.find((p) => p._id.toString() === id))
      .filter((p) => p !== undefined);

    res.json(orderedPosts);
  } catch (err) {
    console.error("Recommender Service Error:", err.message);

    // FAIL-SAFE: If Python is down or crashes, simply return the newest posts.
    // This ensures your app NEVER breaks, even if the AI feature fails.
    const fallbackPosts = await Post.find().sort({ createdAt: -1 }).limit(10);
    res.json(fallbackPosts);
  }
});

export default router;
