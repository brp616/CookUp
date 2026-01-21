import express from "express";
import Post from "../models/Post.js"; 

const router = express.Router();

// 1. GET: All posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET: Single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. POST: Create post
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. PATCH: Increment Yums
router.patch("/:id/yum", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.kudos) post.kudos = [];
    const hasYummed = post.kudos.includes(userId);

    if (hasYummed) {
      post.kudos = post.kudos.filter(id => id !== userId);
      post.kudosCount = Math.max(0, (post.kudosCount || 1) - 1);
    } else {
      post.kudos.push(userId);
      post.kudosCount = (post.kudosCount || 0) + 1;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. POST: Add comment (UPDATED with avatar logic)
router.post("/:id/comments", async (req, res) => {
  try {
    const { text, username, userAvatar } = req.body;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          comments: { 
            text, 
            username, 
            userAvatar // Explicitly saving the avatar string
          } 
        } 
      },
      { new: true }
    );
    
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. DELETE: Remove a specific comment
router.delete("/:postId/comments/:commentId", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. DELETE: Remove a post by ID
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. PATCH: Update category
router.patch("/:id/category", async (req, res) => {
  try {
    const { category } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { cookbookCategory: category },
      { new: true }
    );
    if (!updatedPost) return res.status(404).json({ message: "Post not found" });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;