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
      model: "User",
      select: "username profilePic"
    })
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("FEED CRASH:", err);
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

// --- PATCH: INCREMENT YUMS ---
router.patch("/:id/yum", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    let currentKudos = Array.isArray(post.kudos) ? [...post.kudos] : [];
    const userIdStr = userId.toString();
    const index = currentKudos.findIndex(id => id && id.toString() === userIdStr);

    if (index > -1) {
      currentKudos.splice(index, 1);
    } else {
      currentKudos.push(userId);
    }

    post.kudos = currentKudos;
    post.kudosCount = currentKudos.length;
    await post.save();

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

// --- TIMELINE ---
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

// --- UPDATE POST ---
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

// --- GET SINGLE POST ---
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("kudos", "username profilePic");
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- POST: CREATE NEW RECIPE (UPDATED) ---
router.post("/", async (req, res) => {
  try {
    // Ensure that if the frontend sends cookbookId, we save it!
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) { 
    console.error("CREATE POST ERROR:", err);
    res.status(400).json({ message: err.message }); 
  }
});

// --- POST COMMENTS ---
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

// --- DELETE POST ---
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- PATCH: MOVE TO COOKBOOK (UPDATED) ---
router.patch("/:id/category", async (req, res) => {
  try {
    const { category, cookbookId } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Explicitly update both so the filter in Cookbooks.jsx has two ways to find it
    post.cookbookCategory = category;
    if (cookbookId) {
      post.cookbookId = cookbookId;
    }
    
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    console.error("MOVE CATEGORY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;