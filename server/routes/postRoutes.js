import express from "express";
// Import WITHOUT curly braces because it's a default export
import Post from "../models/post.js"; 

const router = express.Router();

// GET: All posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Create post
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH: Increment Yums
router.patch("/:id/yum", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { kudosCount: 1 } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Add comment
router.post("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: req.body } },
      { new: true } // <--- THIS IS VITAL. It returns the post WITH the new comment.
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: Remove a post by ID
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;