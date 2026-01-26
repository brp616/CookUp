import express from "express";
import Post from "../models/Post.js";
import User from "../models/user.js"; 

const router = express.Router();

// --- GET: ALL PUBLIC POSTS (with avatars) ---
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [{ visibility: "public" }, { visibility: { $exists: false } }],
    })
    .populate({
      path: "kudos",
      model: "User", // Explicitly tell Mongoose which model to look for
      select: "username profilePic"
    })
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("FEED CRASH:", err); // Check your terminal for this!
    res.status(500).json({ message: err.message });
  }
});
// --- SEARCH: (with avatars) ---
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Query required" });

  try {
    const posts = await Post.find({
      $or: [{ visibility: "public" }, { visibility: { $exists: false } }],
      $and: [
        {
          $or: [
            { recipeName: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
            { tags: { $regex: q, $options: "i" } },
          ],
        },
      ],
    })
    .populate("kudos", "username profilePic")
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- PATCH: INCREMENT YUMS (Bulletproof Version) ---
router.patch("/:id/yum", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // 1. SAFE INITIALIZATION: Create a local copy of the kudos array
    // If it doesn't exist, we start with an empty array.
    let currentKudos = Array.isArray(post.kudos) ? [...post.kudos] : [];

    const userIdStr = userId.toString();
    
    // 2. CHECK INDEX: Use the local array
    const index = currentKudos.findIndex(id => id && id.toString() === userIdStr);

    if (index > -1) {
      // Remove the user if they already yummed
      currentKudos.splice(index, 1);
    } else {
      // Add the user if they haven't yummed
      currentKudos.push(userId);
    }

    // 3. RE-ASSIGN AND SAVE: Put the modified array back into the post object
    post.kudos = currentKudos;
    post.kudosCount = currentKudos.length;
    
    await post.save();

    // 4. POPULATE: Fetch the fresh data to send to the frontend
    const updatedPost = await Post.findById(req.params.id)
      .populate({
        path: "kudos",
        model: "User",
        select: "username profilePic"
      });

    res.json({
      ...updatedPost._doc,
      kudosData: updatedPost.kudos 
    });
  } catch (err) {
    console.error("Yum Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// --- TIMELINE: (with avatars) ---
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) return res.status(404).json("User not found");

    const followingIds = currentUser.following.map((id) => id.toString());
    const myId = currentUser._id.toString();

    const timelinePosts = await Post.find({
      user: { $in: [...followingIds, myId] },
    })
    .populate("kudos", "username profilePic")
    .sort({ createdAt: -1 });

  res.status(200).json(timelinePosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- REMAINING ROUTES (Same as before but consistent) ---

router.patch("/:id", async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate("kudos", "username profilePic");
    res.json(updatedPost);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("kudos", "username profilePic");
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { text, username, userAvatar } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text, username, userAvatar } } },
      { new: true }
    ).populate("kudos", "username profilePic");
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;